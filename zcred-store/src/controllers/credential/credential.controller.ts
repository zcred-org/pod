import { type AppContext } from '../../app.js';
import { issuerConcat, subjectIdConcat } from '../../util/index.js';
import { Injector } from 'typed-inject';
import { CredentialUpsertDtoRef } from './dtos/credential-upsert.dto.js';
import { Type } from '@sinclair/typebox';
import { CredentialsSearchDto } from './dtos/credentials-search.dto.js';
import { CredentialDto, CredentialDtoRef } from './dtos/credential.dto.js';
import { Identifier } from '../../models/dtos/identifier.dto.js';
import { type IssuerDto } from '../../models/dtos/issuer.dto.js';
import { CredentialEntity } from '../../models/entities/credential.entity.js';


export function CredentialController(context: Injector<AppContext>) {
  const { fastify } = context.resolve('httpServer');
  const credentialService = context.resolve('credentialService');

  const mapCredentialToDto = (credential: CredentialEntity): CredentialDto => ({
    id: credential.id,
    data: credential.data,
    updatedAt: credential.updatedAt,
    createdAt: credential.createdAt,
  });

  fastify.route({
    onRequest: fastify.authenticate,
    method: 'POST',
    url: '/api/v1/credential',
    schema: {
      description: 'Create or update a credential',
      body: CredentialUpsertDtoRef,
      response: {
        200: CredentialDtoRef,
        403: Type.String({ description: 'Credential update rejected with provided id' }),
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
        return reply.status(403).send(`Credential update rejected with provided id=${req.body.id}`);
      }
      return reply.status(200).send(mapCredentialToDto(credential));
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
        200: Type.Array(CredentialDtoRef, { description: 'Encrypted credentials of subject' }),
        400: Type.String({ description: 'Validation error message' }),
      },
    },
    handler: async (req, reply) => {
      let issuer: IssuerDto | undefined = undefined;
      let subjectId: Identifier | undefined = undefined;
      if ('subject.id.type' in req.query) {
        subjectId = { type: req.query['subject.id.type'], key: req.query['subject.id.key'] };
        issuer = { type: req.query['issuer.type'], uri: req.query['issuer.uri'] };
      }
      const credentials = await credentialService.findMany({
        controlledBy: req.user.did,
        issuer,
        subjectId,
      });
      return reply.status(200).send(credentials.map(mapCredentialToDto));
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
        200: CredentialDtoRef,
        404: Type.String({ description: 'Credential not found' }),
      },
    },
    handler: async (req, reply) => {
      const credential = await credentialService.findOneById({
        id: req.params.id,
        controlledBy: req.user.did,
      });
      if (!credential) {
        return reply.status(404).send('Credential not found');
      }
      return reply.status(200).send(mapCredentialToDto(credential));
    },
  });
}
