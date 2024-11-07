/* eslint-disable @typescript-eslint/no-explicit-any */
import { type JalProgram } from '@jaljs/core';
import { type ZkCredential } from '@zcredjs/core';
import { bindAll } from 'lodash-es';
import { toast } from 'sonner';
import {
  isWorkerError,
  isWorkerInitResp,
  isWorkerProofResp,
  isWorkerResp,
  isWorkerVerifyProofResp,
  type WorkerInitReq,
  type WorkerProofReq,
  type WorkerProofResp,
  type WorkerResp,
  type WorkerVerifyProofReq,
  type WorkerVerifyProofResp,
} from './types.ts';
import type { ProvingResultUnsigned } from '../external/verifier/types.ts';


type CreateProofInput = {
  credential: ZkCredential;
  jalProgram: JalProgram
}

export class O1JSZCredProver {
  static #instance: O1JSZCredProver;
  #nextReqId = 1;
  readonly #worker: Worker;
  readonly #initPromise: Promise<WorkerInitReq>;
  readonly #promises: Record<number, {
    resolve: (res: any) => void;
    reject: (err: any) => void
  }> = {};

  static get instance() {
    O1JSZCredProver.#instance ??= new O1JSZCredProver();
    return O1JSZCredProver.#instance;
  }

  private constructor() {
    bindAll(this);
    this.#initPromise = new Promise<WorkerInitReq>((resolve, reject) => {
      this.#promises[0] = { resolve, reject };
    });
    console.time('ProofWorker: Initialized');
    this.#worker = new Worker(new URL(`./worker.ts`, import.meta.url), { type: 'module' });
    const description = 'Please, reload the page or try another browser or device or enable WebWorkers in your browser settings.';
    const initTimeout = setTimeout(() => {
      toast.error(`ProofWorker initialization timeout. Proof can't be created.`, { description, duration: Infinity });
    }, 60_000);
    this.#worker.onmessage = ({ data }: MessageEvent<WorkerResp>) => {
      if (isWorkerResp(data)) {
        if (isWorkerInitResp(data)) {
          clearTimeout(initTimeout);
          console.timeEnd('ProofWorker: Initialized');
        }
        if (isWorkerError(data)) this.#promises[data.id].reject(new Error(data.message));
        else this.#promises[data.id].resolve(data);
        delete this.#promises[data.id];
      } else {
        const msg = 'ProofWorker sent unknown message type.';
        console.error(msg, data);
        toast.error(msg, { description, duration: Infinity });
      }
    };
  }

  async createProof({ credential, jalProgram }: CreateProofInput): Promise<ProvingResultUnsigned> {
    await this.#initPromise;
    console.time('createProof');
    const res = await new Promise<WorkerProofResp>((resolve, reject) => {
      const id = this.#nextReqId++;
      this.#promises[id] = { resolve, reject };
      this.#worker.postMessage({
        id,
        type: 'proof-req',
        credential,
        jalProgram,
      } satisfies WorkerProofReq);
    });
    console.timeEnd('createProof');
    if (isWorkerProofResp(res)) return res.result;
    throw new Error(`Invalid worker response`);
  }

  async verifyZkProof(input: Pick<WorkerVerifyProofReq, 'zkpResult' | 'jalProgram'>): Promise<boolean> {
    await this.#initPromise;
    console.time('verifyZkProof');
    const res = await new Promise<WorkerVerifyProofResp>((resolve, reject) => {
      const id = this.#nextReqId++;
      this.#promises[id] = { resolve, reject };
      this.#worker.postMessage({
        id,
        type: 'verify-req',
        jalProgram: input.jalProgram,
        zkpResult: input.zkpResult,
      } satisfies WorkerVerifyProofReq);
    });
    console.timeEnd('verifyZkProof');
    if (isWorkerVerifyProofResp(res)) return res.result;
    throw new Error(`Invalid worker response`);
  }
}
