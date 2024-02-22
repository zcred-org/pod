import { Disposable, tokens } from "typed-inject";
import { Config } from "./config.js";
import createFastify, { FastifyInstance } from "fastify";
import { Logger } from "./logger.js";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

export class HttpServer implements Disposable {

  readonly fastify: FastifyInstance;

  static inject = tokens("config", "logger");
  constructor(
    readonly config: Config,
    private readonly logger: Logger
  ) {
    // @ts-expect-error
    this.fastify = createFastify({
      logger: logger,
      disableRequestLogging: true,
    });
  }

  async register() {
    this.fastify.register(cors, {
      origin: [this.config.zcredFrontedOrigin]
    });

    // register swagger
    await this.fastify.register(swagger, {
      swagger: {
        info: {
          title: "Sybil Center",
          description: "Sybil Center - Verifiable Credential Issuer." +
            "See https://github.com/sybil-center/sybil",
          version: "1.0.0",
        },
        host: this.config.exposeDomain.host,
        schemes: [this.config.protocol],
      },
      hideUntagged: true,
    });

    // register swagger ui
    await this.fastify.register(swaggerUi, {
      routePrefix: "/documentation",
      uiConfig: {
        docExpansion: "full",
        deepLinking: false,
      },
      staticCSP: true,
      transformStaticCSP: (header) => header,
    });
  }

  async listen(): Promise<void> {
    await this.fastify.listen({
      port: this.config.port,
      host: this.config.host,
    });
  }

  async dispose() {
    this.logger.info("Closing server...");
    await this.fastify.close();
  }
}