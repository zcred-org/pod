import type { ZkCredential } from '@zcredjs/core';
import * as u8a from 'uint8arrays';

export function codeToURL(code: string): string {
  const decodedProgram = u8a.toString(u8a.fromString(code), 'base64');
  return `data:application/javascript;base64,${decodedProgram}`;
}

export type JalSetup = {
  private: {
    credential: ZkCredential;
  }
  public: {
    context: {
      now: string;
    }
  }
}

export function toJalSetup(credential: ZkCredential): JalSetup {
  return {
    private: {
      credential: credential,
    },
    public: {
      context: {
        now: new Date().toISOString(),
      },
    },
  };
}
