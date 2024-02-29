import {
  isWorkerError,
  isWorkerProofResp,
  isWorkerResp,
  type WorkerError,
  type WorkerInitReq,
  type WorkerProofReq, WorkerProofResp,
  type WorkerResp
} from "./types.ts";
import { type ZkCredential } from "@zcredjs/core";
import { type JalProgram } from "@jaljs/core";
import { type ProvingResult } from "../external/verifier/types.ts";

type CreateProofInput = {
  credential: ZkCredential;
  jalProgram: JalProgram
}

export class O1JSZCredProver {
  private readonly worker: Worker;
  private idCount: number;
  private readonly promises: {
    [id: number]: { resolve: (res: any) => void; reject: (err: any) => void };
  } = {};
  private readonly workerInitialize: Promise<WorkerInitReq>;

  constructor() {
    this.createProof = this.createProof.bind(this);

    this.idCount = 1;
    this.workerInitialize = new Promise((resolve, reject) => {
      this.promises[0] = { resolve, reject };
    });
    this.worker = new Worker(new URL(`./worker.ts`, import.meta.url), { type: "module" });
    this.worker.onmessage = ({ data }: MessageEvent<WorkerResp>) => {
      if (isWorkerResp(data)) {
        console.log(data);
        this.promises[data.id].resolve(data);
        delete this.promises[data.id];
      }
    };
  }

  async createProof({
    credential,
    jalProgram
  }: CreateProofInput): Promise<Omit<ProvingResult, "signature">> {
    await this.workerInitialize;
    const workerResp = await new Promise<
      WorkerProofResp | WorkerError
    >((resolve, reject) => {
      this.promises[this.idCount] = { resolve, reject };
      const workerReq: WorkerProofReq = {
        id: this.idCount,
        type: "proof-req",
        credential: credential,
        jalProgram: jalProgram
      };
      this.idCount++;
      this.worker.postMessage(workerReq);
    });
    if (isWorkerProofResp(workerResp)) return workerResp.result;
    if (isWorkerError(workerResp)) throw new Error(workerResp.message);
    throw new Error(`Invalid worker response`);
  }
}