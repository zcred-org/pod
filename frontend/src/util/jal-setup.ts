import type { ZkCredential } from '@zcredjs/core';


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

export function jalSetupFrom(credential: ZkCredential): JalSetup {
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
