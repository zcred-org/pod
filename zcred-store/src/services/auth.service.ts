import { type JWSSignature } from '@didtools/codecs';
import { DID } from 'dids';
import { tokens } from '../util/tokens.js';
import { type HttpServer } from '../backbone/http-server.js';
import { type JwtPayloadCrete } from '../models/dtos/jwt-payload.dto.js';
import { Config } from '../backbone/config.js';
import { CacheClock } from 'cache-clock';
import crypto from 'node:crypto';
import { UnauthorizedError } from 'http-errors-enhanced';
import type { Disposable } from 'typed-inject';
import { didFromSeed } from '../util/index.js';


export class AuthService implements Disposable {
  private did: DID = null as never;

  /** Cache with key=did and value=nonce **/
  private readonly nonceCache = new CacheClock({ ttl: 5e3 });

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
    this.did = await didFromSeed(this.config.secretString);
  }

  public getNonce(did: string): string {
    const { v: value } = this.nonceCache.get(did) || this.nonceCache.set(did, crypto.randomUUID());
    return value;
  }

  public async generateJwt(did: string, signature: JWSSignature): Promise<string> {
    const nonce = this.getNonce(did);
    const [verifyResult, verifyError] = await this.did.verifyJWS({ payload: nonce, signatures: [signature] })
      .then((result) => [result, undefined] as const)
      .catch((error: Error) => [undefined, error] as const);
    if (verifyError || verifyResult?.didResolutionResult.didDocument?.id !== did) {
      throw new UnauthorizedError('Invalid signature');
    }
    return this.jwt.sign({
      nonce,
      did,
    } satisfies JwtPayloadCrete, {
      expiresIn: '5m',
    });
  }

  async dispose() {
    this.nonceCache.stop();
  }
}
