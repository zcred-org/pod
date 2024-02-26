import dotenv, { DotenvConfigOptions, type DotenvConfigOutput } from 'dotenv';

function configENV(options?: DotenvConfigOptions): DotenvConfigOutput {
  return dotenv.config(options);
}

export class Config {
  /** Protocol e.g. http or https */
  readonly protocol: string;
  /** Http internal server host */
  readonly host: string;
  /** Http expose server domain */
  readonly exposeDomain: URL;
  /** Http server port */
  readonly port: number;
  /** Database connection options */
  readonly db: {
    host: string,
    port: number,
    user: string,
    password: string,
    database: string,
  };
  /** Secret string, for example, for JWT */
  readonly secretString: string;

  constructor(envFilePath?: URL) {
    if (envFilePath) configENV({ path: envFilePath, override: true });
    else configENV();
    this.protocol = process.env['PROTOCOL'] || 'http';
    this.host = process.env['HOST'] || '0.0.0.0';
    this.port = process.env['PORT'] ? Number(process.env['PORT']) : 8080;
    this.exposeDomain = new URL(ENV.getUrlOrThrow('PATH_TO_EXPOSE_DOMAIN').origin);

    this.db = {
      host: ENV.getStringOrThrow('DB_HOST'),
      port: Number(ENV.getStringOrThrow('DB_PORT')),
      user: ENV.getStringOrThrow('DB_USER'),
      password: ENV.getStringOrThrow('DB_PASSWORD'),
      database: ENV.getStringOrThrow('DB_NAME'),
    };

    this.secretString = ENV.getStringOrThrow('SECRET_STRING');
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
