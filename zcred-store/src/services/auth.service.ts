import { type JWSSignature } from '@didtools/codecs';
import { DID } from 'dids';
import { tokens } from '../util/tokens.js';
import { type HttpServer } from '../backbone/http-server.js';
import { Config } from '../backbone/config.js';
import crypto from 'node:crypto';
import { UnauthorizedError } from 'http-errors-enhanced';
import { didFromSeed } from '../util/index.js';
import type { CacheManager } from '../backbone/cache-manager.js';
import type { JwtPayloadCrete } from '../models/dtos/jwt-payload.dto.js';


export class AuthService {
  private did: DID = null as never;

  /** Cache with key=did and value=nonce **/
  private readonly nonceCache;

  private readonly jwt;

  public static readonly inject = tokens('config', 'httpServer', 'cacheManager');

  constructor(
    private readonly config: Config,
    httpServer: HttpServer,
    cacheManager: CacheManager,
  ) {
    this.jwt = httpServer.fastify.jwt;
    this.nonceCache = cacheManager.nonceCache;
  }

  public async register() {
    this.did = await didFromSeed(this.config.secretString);
  }

  public async getNonce(did: string): Promise<string> {
    let nonce = await this.nonceCache.get(did);
    if (!nonce) {
      nonce = crypto.randomUUID();
      await this.nonceCache.set(did, nonce);
    }
    return nonce;
  }

  public async generateJwt(did: string, signature: JWSSignature): Promise<string> {
    const nonce = await this.nonceCache.get(did);
    if (!nonce) {
      throw new UnauthorizedError('Nonce not found');
    }
    await this.nonceCache.delete(did);
    const [verifyResult, verifyError] = await this.did.verifyJWS({ payload: nonce, signatures: [signature] })
      .then((result) => [result, undefined] as const)
      .catch((error: Error) => [undefined, error] as const);
    if (verifyError || verifyResult?.didResolutionResult.didDocument?.id !== did) {
      throw new UnauthorizedError('Invalid signature');
    }
    return this.jwt.sign({ nonce, did } satisfies JwtPayloadCrete);
  }
}
