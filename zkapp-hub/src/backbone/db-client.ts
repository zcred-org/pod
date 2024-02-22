import * as schema from "../entities/schema.js";
import postgres from "postgres";
import { Disposable, tokens } from "typed-inject";
import { Config } from "./config.js";
import { drizzle } from "drizzle-orm/postgres-js";

export class DbClient implements Disposable {

  static inject = tokens("config", "logger");

  private readonly client;
  readonly db;

  constructor(
    config: Config,
  ) {
    this.client = postgres(config.db.url);
    this.db = drizzle(this.client, { schema: schema });
  }

  async dispose() {
    await this.client.end();
  }
}