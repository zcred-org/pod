import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import type { Config } from './config.js';
import * as schema from '../models/entities/schema.js';
import { Disposable } from 'typed-inject';
import { tokens } from '../util/tokens.js';

export class DataSource implements Disposable {
  private readonly client;
  public readonly db;

  public static readonly inject = tokens('config');

  constructor(config: Config) {
    this.client = postgres(config.db);
    this.db = drizzle(this.client, { schema });
  }

  async dispose() {
    await this.client.end();
  }
}
