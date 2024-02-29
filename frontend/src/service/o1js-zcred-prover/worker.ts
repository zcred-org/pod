import {
  isWorkerInitReq,
  isWorkerMessage,
  isWorkerProofReq,
  O1JSZkProgramModule,
  WorkerError,
  WorkerInitResp,
  WorkerProofReq,
  WorkerProofResp,
  WorkerReq
} from "./types.ts";
import * as o1js from "o1js";
import { ZkProgramInputTransformer, ZkProgramTranslator } from "@jaljs/o1js";
import { InputTransformer, JalProgram } from "@jaljs/core";
import { O1TrGraph } from "o1js-trgraph";
import { codeToURL, JalSetup, toJalSetup } from "@/util/index.ts";

const programInputTransformer = new ZkProgramInputTransformer(o1js);
const translator = new ZkProgramTranslator(o1js, "module");
const trGraph = new O1TrGraph(o1js);


async function createZkProof({
  id: reqId,
  credential,
  jalProgram
}: WorkerProofReq): Promise<WorkerProofResp | WorkerError> {
  try {
    const code = translator.translate(jalProgram);
    const url = codeToURL(code);
    const module: O1JSZkProgramModule = await import(/* @vite-ignore */ url);
    const { zkProgram, PublicInput } = module.initialize(o1js);
    const { verificationKey } = await zkProgram.compile();
    const setup = toJalSetup(credential);
    const programInput = toProgramInput(setup, jalProgram);
    const proof = await zkProgram.execute(
      new PublicInput(programInput.public),
      ...programInput.private
    );
    const jsonProof = proof.toJSON();
    const originInput = toOriginIniput(setup, jalProgram);
    return {
      id: reqId,
      type: "proof-resp",
      result: {
        proof: jsonProof.proof,
        verificationKey: verificationKey.data,
        publicInput: originInput.public
      }
    };
  } catch (e) {
    return {
      id: reqId,
      type: "error",
      message: (e as any).message
    };
  }
}

function toProgramInput(setup: JalSetup, program: JalProgram) {
  return programInputTransformer.transform(setup, program.inputSchema);
}

function toOriginIniput(setup: JalSetup, program: JalProgram): { public: any } {
  return new InputTransformer(program.inputSchema, trGraph).toInput(setup) as { public: any };
}

addEventListener("message", async ({ data }: MessageEvent<WorkerReq>) => {
  if (isWorkerInitReq(data)) {
    const resp: WorkerInitResp = {
      id: data.id,
      type: "init-resp",
      initialized: true
    };
    postMessage(resp);
  }
  if (isWorkerProofReq(data)) {
    const resp = await createZkProof(data);
    postMessage(resp);
  } else if (isWorkerMessage(data)) {
    postMessage({
      id: data.id,
      type: "error",
      message: `Invalid worker request`
    }satisfies WorkerError);
  }
});

postMessage({
  id: 0,
  type: "init-resp",
  initialized: true
} satisfies WorkerInitResp);