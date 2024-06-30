import Keyv from 'keyv';
import { Config } from './config.js';
import { Disposable } from 'typed-inject';
import { tokens } from '../util/tokens.js';
import type { SecretDataDto } from '../controllers/secret-data/dtos/secret-data.dto.js';
import ms from 'ms';
import KeyvPostgres from '@keyv/postgres';

export class CacheManager implements Disposable {
  public readonly nonceCache;
  public readonly secretDataCache;

  static inject = tokens('config');

  constructor(private readonly config: Config) {
    this.nonceCache = new Keyv<string>({
      namespace: 'auth-nonce',
      ttl: ms('20s'),
    });
    this.secretDataCache = new Keyv<SecretDataDto>({
      store: new KeyvPostgres({ uri: this.config.dbUrl }),
      namespace: 'secret-data',
      ttl: ms('1h'),
    });
    this.secretDataCache.on('error', (err) => {
      const msg = err instanceof AggregateError ? err.errors.map(e => e.message).join(', ')
        : err instanceof Error ? err.message
          : err.toString();
      throw new Error(`[SecretDataCache] DB connection error: ${msg}`);
    });
  }

  async dispose() {
    await this.secretDataCache.disconnect();
  }
}
