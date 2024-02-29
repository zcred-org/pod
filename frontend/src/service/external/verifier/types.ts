import { JalProgram } from "@jaljs/core";

export type Selector = {
  meta: {
    issuer: {
      type: string;
      uri: string;
    }
  },
  attributes: {
    subject: {
      id: {
        type: string;
        key: string;
      }
    }
  }
}


export type Proposal = {
  verifierURL: string;
  challenge: { message: string; }
  program: JalProgram;
  selector: Selector;
  verificationKey?: string;
  provingKey?: string;
  accessToken?: string;
}

type Json = boolean | number | string | {[key: string]: Json};

export type ProvingResult = {
  proof: string;
  signature: string;
  publicInput?: Json
  publicOutput?: Json
  verificationKey?: string;
  provingKey?: string;
}