import { hash as sha256 } from '@stablelib/sha256';
import { type JWSSignature } from '@didtools/codecs';
import * as u8a from 'uint8arrays';
import KeyResolver from 'key-did-resolver';
import { DID } from 'dids';
import { Ed25519Provider } from 'key-did-provider-ed25519';
import { InvalidSignatureError } from '../errors/invalid-signature.error.js';
import { tokens } from '../util/tokens.js';
import { type AuthStore } from '../stores/auth.store.js';
import { type HttpServer } from '../backbone/http-server.js';
import { type JwtPayloadCrete } from '../types/jwt-payload.js';
import { Config } from '../backbone/config.js';

export class AuthService {
  private did: DID = null as never;

  private readonly jwt;

  public static readonly inject = tokens('authStore', 'httpServer', 'config');

  constructor(
    private readonly authStore: AuthStore,
    httpServer: HttpServer,
    private readonly config: Config,
  ) {
    this.jwt = httpServer.fastify.jwt;
  }

  public async register() {
    // TODO: did for signature verification create as on the client? Is it important which seed to use?
    const provider = new Ed25519Provider(sha256(u8a.fromString(this.config.secretString)));
    this.did = new DID({ provider, resolver: KeyResolver.getResolver() });
    await this.did.authenticate();
  }

  public async getNonce(did: string): Promise<string> {
    return this.authStore.getNonce(did).nonce;
  }

  public async generateJwt(did: string, signature: JWSSignature): Promise<string> {
    const { nonce, validUntil } = this.authStore.getNonce(did);
    const [verifyResult, verifyError] = await this.did.verifyJWS({ payload: nonce, signatures: [signature] })
      .then((result) => [result, undefined] as const)
      .catch((error: Error) => [undefined, error] as const);
    if (!verifyResult || verifyError) {
      throw new InvalidSignatureError('Invalid signature');
    }
    return this.jwt.sign({
      nonce,
      did,
      exp: Math.floor(validUntil / 1000),
    } satisfies JwtPayloadCrete);
  }
}
