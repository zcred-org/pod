import { Injector } from 'typed-inject';
import type { AppContext } from '../../app.js';
import { Type } from '@sinclair/typebox';
import * as HTTP from 'http-errors-enhanced';
import { ZkpResultCacheDtoRef } from './dtos/zkp-result-cache.dto.js';
import { ZkpResultCacheCreateDtoRef } from './dtos/zkp-result-cache-create.dto.js';
import { recursiveDateToISOString } from '../../util/recursive-date-to-iso-string.js';


export function ZkpResultCacheController(context: Injector<AppContext>) {
  const { fastify } = context.resolve('httpServer');
  const zkpResultCacheStore = context.resolve('zkpResultCacheStore');

  fastify.route({
    onRequest: [fastify.frontendOnly, fastify.authenticate],
    method: 'POST',
    url: '/api/v1/zkp-result-cache',
    schema: {
      description: 'Create a new ZkpResultCache',
      body: ZkpResultCacheCreateDtoRef,
      response: {
        [HTTP.OK]: Type.Never(),
        [HTTP.UNAUTHORIZED]: HTTP.unauthorizedSchema,
        [HTTP.BAD_REQUEST]: HTTP.badRequestSchema,
      },
    },
    handler: async (req, reply) => {
      await zkpResultCacheStore.createOne(req.body);
      return reply.status(HTTP.OK).send();
    },
  });

  fastify.route({
    onRequest: [fastify.frontendOnly, fastify.authenticate],
    method: 'GET',
    url: '/api/v1/zkp-result-cache/:jalId',
    schema: {
      description: 'Find ZkpResultCache by jalId',
      params: Type.Object({ jalId: Type.String({ minLength: 64, maxLength: 64 }) }),
      response: {
        [HTTP.OK]: ZkpResultCacheDtoRef,
        [HTTP.UNAUTHORIZED]: HTTP.unauthorizedSchema,
        [HTTP.NOT_FOUND]: HTTP.notFoundSchema,
        [HTTP.BAD_REQUEST]: HTTP.badRequestSchema,
      },
    },
    handler: async (req, reply) => {
      const entity = await zkpResultCacheStore.searchOne(req.params.jalId);
      if (!entity) {
        throw new HTTP.NotFoundError('ZkpResultCache not found');
      }
      return reply.status(HTTP.OK).send(recursiveDateToISOString(entity));
    },
  });
}
