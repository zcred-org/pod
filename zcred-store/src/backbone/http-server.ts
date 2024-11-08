import Fastify, { FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { type Config } from './config.js';
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { CredentialDto } from '../controllers/credential/dtos/credential.dto.js';
import { CredentialUpsertDto } from '../controllers/credential/dtos/credential-upsert.dto.js';
import { IdentifierDto } from '../models/dtos/identifier.dto.js';
import { IssuerDto } from '../models/dtos/issuer.dto.js';
import { Disposable } from 'typed-inject';
import { tokens } from '../util/tokens.js';
import { CredentialIdDto } from '../controllers/credential/dtos/credential-id.dto.js';
import jwt from '@fastify/jwt';
import { JwtPayloadDto } from '../models/dtos/jwt-payload.dto.js';
import fastifyHttpErrorsEnhanced from 'fastify-http-errors-enhanced';
import ajvFormats from 'ajv-formats';
import type { Ajv } from 'ajv';
import * as HTTP from 'http-errors-enhanced';
import { SecretDataDto } from '../controllers/secret-data/dtos/secret-data.dto.js';
import { originToHostnames } from '../util/index.js';
import { CredentialsDto } from '../controllers/credential/dtos/credentials.dto.js';
import { CredentialsSearchParamsDto } from '../controllers/credential/dtos/credentials-search-params.dto.js';
import { ZkpResultCacheDto } from '../controllers/zkp-result-cache/dtos/zkp-result-cache.dto.js';
import { ZkpResultCacheCreateDto } from '../controllers/zkp-result-cache/dtos/zkp-result-cache-create.dto.js';


export class HttpServer implements Disposable {
  readonly fastify;
  public static readonly inject = tokens('config');

  constructor(private readonly config: Config) {
    this.fastify = Fastify({
      disableRequestLogging: true,
      ajv: { customOptions: { allErrors: true } },
    }).withTypeProvider<TypeBoxTypeProvider>();
  }

  async register(): Promise<void> {
    // register fastify cors
    this.fastify.register(cors, { origin: '*' });
    this.fastify.decorate('frontendOnly', async (req: FastifyRequest/*, reply: FastifyReply*/) => {
      const hostnames = req.headers.origin ? await originToHostnames(req.headers.origin) : [];
      if (!this.config.frontendURLs.some(frontendURL => hostnames.includes(frontendURL.origin))) {
        // throw new HTTP.ForbiddenError(`"${hostnames.join(',')}" not include "${this.config.frontendURL.origin}"`);
        throw new HTTP.ForbiddenError('You do not have permission to access this resource.');
      }
    });
    // register fastify jwt
    this.fastify.register(jwt, {
      secret: this.config.secretString,
      sign: { expiresIn: '5m' },
    });
    this.fastify.decorate('authenticate', async (req: FastifyRequest/*, reply: FastifyReply*/) => {
      const err = await req.jwtVerify().catch((err: Error) => err);
      if (err instanceof Error) {
        throw new HTTP.UnauthorizedError(err.message);
      }
    });
    // register swagger
    await this.fastify.register(swagger, {
      openapi: {
        info: {
          title: 'ZCred Store',
          description: 'ZCred Store - Encrypted Credentials Storage',
          version: '0.0.1',
        },
      },
      refResolver: {
        // Name schema models by $id instead of "def-0", "def-1", etc.
        // Useful for frontend code generation
        buildLocalReference: (json, _0, _1, i) => json.$id as string || `id-${i}`,
      },
    });
    // register enhanced http errors
    await this.fastify.register(fastifyHttpErrorsEnhanced, {
      // Add formats plugin's ajv instance
      responseValidatorCustomizer: (ajv: Ajv) => ajvFormats.default(ajv),
    });
    // add schemas
    this.addSchemas();
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

  private addSchemas() {
    this.fastify.addSchema(CredentialDto);
    this.fastify.addSchema(CredentialsDto);
    this.fastify.addSchema(CredentialsSearchParamsDto);
    this.fastify.addSchema(CredentialIdDto);
    this.fastify.addSchema(CredentialUpsertDto);
    this.fastify.addSchema(IdentifierDto);
    this.fastify.addSchema(IssuerDto);
    this.fastify.addSchema(JwtPayloadDto);
    this.fastify.addSchema(SecretDataDto);
    this.fastify.addSchema(ZkpResultCacheDto);
    this.fastify.addSchema(ZkpResultCacheUpsertDto);
  }

  async listen(): Promise<void> {
    await this.fastify.listen({
      port: this.config.port,
      host: this.config.host,
    });
    console.log(`App successfully launched on port ${this.config.port}`);
  }

  async dispose() {
    await this.fastify.close();
  }
}
