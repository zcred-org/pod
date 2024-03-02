import { Injector } from 'typed-inject';
import type { AppContext } from '../../app.js';
import { Type } from '@sinclair/typebox';

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
        200: Type.String({ format: 'uuid', description: 'Nonce for signing by DID' }),
      },
    },
    handler: async (req, reply) => {
      const nonce = authService.getNonce(req.body.did);
      return reply.status(200).send(nonce);
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
        200: Type.String({ description: 'JWT' }),
        401: Type.String({ description: 'Error message' }),
      },
    },
    handler: async (req, reply) => {
      const [jwt, error] = await authService.generateJwt(req.body.did, req.body.signature)
        .then((jwt) => [jwt, undefined] as const)
        .catch((error: Error) => ([undefined, error] as const));
      if (error) {
        return reply.status(401).send(error.message);
      }
      return reply.status(200).send(jwt);
    },
  });
}
