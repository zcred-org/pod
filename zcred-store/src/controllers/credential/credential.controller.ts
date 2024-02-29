import { type AppContext } from '../../app.js';
import { issuerConcat, subjectIdConcat } from '../../util/index.js';
import { Injector } from 'typed-inject';
import { CredentialUpsertDtoRef } from './dtos/credential-upsert.dto.js';
import { CredentialIdDtoRef } from './dtos/credential-id.dto.js';
import { Type } from '@sinclair/typebox';
import { CredentialsSearchDto } from './dtos/credentials-search.dto.js';
import { CredentialDtoRef } from './dtos/credential.dto.js';
import { Identifier } from '../../dtos/identifier.dto.js';
import { type IssuerDto } from '../../dtos/issuer.dto.js';


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
        200: CredentialIdDtoRef,
        403: Type.String({ description: 'Credential update rejected with provided id' }),
      },
    },
    handler: async (req, reply) => {
      const credential = await credentialService.credentialUpsert({
        id: req.body.id,
        controlledBy: req.user.did,
        subjectId: subjectIdConcat(req.body.subjectId),
        issuer: issuerConcat(req.body.issuer),
        data: req.body.data,
      });
      if (!credential) {
        return reply.status(403).send(`Credential update rejected with provided id=${req.body.id}`);
      }
      return reply.status(200).send(credential);
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
      const credentials = await credentialService.credentialsSearch({
        controlledBy: req.user.did,
        issuer,
        subjectId,
      });
      return reply.status(200).send(credentials);
    },
  });
}
