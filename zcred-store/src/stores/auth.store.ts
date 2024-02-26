import ms from 'ms';

export class AuthStore {
  // TODO: How about running multiple replicas of the application?
  private nonces: Map<string, {
    nonce: string;
    validUntil: number;
  }> = new Map();

  constructor() {
    setInterval(() => {
      const now = Date.now();
      for (const [did, nonce] of this.nonces) {
        if (nonce.validUntil < now) {
          this.nonces.delete(did);
        }
      }
    }, ms('1h'));
  }

  public getNonce(did: string) {
    let nonce = this.nonces.get(did);
    if (nonce && nonce.validUntil > Date.now()) {
      return nonce;
    }
    nonce = {
      nonce: crypto.randomUUID(),
      validUntil: Date.now() + ms('30m'), // TODO: Change time
    };
    this.nonces.set(did, nonce);
    return nonce;
  }
}
