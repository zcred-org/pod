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

export type JalProgram = any;

export type Proposal = {
  verifierURL: string;
  program: JalProgram;
  selector: Selector;
  verificationKey?: string;
  provingKey?: string;
  accessToken?: string;
}

export type ProvingResult = {
  proof: string;
  publicInput?: { [key: string]: string | boolean | number }
  publicOutput?: { [key: string]: string | boolean | number }
  verificationKey?: string;
  provingKey?: string;
}