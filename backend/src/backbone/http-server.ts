import { type Config } from './config.js';
import createFastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';


export class HttpServer {

  readonly fastify: FastifyInstance;

  constructor(private readonly config: Config) {
    this.fastify = createFastify({
      disableRequestLogging: true,
    });
  }

  async register(): Promise<void> {
    // register fastify cors
    this.fastify.register(cors, { origin: '*' });
    // register swagger
    await this.fastify.register(swagger, {
      swagger: {
        info: {
          title: 'ZCred Verifier',
          description: 'ZCred verifier',
          version: '1.0.0',
        },
        host: this.config.exposeDomain.host,
        schemes: [this.config.protocol],
      },
    });
    // register swagger ui
    await this.fastify.register(swaggerUi, {
      routePrefix: '/documentation',
      uiConfig: {
        docExpansion: 'full',
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
    await this.fastify.close();
  }
}