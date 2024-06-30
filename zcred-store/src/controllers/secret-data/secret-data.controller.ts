import { Injector } from 'typed-inject';
import type { AppContext } from '../../app.js';
import { Type } from '@sinclair/typebox';
import * as HTTP from 'http-errors-enhanced';
import { SecretDataDtoRef } from './dtos/secret-data.dto.js';
import { genID } from '../../util/index.js';

export function SecretDataController(context: Injector<AppContext>) {
  const { fastify } = context.resolve('httpServer');
  const { secretDataCache } = context.resolve('cacheManager');

  fastify.route({
    method: 'POST',
    url: '/api/v1/secret-data',
    schema: {
      description: 'Create temp secrets and receive its ID',
      body: SecretDataDtoRef,
      response: {
        [HTTP.OK]: Type.Object({ id: Type.String() }),
        [HTTP.BAD_REQUEST]: HTTP.badRequestSchema,
      },
    },
    handler: async (req, reply) => {
      const id = genID();
      await secretDataCache.set(id, req.body);
      reply.status(HTTP.OK).send({ id });
    },
  });

  fastify.route({
    method: 'get',
    url: '/api/v1/secret-data/:id',
    schema: {
      description: 'Get temp secrets by ID',
      params: Type.Object({ id: Type.String() }),
      response: {
        [HTTP.OK]: SecretDataDtoRef,
        [HTTP.NOT_FOUND]: HTTP.notFoundSchema,
        [HTTP.BAD_REQUEST]: HTTP.badRequestSchema,
      },
    },
    handler: async (req, reply) => {
      const secretData = await secretDataCache.get(req.params.id);
      if (!secretData) {
        throw new HTTP.NotFoundError('Data not found');
      }
      return reply.status(HTTP.OK).send(secretData);
    },
  });
}
