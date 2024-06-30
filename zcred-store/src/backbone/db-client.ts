import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import type { Config } from './config.js';
import * as schema from '../models/entities/schema.js';
import { Disposable } from 'typed-inject';
import { tokens } from '../util/tokens.js';

export class DbClient implements Disposable {
  private readonly client;
  public readonly db;

  public static readonly inject = tokens('config');

  constructor(config: Config) {
    this.client = postgres(config.db);
    this.db = drizzle(this.client, { schema });
    this.client`select 1`.catch((err) => {
      const msg = err instanceof AggregateError ? err.errors.map(e => e.message).join(', ')
        : err instanceof Error ? err.message
          : err.toString();
      throw new Error(`[${DbClient.name}] DB connection error: ${msg}`);
    });
  }

  async dispose() {
    await this.client.end();
  }
}
