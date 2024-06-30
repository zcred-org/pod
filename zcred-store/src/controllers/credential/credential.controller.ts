import { type AppContext } from '../../app.js';
import { issuerConcat, subjectIdConcat } from '../../util/index.js';
import { Injector } from 'typed-inject';
import { CredentialUpsertDtoRef } from './dtos/credential-upsert.dto.js';
import { Type } from '@sinclair/typebox';
import { CredentialsSearchDto } from './dtos/credentials-search.dto.js';
import { CredentialDtoRef, credentialDtoFrom } from './dtos/credential.dto.js';
import { Identifier } from '../../models/dtos/identifier.dto.js';
import { type IssuerDto } from '../../models/dtos/issuer.dto.js';
import * as HTTP from 'http-errors-enhanced';


export function CredentialController(context: Injector<AppContext>) {
  const { fastify } = context.resolve('httpServer');
  const credentialService = context.resolve('credentialService');

  fastify.route({
    onRequest: fastify.authenticate,
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
    onRequest: fastify.authenticate,
    method: 'GET',
    url: '/api/v1/credentials',
    schema: {
      description: 'Get all or search credentials',
      querystring: CredentialsSearchDto,
      response: {
        [HTTP.OK]: Type.Array(CredentialDtoRef, { description: 'Encrypted credentials of subject' }),
        [HTTP.BAD_REQUEST]: HTTP.badRequestSchema,
        [HTTP.UNAUTHORIZED]: HTTP.unauthorizedSchema,
      },
    },
    handler: async (req, reply) => {
      let issuer: IssuerDto | undefined = undefined;
      let subjectId: Identifier | undefined = undefined;
      if ('subject.id.type' in req.query && 'issuer.type' in req.query) {
        subjectId = { type: req.query['subject.id.type'], key: req.query['subject.id.key'] };
        issuer = { type: req.query['issuer.type'], uri: req.query['issuer.uri'] };
      }
      const credentials = await credentialService.findMany({
        controlledBy: req.user.did,
        issuer,
        subjectId,
      });
      return reply.status(HTTP.OK).send(credentials.map(credentialDtoFrom));
    },
  });

  fastify.route({
    onRequest: fastify.authenticate,
    method: 'GET',
    url: '/api/v1/credential/:id',
    schema: {
      description: 'Get an encrypted credential by id',
      params: Type.Object({ id: Type.String({ format: 'uuid' }) }),
      response: {
        [HTTP.OK]: CredentialDtoRef,
        [HTTP.NOT_FOUND]: HTTP.notFoundSchema,
        [HTTP.BAD_REQUEST]: HTTP.badRequestSchema,
        [HTTP.UNAUTHORIZED]: HTTP.unauthorizedSchema,
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
