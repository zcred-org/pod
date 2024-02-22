import { configENV } from "../util/env.js";

export class Config {

  readonly protocol: string;
  readonly host: string;
  readonly port: number;
  readonly exposeDomain: URL;
  readonly db: {
    readonly url: string
  };
  readonly zcredFrontedOrigin: string;

  constructor(envFilePath?: URL) {
    if (envFilePath) configENV({ path: envFilePath, override: true });
    else configENV();
    this.protocol = ENV.getStringOrThrow("PROTOCOL");
    this.host = ENV.getStringOrThrow("HOST");
    this.port = Number(ENV.getStringOrThrow("PORT"));
    this.exposeDomain = ENV.getUrlOrThrow("EXPOSE_DOMAIN");
    this.db = {
      url: ENV.getStringOrThrow("DB_URL")
    };
    this.zcredFrontedOrigin = ENV.getUrlOrThrow("ZCRED_FRONTED_ORIGIN").origin;
  }
}

const ENV = {
  getStringOrThrow(key: keyof NodeJS.ProcessEnv) {
    const value = process.env[key];
    if (!value) throw new Error(
      `Can not find ENV "${key}" variable `,
    );
    return value;
  },

  getUrlOrThrow(key: keyof NodeJS.ProcessEnv): URL {
    const url = ENV.getStringOrThrow(key);
    return new URL(url);
  },
};