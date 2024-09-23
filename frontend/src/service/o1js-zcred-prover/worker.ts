/* eslint-disable @typescript-eslint/no-explicit-any */
import { InputTransformer, type JalProgram } from "@jaljs/core";
import { ZkProgramInputTransformer, ZkProgramTranslator } from "@jaljs/o1js";
import { O1TrGraph } from "o1js-trgraph";
import { config } from "@/config";
import { codeToURL, type JalSetup, toJalSetup } from "@/util/index.ts";

import {
  isWorkerInitReq,
  isWorkerMessage,
  isWorkerProofReq,
  isWorkerVerifyProofReq,
  type O1JSZkProgramModule,
  type WorkerError,
  type WorkerInitResp,
  type WorkerProofReq,
  type WorkerProofResp,
  type WorkerReq,
  type WorkerVerifyProofReq,
  type WorkerVerifyProofResp
} from "./types.ts";
import sortKeys from "sort-keys";

let __programInputTransformer: ZkProgramInputTransformer | null = null;
let __mjsTranslator: ZkProgramTranslator | null = null;
let __cjsTranslator: ZkProgramTranslator | null = null;
let __trGraph: O1TrGraph | null = null;
let __o1js: null | typeof import("o1js") = null;

type O1Type = any;

type ZKJsonProof = {
  publicInput: any[];
  proof: string;
  publicOutput: never[];
  maxProofsVerified: number;
}

async function initializeO1JS() {
  if (!__o1js || !__trGraph || !__cjsTranslator || !__mjsTranslator || !__programInputTransformer) {
    __o1js = await import("o1js");
    __trGraph = new O1TrGraph(__o1js);
    __cjsTranslator = new ZkProgramTranslator(__o1js, "commonjs");
    __mjsTranslator = new ZkProgramTranslator(__o1js, "module");
    __programInputTransformer = new ZkProgramInputTransformer(__o1js);
  }
  return {
    o1js: __o1js,
    trGraph: __trGraph,
    cjsTranslator: __cjsTranslator,
    mjsTranslator: __mjsTranslator,
    programInputTransformer: __programInputTransformer
  };
}

async function createZkProof({
  id: reqId,
  credential,
  jalProgram,
}: WorkerProofReq): Promise<WorkerProofResp | WorkerError> {
  try {
    const { verificationKey, PublicInput, zkProgram } = await initializeZkProgram(jalProgram);
    const setup = toJalSetup(credential);
    const programInput = await toProgramInput(setup, jalProgram);
    const proof = await zkProgram.execute(
      new PublicInput(programInput.public),
      ...programInput.private,
    );
    const jsonProof = proof.toJSON();
    const originInput = await toOriginInput(setup, jalProgram);
    return {
      id: reqId,
      type: "proof-resp",
      result: {
        proof: jsonProof.proof,
        verificationKey: verificationKey.data,
        publicInput: originInput.public,
      },
    };
  } catch (e) {
    return {
      id: reqId,
      type: "error",
      message: (e as any).message,
    };
  }
}

async function verifyZkResult(req: WorkerVerifyProofReq): Promise<WorkerVerifyProofResp | WorkerError> {
  try {
    const { trGraph } = await initializeO1JS();
    const { verificationKey } = await initializeZkProgram(req.jalProgram);
    const publicInput = new InputTransformer(req.jalProgram.inputSchema, trGraph)
      .transformPublicInput<{}, O1Type[]>({ public: sortKeys(req.zkpResult.publicInput, { deep: true }) })
      .linear
      .flatMap(
        // @ts-expect-error
        (it) => it.toFields().map((it) => it.toJSON())
      );
    const jsonProof = {
      publicInput: publicInput,
      publicOutput: [],
      proof: req.zkpResult.proof,
      maxProofsVerified: 0
    } satisfies ZKJsonProof;
    const { o1js } = await initializeO1JS();
    const isVerified = await o1js.verify(jsonProof as any, verificationKey as any);
    return {
      id: req.id,
      type: "verify-resp",
      result: isVerified
    };
  } catch (e) {
    return {
      id: req.id,
      type: "error",
      message: (e as any).message
    };
  }
}

async function initializeZkProgram(jalProgram: JalProgram) {
  const { cjsTranslator, mjsTranslator, o1js } = await initializeO1JS();
  const args = config.isDev
    ? [/\.cjs$/, ".mjs"] as const
    : [/\.mjs$/, ".cjs"] as const;
  jalProgram.target = jalProgram.target.replace(args[0], args[1]);
  const translator = jalProgram.target.endsWith(".cjs") ? cjsTranslator : mjsTranslator;
  const code = translator.translate(jalProgram);
  const url = codeToURL(code);
  const module: O1JSZkProgramModule = await import(/* @vite-ignore */ url);
  const { zkProgram, PublicInput } = module.initialize(o1js);
  const { verificationKey } = await zkProgram.compile();
  return { zkProgram, PublicInput, verificationKey };
}

async function toProgramInput(setup: JalSetup, program: JalProgram) {
  const { programInputTransformer } = await initializeO1JS();
  return programInputTransformer.transform(setup, program.inputSchema);
}

async function toOriginInput(setup: JalSetup, program: JalProgram): Promise<{ public: any }> {
  const { trGraph } = await initializeO1JS();
  return new InputTransformer(program.inputSchema, trGraph).toInput(setup) as { public: any };
}

addEventListener("message", async ({ data }: MessageEvent<WorkerReq>) => {
  if (isWorkerInitReq(data)) {
    const resp: WorkerInitResp = {
      id: data.id,
      type: "init-resp",
      initialized: true,
    };
    postMessage(resp);
  }
  if (isWorkerVerifyProofReq(data)) {
    const resp = await verifyZkResult(data);
    postMessage(resp);
  }
  if (isWorkerProofReq(data)) {
    const resp = await createZkProof(data);
    postMessage(resp);
  } else if (isWorkerMessage(data)) {
    postMessage({
      id: data.id,
      type: "error",
      message: `Invalid worker request`,
    }satisfies WorkerError);
  }
});

postMessage({
  id: 0,
  type: "init-resp",
  initialized: true,
} satisfies WorkerInitResp);
