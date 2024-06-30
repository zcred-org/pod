import { jwtRequest, bodyJson, subjectIdSplit, issuerSplit, testAppStart } from './utils.js';
import { sql, count } from 'drizzle-orm';
import { describe, beforeAll, beforeEach, afterAll, expect, assert } from 'vitest';
import { CredentialEntity } from '../src/models/entities/credential.entity.js';
import { credentialDtoFrom, type CredentialDto } from '../src/controllers/credential/dtos/credential.dto.js';
import * as HTTP from 'http-errors-enhanced';
import { didFromSeed } from '../src/util/index.js';
import type { CredentialUpsertDto } from '../src/controllers/credential/dtos/credential-upsert.dto.js';

describe('CredentialsController', async () => {
  const { pgContainer, app } = await testAppStart();
  const db = app.context.resolve('dbClient').db;
  const fastify = app.context.resolve('httpServer').fastify;
  let did1 = await didFromSeed('user1'), user1Auth: string;
  let did2 = await didFromSeed('user2'), user2Auth: string;

  let user1Cred1 = {
    id: 'f21764ff-6253-40a1-b737-613443647c85',
    data: JSON.stringify({ test: 'encrypted data 1' }),
    controlledBy: did1.id,
    issuer: 'http:https://center.two/issuers/passport',
    subjectId: 'mina:publickey:B62qqXhJ8qgXdApGoAvZHeXrHEg6YGqmThFcRN8xKqAvJsqjmUMVaZE',
  } as CredentialEntity;
  let user1Cred2 = {
    id: '4268acc3-6a91-4515-ac52-1329101b6e33',
    data: JSON.stringify({ test: 'encrypted data 2' }),
    controlledBy: did1.id,
    issuer: 'http:https://center.one/issuers/passport',
    subjectId: 'mina:publickey:B62qqXhJ8qgXdApGoAvZHeXrHEg6YGqmThFcRN8xKqAvJsqjmUMVaZE',
  } as CredentialEntity;

  const upsertOneQuery = db.insert(CredentialEntity).values({
    id: sql.placeholder('id'),
    controlledBy: sql.placeholder('controlledBy'),
    subjectId: sql.placeholder('subjectId'),
    issuer: sql.placeholder('issuer'),
    data: sql.placeholder('data'),
  }).returning().prepare('test.CredentialsController.1');

  beforeAll(async () => {
    [user1Auth, user2Auth] = await Promise.all([
      jwtRequest({ fastify, did: did1 }).then(jwt => `Bearer ${jwt}`),
      jwtRequest({ fastify, did: did2 }).then(jwt => `Bearer ${jwt}`),
    ]);
  });

  beforeEach(async () => {
    await db.execute(sql`TRUNCATE TABLE credential`);
    [user1Cred1, user1Cred2] = await Promise.all([
      upsertOneQuery.execute(user1Cred1).then(([cred]) => cred!),
      upsertOneQuery.execute(user1Cred2).then(([cred]) => cred!),
    ]);
  });

  afterAll(async () => {
    await app.close();
    await pgContainer.stop();
  });

  describe('GET /credentials', async (test) => {
    test('Route requires authorization', async () => {
      assert.deepNestedInclude(await fastify.inject({ method: 'GET', url: '/api/v1/credentials' }).then(bodyJson), {
        statusCode: HTTP.UNAUTHORIZED,
        body: new HTTP.UnauthorizedError('No Authorization was found in request.headers').serialize(),
      });
    });

    test('User1 getting his 2 items', async () => {
      const resUser1 = await fastify.inject({
        method: 'GET', url: '/api/v1/credentials',
        headers: { Authorization: user1Auth },
      }).then(bodyJson);
      expect(resUser1).toMatchObject({
        statusCode: HTTP.OK,
        body: expect.arrayContaining([credentialDtoFrom(user1Cred1), credentialDtoFrom(user1Cred2)]),
      });
      assert.equal(resUser1.body.length, 2);
    });

    test('User2 getting his 0 items', async () => {
      const resUser2 = await fastify.inject({
        method: 'GET', url: '/api/v1/credentials',
        headers: { Authorization: user2Auth },
      }).then(bodyJson);
      assert.deepNestedInclude(resUser2, {
        statusCode: HTTP.OK,
        body: [],
      });
      assert.equal(resUser2.body.length, 0);
    });

    test('Route provides search by querystring', async () => {
      const subject = subjectIdSplit(user1Cred1.subjectId);
      const issuer = issuerSplit(user1Cred1.issuer);
      const res = await fastify.inject({
        method: 'GET', url: `/api/v1/credentials`,
        query: {
          'subject.id.key': subject.key,
          'subject.id.type': subject.type,
          'issuer.type': issuer.type,
          'issuer.uri': issuer.uri,
        },
        headers: { Authorization: user1Auth },
      }).then(bodyJson);
      assert.deepNestedInclude(res, {
        statusCode: HTTP.OK,
        body: [credentialDtoFrom(user1Cred1)],
      });
      assert.equal(res.body.length, 1);
    });
  });

  describe('GET /credential/:id', (test) => {
    test('Route requires authorization', async () => {
      assert.deepNestedInclude(await fastify.inject({ method: 'GET', url: `/api/v1/credential/${user1Cred1.id}` }).then(bodyJson), {
        statusCode: HTTP.UNAUTHORIZED,
        body: new HTTP.UnauthorizedError('No Authorization was found in request.headers').serialize(),
      });
    });

    test('User can get own item', async () => {
      expect(await fastify.inject({
        method: 'GET', url: `/api/v1/credential/${user1Cred1.id}`,
        headers: { Authorization: user1Auth },
      }).then(bodyJson)).toMatchObject({
        statusCode: HTTP.OK,
        body: credentialDtoFrom(user1Cred1),
      });
    });

    test('User can\'t get anyone else\'s item', async () => {
      const resUser2 = await fastify.inject({
        method: 'GET', url: `/api/v1/credential/${user1Cred1.id}`,
        headers: { Authorization: user2Auth },
      }).then(bodyJson);
      expect(resUser2).toMatchObject({
        statusCode: HTTP.NOT_FOUND,
        body: new HTTP.NotFoundError('Credential not found').serialize(),
      });
    });

    test('Route validates params', async () => {
      assert.deepNestedInclude(await fastify.inject({
        method: 'GET', url: `/api/v1/credential/123`,
        headers: { Authorization: user2Auth },
      }).then(bodyJson), {
        statusCode: HTTP.BAD_REQUEST,
        body: new HTTP.BadRequestError('One or more validations failed trying to process your request.', {
          failedValidations: { params: { id: 'must be a valid GUID (UUID v4)' } },
        }).serialize(true, true),
      });
    });
  });

  describe('POST /credential', (test) => {
    test('Route requires authorization', async () => {
      assert.deepNestedInclude(await fastify.inject({ method: 'POST', url: '/api/v1/credential' }).then(bodyJson), {
        statusCode: HTTP.UNAUTHORIZED,
        body: new HTTP.UnauthorizedError('No Authorization was found in request.headers').serialize(),
      });
    });

    test('User can create new item', async () => {
      const user1Cred3 = {
        data: JSON.stringify({ test: 'encrypted data 8ed844b260dd0995b7fe71e792a5d04b9d7c002c87926435a4dea5aa35ca3444' }),
        issuer: { type: 'http', uri: 'https://center.one/issuers/passport' },
        subjectId: { type: 'ethereum', key: '0xCee05036e05350c2985582f158aEe0d9e0437446' },
      } satisfies CredentialUpsertDto;
      const user1Cred3Dto = {
        id: expect.stringMatching(/^.{8}-.{4}-.{4}-.{4}-.{12}$/),
        data: user1Cred3.data,
        updatedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/),
        createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/),
      } satisfies CredentialDto;

      assert.deepEqual(await db.select({ count: count() }).from(CredentialEntity).execute(), [{ count: 2 }]);

      // Create new item
      const resCreated = await fastify.inject({
        method: 'POST', url: '/api/v1/credential',
        headers: { Authorization: user1Auth },
        body: user1Cred3,
      }).then(bodyJson);
      expect(resCreated).toMatchObject({
        statusCode: HTTP.OK,
        body: user1Cred3Dto,
      });

      assert.deepEqual(await db.select({ count: count() }).from(CredentialEntity).execute(), [{ count: 3 }]);

      // Check availability of new item
      const res = await fastify.inject({
        method: 'GET', url: '/api/v1/credentials',
        headers: { Authorization: user1Auth },
      }).then(bodyJson);
      expect(res).toMatchObject({
        statusCode: HTTP.OK,
        body: expect.arrayContaining([credentialDtoFrom(user1Cred1), credentialDtoFrom(user1Cred2), user1Cred3Dto]),
      });
      assert.equal(res.body.length, 3);
    });

    test('User can update existing item', async () => {
      assert.deepEqual(await db.select({ count: count() }).from(CredentialEntity).execute(), [{ count: 2 }]);
      const user1Cred1Updated = {
        id: user1Cred1.id,
        data: JSON.stringify({ test: 'encrypted data 1 updated' }),
        issuer: issuerSplit(user1Cred1.issuer),
        subjectId: subjectIdSplit(user1Cred1.subjectId),
      } satisfies CredentialUpsertDto;
      const resUpdated = await fastify.inject({
        method: 'POST', url: '/api/v1/credential',
        headers: { Authorization: user1Auth },
        body: user1Cred1Updated,
      }).then(bodyJson);
      assert.deepEqual(await db.select({ count: count() }).from(CredentialEntity).execute(), [{ count: 2 }]);
      expect(resUpdated).toMatchObject({
        statusCode: HTTP.OK,
        body: {
          id: user1Cred1.id,
          data: user1Cred1Updated.data,
          updatedAt: expect.not.stringMatching(user1Cred1.updatedAt.toISOString()),
          createdAt: user1Cred1.createdAt.toISOString(),
        },
      });
      // Check availability of updated item
      const res = await fastify.inject({
        method: 'GET', url: '/api/v1/credentials',
        headers: { Authorization: user1Auth },
      }).then(bodyJson);
      expect(res).toMatchObject({
        statusCode: HTTP.OK,
        body: expect.arrayContaining([{
          id: user1Cred1.id,
          data: user1Cred1Updated.data,
          updatedAt: expect.not.stringMatching(user1Cred1.updatedAt.toISOString()),
          createdAt: user1Cred1.createdAt.toISOString(),
        }, credentialDtoFrom(user1Cred2)]),
      });
      assert.equal(res.body.length, 2);
    });

    test('User can\'t update anyone else\'s item', async () => {
      const user1Cred1Updated = {
        id: user1Cred1.id,
        data: JSON.stringify({ test: 'encrypted data 1 updated' }),
        issuer: issuerSplit(user1Cred1.issuer),
        subjectId: subjectIdSplit(user1Cred1.subjectId),
      } satisfies CredentialUpsertDto;
      assert.deepEqual(await db.select({ count: count() }).from(CredentialEntity).execute(), [{ count: 2 }]);
      assert.deepNestedInclude(await fastify.inject({
        method: 'POST', url: '/api/v1/credential',
        headers: { Authorization: user2Auth },
        body: user1Cred1Updated,
      }).then(bodyJson), {
        statusCode: HTTP.NOT_FOUND,
        body: new HTTP.NotFoundError('Credential not found').serialize(),
      });
      assert.deepEqual(await db.select({ count: count() }).from(CredentialEntity).execute(), [{ count: 2 }]);
    });

    test('Route validates body', async () => {
      assert.deepNestedInclude(await fastify.inject({
        method: 'POST', url: '/api/v1/credential',
        headers: { Authorization: user1Auth },
        body: { issuer: 'http:https://center.one/issuers/passport', id: '123' },
      }).then(bodyJson), {
        statusCode: HTTP.BAD_REQUEST,
        body: new HTTP.BadRequestError('One or more validations failed trying to process your request.', {
          failedValidations: {
            body: {
              id: 'must be a valid GUID (UUID v4)',
              data: 'must be present',
              issuer: 'must be a object',
              subjectId: 'must be present',
            },
          },
        }).serialize(true, true),
      });
    });
  });
});
