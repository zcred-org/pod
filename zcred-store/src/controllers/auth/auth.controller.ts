import { Injector } from 'typed-inject';
import type { AppContext } from '../../app.js';
import { Type } from '@sinclair/typebox';
import * as HTTP from 'http-errors-enhanced';

export function AuthController(context: Injector<AppContext>) {
  const { fastify } = context.resolve('httpServer');
  const authService = context.resolve('authService');

  fastify.route({
    method: 'POST',
    url: '/api/v1/want-auth',
    schema: {
      description: 'Request a nonce for signing for continue authentication',
      body: Type.Object({ did: Type.String() }),
      response: {
        [HTTP.OK]: Type.String({ format: 'uuid', description: 'Nonce for signing by DID' }),
      },
    },
    handler: async (req, reply) => {
      const nonce = authService.getNonce(req.body.did);
      return reply.status(HTTP.OK).send(nonce);
    },
  });

  fastify.route({
    method: 'POST',
    url: '/api/v1/auth',
    schema: {
      description: 'Receives signature and returns JWT',
      body: Type.Object({
        did: Type.String(),
        signature: Type.Object({
          protected: Type.String(),
          signature: Type.String(),
        }, { description: 'JWSSignature from JWS', additionalProperties: false }),
      }, { additionalProperties: false }),
      response: {
        [HTTP.OK]: Type.String({ description: 'JWT' }),
        [HTTP.BAD_REQUEST]: HTTP.badRequestSchema,
        [HTTP.UNAUTHORIZED]: HTTP.unauthorizedSchema,
      },
    },
    handler: async (req, reply) => {
      const jwt = await authService.generateJwt(req.body.did, req.body.signature);
      return reply.status(HTTP.OK).send(jwt);
    },
  });
}
