import { type AppContext } from '../../app.js';
import { issuerConcat, subjectIdConcat } from '../../util/index.js';
import { Injector } from 'typed-inject';
import { CredentialUpsertDtoRef } from './dtos/credential-upsert.dto.js';
import { CredentialsSearchParamsDtoRef } from './dtos/credentials-search-params.dto.js';
import { CredentialDtoRef, credentialDtoFrom } from './dtos/credential.dto.js';
import * as HTTP from 'http-errors-enhanced';
import { CredentialIdDtoRef } from './dtos/credential-id.dto.js';
import { CredentialsDtoRef } from './dtos/credentials.dto.js';


export function CredentialController(context: Injector<AppContext>) {
  const { fastify } = context.resolve('httpServer');
  const credentialService = context.resolve('credentialService');

  fastify.route({
    onRequest: [fastify.frontendOnly, fastify.authenticate],
    method: 'POST',
    url: '/api/v1/credential',
    schema: {
      description: 'Create or update a credential',
      body: CredentialUpsertDtoRef,
      response: {
        [HTTP.OK]: CredentialDtoRef,
        [HTTP.NOT_FOUND]: HTTP.notFoundSchema,
        [HTTP.BAD_REQUEST]: HTTP.badRequestSchema,
        [HTTP.UNAUTHORIZED]: HTTP.unauthorizedSchema,
        [HTTP.FORBIDDEN]: HTTP.forbiddenSchema,
      },
    },
    handler: async (req, reply) => {
      const credential = await credentialService.upsertOne({
        id: req.body.id,
        controlledBy: req.user.did,
        subjectId: subjectIdConcat(req.body.subjectId),
        issuer: issuerConcat(req.body.issuer),
        data: req.body.data,
      });
      if (!credential) {
        throw new HTTP.NotFoundError('Credential not found');
      }
      return reply.status(HTTP.OK).send(credentialDtoFrom(credential));
    },
  });

  fastify.route({
    onRequest: [fastify.frontendOnly, fastify.authenticate],
    method: 'GET',
    url: '/api/v1/credentials',
    schema: {
      description: 'Get many or search credentials',
      querystring: CredentialsSearchParamsDtoRef,
      response: {
        [HTTP.OK]: CredentialsDtoRef,
        [HTTP.BAD_REQUEST]: HTTP.badRequestSchema,
        [HTTP.UNAUTHORIZED]: HTTP.unauthorizedSchema,
        [HTTP.FORBIDDEN]: HTTP.forbiddenSchema,
      },
    },
    handler: async (req, reply) => {
      const searchResult = await credentialService.findMany({
        controlledBy: req.user.did,
        issuer: req.query['issuer.type'] && req.query['issuer.uri']
          ? { type: req.query['issuer.type'], uri: req.query['issuer.uri'] }
          : undefined,
        subjectId: req.query['subject.id.key'] && req.query['subject.id.type']
          ? { type: req.query['subject.id.type'], key: req.query['subject.id.key'] }
          : undefined,
      }, {
        limit: req.query.limit,
        offset: req.query.offset,
      });
      return reply.status(HTTP.OK).send({
        ...searchResult,
        credentials: searchResult.credentials.map(credentialDtoFrom),
      });
    },
  });

  fastify.route({
    onRequest: [fastify.frontendOnly, fastify.authenticate],
    method: 'GET',
    url: '/api/v1/credential/:id',
    schema: {
      description: 'Get an encrypted credential by id',
      params: CredentialIdDtoRef,
      response: {
        [HTTP.OK]: CredentialDtoRef,
        [HTTP.NOT_FOUND]: HTTP.notFoundSchema,
        [HTTP.BAD_REQUEST]: HTTP.badRequestSchema,
        [HTTP.UNAUTHORIZED]: HTTP.unauthorizedSchema,
        [HTTP.FORBIDDEN]: HTTP.forbiddenSchema,
      },
    },
    handler: async (req, reply) => {
      const credential = await credentialService.findOneById({
        id: req.params.id,
        controlledBy: req.user.did,
      });
      if (!credential) {
        throw new HTTP.NotFoundError('Credential not found');
      }
      return reply.status(HTTP.OK).send(credentialDtoFrom(credential));
    },
  });
}
