import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { type FastifyInstance } from "fastify";
import type { IssuerDto } from "../src/models/dtos/issuer.dto.js";
import type { Identifier } from "../src/models/dtos/identifier.dto.js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { App } from "../src/app.js";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "../src/models/entities/schema.js";
import crypto from "node:crypto";
import type { JwtPayloadCrete } from "../src/models/dtos/jwt-payload.dto.js";

const CORRECT_CONFIG_PATH = new URL("./config/.env.test", import.meta.url);

export async function testAppStart() {
  const pgContainer = await new PostgreSqlContainer("postgres:15-alpine").start();
  const pgClient = postgres(pgContainer.getConnectionUri());
  await migrate(drizzle(pgClient, { schema }), { migrationsFolder: "migrations" });
  await pgClient.end();

  const app = await App.init({
    envFilePath: CORRECT_CONFIG_PATH,
    env: {
      DB_USER: pgContainer.getUsername(),
      DB_PASSWORD: pgContainer.getPassword(),
      DB_HOST: pgContainer.getHost(),
      DB_PORT: pgContainer.getPort().toString(),
      DB_NAME: pgContainer.getDatabase(),
    },
  });
  return { pgContainer, app };
}

export async function testJwtCreate({ app, did }: { app: App, did: string }): Promise<string> {
  const jwt = app.context.resolve("httpServer").fastify.jwt.sign({
    nonce: crypto.randomUUID(),
    did,
  } satisfies JwtPayloadCrete);
  return `Bearer ${jwt}`;
}

export function bodyJson<T extends Awaited<ReturnType<FastifyInstance["inject"]>>>(res: T): Omit<T, "body"> & {
  body: any
} {
  res.body = res.json();
  return res;
}

export const issuerSplit = (issuer: string): IssuerDto => {
  // Example: `http:https://api.dev.sybil.center/issuers/passport`
  const separator = issuer.indexOf(":");
  if (separator === -1) throw new Error(`Invalid issuer: ${issuer}`);
  const type = issuer.slice(0, separator);
  const uri = issuer.slice(separator + 1);
  if (!type || !uri) throw new Error(`Invalid issuer: ${issuer}`);
  return { type, uri };
};

export const subjectIdSplit = (subjectId: string): Identifier => {
  // Example: `ethereum:address:0xCee05036e05350c2985582f158aEe0d9e0437446`
  const separator = subjectId.lastIndexOf(":");
  if (separator === -1) throw new Error(`Invalid subjectId: ${subjectId}`);
  const type = subjectId.slice(0, separator);
  const key = subjectId.slice(separator + 1);
  if (!type || !key) throw new Error(`Invalid subjectId: ${subjectId}`);
  return { type, key };
};
