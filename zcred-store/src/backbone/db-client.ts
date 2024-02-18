import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import type { Config } from './config.js';
import * as schema from '../entities/schema.js';

export class DataSource {
  private readonly client;
  public readonly db;

  constructor(config: Config) {
    this.client = postgres(config.db);
    this.db = drizzle(this.client, { schema });
  }
}
