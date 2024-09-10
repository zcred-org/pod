import type { JalProgram } from '@jaljs/core';
import { isHttpURL, isObject } from '@zcredjs/core';

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

function isSelector(obj: unknown): obj is Selector {
  return isObject(obj)
    && 'meta' in obj && isObject(obj.meta)
    && 'issuer' in obj.meta && isObject(obj.meta.issuer)
    && 'type' in obj.meta.issuer && typeof obj.meta.issuer.type === 'string'
    && 'uri' in obj.meta.issuer && isHttpURL(obj.meta.issuer.uri)
    && 'attributes' in obj && isObject(obj.attributes)
    && 'subject' in obj.attributes && isObject(obj.attributes.subject)
    && 'id' in obj.attributes.subject && isObject(obj.attributes.subject.id)
    && 'type' in obj.attributes.subject.id && typeof obj.attributes.subject.id.type === 'string'
    && 'key' in obj.attributes.subject.id && typeof obj.attributes.subject.id.key === 'string'
}

function isJalProgram(obj: unknown): obj is JalProgram {
  return isObject(obj)
    && 'target' in obj && typeof obj.target === 'string'
    && 'inputSchema' in obj && isObject(obj.inputSchema)
    && 'private' in obj.inputSchema && isObject(obj.inputSchema.private)
    && ('public' in obj.inputSchema ? isObject(obj.inputSchema.public) : true)
    && 'commands' in obj && Array.isArray(obj.commands)
    && ('options' in obj ? isObject(obj.options) : true)
}

export function isProposal(obj: unknown): obj is Proposal {
  return isObject(obj)
    && 'verifierURL' in obj && isHttpURL(obj.verifierURL)
    && 'challenge' in obj && isObject(obj.challenge)
    && 'message' in obj.challenge && typeof obj.challenge.message === 'string'
    && 'program' in obj && isObject(obj.program) && isJalProgram(obj.program)
    && 'selector' in obj && isObject(obj.selector) && isSelector(obj.selector)
    && ('verificationKey' in obj ? typeof obj.verificationKey === 'string' : true)
    && ('provingKey' in obj ? typeof obj.provingKey === 'string' : true)
    && ('accessToken' in obj ? typeof obj.accessToken === 'string' : true)
    && ('comment' in obj ? typeof obj.comment === 'string' : true);
}

export type Proposal = {
  verifierURL: string;
  challenge: { message: string; }
  program: JalProgram;
  selector: Selector;
  verificationKey?: string;
  provingKey?: string;
  accessToken?: string;
  comment?: string;
}

type Json = boolean | number | string | { [key: string]: Json };

export type ProvingResult = {
  proof: string;
  signature: string;
  message: string; // Proposal.challenge.message
  publicOutput?: Json
  verificationKey?: string;
  provingKey?: string;
}

export type ProvingResultUnsigned = Omit<ProvingResult, 'signature' | 'message'>;

export type VerifierResponse = undefined | {
  redirectURL?: string
}
