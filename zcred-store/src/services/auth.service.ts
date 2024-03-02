import { hash as sha256 } from '@stablelib/sha256';
import { type JWSSignature } from '@didtools/codecs';
import * as u8a from 'uint8arrays';
import KeyResolver from 'key-did-resolver';
import { DID } from 'dids';
import { Ed25519Provider } from 'key-did-provider-ed25519';
import { InvalidSignatureError } from '../backbone/errors/invalid-signature.error.js';
import { tokens } from '../util/tokens.js';
import { type HttpServer } from '../backbone/http-server.js';
import { type JwtPayloadCrete } from '../models/dtos/jwt-payload.dto.js';
import { Config } from '../backbone/config.js';
import { CacheClock } from 'cache-clock';
import crypto from 'node:crypto';

export class AuthService {
  private did: DID = null as never;

  private readonly nonce = new CacheClock();

  private readonly jwt;

  public static readonly inject = tokens('httpServer', 'config');

  constructor(
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

  public getNonce(did: string): string {
    const { v: value } = this.nonce.get(did) || this.nonce.set(did, crypto.randomUUID());
    return value;
  }

  public async generateJwt(did: string, signature: JWSSignature): Promise<string> {
    const nonce = this.getNonce(did);
    const [verifyResult, verifyError] = await this.did.verifyJWS({ payload: nonce, signatures: [signature] })
      .then((result) => [result, undefined] as const)
      .catch((error: Error) => [undefined, error] as const);
    if (!verifyResult || verifyError) {
      throw new InvalidSignatureError('Invalid signature');
    }
    return this.jwt.sign({
      nonce,
      did,
    } satisfies JwtPayloadCrete, {
      expiresIn: '5m',
    });
  }
}
