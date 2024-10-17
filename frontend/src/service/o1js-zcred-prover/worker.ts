/* eslint-disable @typescript-eslint/no-explicit-any */
import { InputTransformer, type JalProgram } from "@jaljs/core";
import { ZkProgramInputTransformer, ZkProgramTranslator } from "@jaljs/o1js";
import type { Bool, Field, PrivateKey, PublicKey, Signature, UInt64 } from "o1js";
import * as o1js from "o1js";
import { O1TrGraph } from "o1js-trgraph";
import sortKeys from "sort-keys";
import { codeToURL } from "@/util/index.ts";
import { jalSetupFrom, type JalSetup } from '@/util/jal-setup.ts';
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
  type WorkerVerifyProofResp,
  type WorkerMessage,
} from "./types.ts";


const programInputTransformer = new ZkProgramInputTransformer(o1js);
const trGraph = new O1TrGraph(o1js);
const cjsTranslator = new ZkProgramTranslator(o1js, "commonjs");
const mjsTranslator = new ZkProgramTranslator(o1js, "module");

type O1Type = PrivateKey | PublicKey | Signature | Bool | Field | UInt64

type ZKJsonProof = {
  publicInput: any[];
  proof: string;
  publicOutput: never[];
  maxProofsVerified: number;
}

async function createZkProof({
  id: reqId,
  credential,
  jalProgram,
}: WorkerProofReq): Promise<WorkerProofResp | WorkerError> {
  try {
    const { verificationKey, PublicInput, zkProgram } = await initializeZkProgram(jalProgram);
    const setup = jalSetupFrom(credential);
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
    const { verificationKey } = await initializeZkProgram(req.jalProgram);
    const publicInput = new InputTransformer(req.jalProgram.inputSchema, trGraph)
      .transformPublicInput<Record<string, any>, O1Type[]>({ public: sortKeys(req.zkpResult.publicInput, { deep: true }) })
      .linear
      .flatMap((it) => it.toFields().map((it) => it.toJSON()));
    const jsonProof = {
      publicInput: publicInput,
      publicOutput: [],
      proof: req.zkpResult.proof,
      maxProofsVerified: 0
    } satisfies ZKJsonProof;
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
  jalProgram.target = jalProgram.target.replace(/\.cjs$/, ".mjs");
  const translator = jalProgram.target.endsWith(".cjs") ? cjsTranslator : mjsTranslator;
  const code = translator.translate(jalProgram);
  const url = codeToURL(code);
  const module: O1JSZkProgramModule = await import(/* @vite-ignore */ url);
  const { zkProgram, PublicInput } = module.initialize(o1js);
  const { verificationKey } = await zkProgram.compile();
  return { PublicInput, zkProgram, verificationKey };
}

async function toProgramInput(setup: JalSetup, program: JalProgram) {
  return programInputTransformer.transform(setup, program.inputSchema);
}

async function toOriginInput(setup: JalSetup, program: JalProgram): Promise<{ public: any }> {
  return new InputTransformer(program.inputSchema, trGraph).toInput(setup) as { public: any };
}

addEventListener("message", async ({ data }: MessageEvent<WorkerReq>) => {
  if (isWorkerInitReq(data)) {
    postMessage({
      id: data.id,
      type: "init-resp",
      initialized: true,
    } satisfies WorkerInitResp);
  } else if (isWorkerVerifyProofReq(data)) {
    postMessage(await verifyZkResult(data));
  } else if (isWorkerProofReq(data)) {
    postMessage(await createZkProof(data));
  } else if (isWorkerMessage(data)) {
    postMessage({
      id: (data as WorkerMessage).id,
      type: "error",
      message: "Invalid worker request",
    } satisfies WorkerError);
  }
});

postMessage({
  id: 0,
  type: "init-resp",
  initialized: true,
} satisfies WorkerInitResp);
