import type { DID } from 'dids';
import { sql } from 'drizzle-orm';
import * as HTTP from 'http-errors-enhanced';
import crypto from 'node:crypto';
import sortKeys from 'sort-keys';
import { afterAll, beforeEach, describe } from 'vitest';
import type { App } from '../src/app.js';
import { type ZkpResultCacheUpsertDto } from '../src/controllers/zkp-result-cache/dtos/zkp-result-cache-upsert.dto.js';
import { zkpResultCacheDtoFrom } from '../src/controllers/zkp-result-cache/dtos/zkp-result-cache.dto.js';
import { ZkpResultCacheEntity } from '../src/models/entities/zkp-result-cache.entity.js';
import { didFromSeed } from '../src/util/index.js';
import { bodyJson, testAppStart, testJwtCreate } from './utils.js';


describe('ZkpResultCacheController', async () => {
  const { pgContainer, app } = await testAppStart();
  const fastify = app.context.resolve('httpServer').fastify;
  const db = app.context.resolve('dbClient').db;
  const origin = app.context.resolve('config').frontendURLs[0]!.origin;
  const { user1, user2 } = await makeMocks(app);

  beforeEach(async () => {
    await db.execute(sql`TRUNCATE TABLE ${ZkpResultCacheEntity}`);
    await db.insert(ZkpResultCacheEntity).values([user1.prog1.zkpResultCache]).execute();
  });

  afterAll(async () => {
    await app.close();
    await pgContainer.stop();
  });

  describe('Save', async (test) => {
    const method = 'POST', url = '/api/v1/zkp-result-cache';

    test('creates new', async ({ expect }) => {
      await expect(db.select().from(ZkpResultCacheEntity).execute()).resolves.toEqual([user1.prog1.zkpResultCache]);
      const payload = {
        jalId: user1.prog2.zkpResultCache.jalId,
        data: user1.prog2.zkpResultCache.data,
      } satisfies ZkpResultCacheUpsertDto;
      await expect(fastify.inject({
        method, url, headers: { origin, Authorization: user1.auth }, payload,
      })).resolves.toMatchObject({ statusCode: HTTP.OK, body: '' });
      await expect(db.select().from(ZkpResultCacheEntity).execute()).resolves.toEqual([user1.prog1.zkpResultCache, expect.objectContaining(payload)]);
      expect.assertions(3);
    });
    test('updates existing', async ({ expect }) => {
      await expect(db.select().from(ZkpResultCacheEntity).execute()).resolves.toEqual([user1.prog1.zkpResultCache]);
      await expect(fastify.inject({
        method, url, headers: { origin, Authorization: user1.auth }, payload: {
          jalId: user1.prog1.zkpResultCache.jalId,
          data: user1.prog2.zkpResultCache.data,
        } satisfies ZkpResultCacheUpsertDto,
      })).resolves.toMatchObject({ statusCode: HTTP.OK, body: '' });
      await expect(db.select().from(ZkpResultCacheEntity).execute()).resolves.toEqual([{
        ...user1.prog1.zkpResultCache,
        data: user1.prog2.zkpResultCache.data,
        updatedAt: expect.any(Date),
      }]);
      expect.assertions(3);
    });
    test('does not conflict on 2 users with same jalId', async ({ expect }) => {
      await expect(db.select().from(ZkpResultCacheEntity).execute()).resolves.toEqual([
        user1.prog1.zkpResultCache,
      ]);
      const payload = {
        jalId: user1.prog1.zkpResultCache.jalId,
        data: user1.prog2.zkpResultCache.data,
      } satisfies ZkpResultCacheUpsertDto;
      await expect(fastify.inject({
        method, url, headers: { origin, Authorization: user2.auth }, payload,
      })).resolves.toMatchObject({ statusCode: HTTP.OK, body: '' });
      await expect(db.select().from(ZkpResultCacheEntity).execute()).resolves.toEqual([
        user1.prog1.zkpResultCache,
        expect.objectContaining(payload),
      ]);
      expect.assertions(3);
    });
    test('throws unauthorized', async ({ expect }) => {
      await expect(db.select().from(ZkpResultCacheEntity).execute()).resolves.toEqual([user1.prog1.zkpResultCache]);
      await expect(fastify.inject({
        method, url, headers: { origin }, payload: {
          jalId: user1.prog2.zkpResultCache.jalId,
          data: user1.prog2.zkpResultCache.data,
        } satisfies ZkpResultCacheUpsertDto,
      }).then(bodyJson)).resolves.toMatchObject({
        statusCode: HTTP.UNAUTHORIZED,
        body: new HTTP.UnauthorizedError('No Authorization was found in request.headers').serialize(),
      });
      await expect(db.select().from(ZkpResultCacheEntity).execute()).resolves.toEqual([user1.prog1.zkpResultCache]);
      expect.assertions(3);
    });
  });

  describe('Get', async (test) => {
    const method = 'GET', urlByJalId = (jalId: string) => `/api/v1/zkp-result-cache/${jalId}`;

    test('normal', async ({ expect }) => {
      await expect(fastify.inject({
        method, url: urlByJalId(user1.prog1.zkpResultCache.jalId),
        headers: { origin, Authorization: user1.auth },
      }).then(bodyJson)).resolves.toMatchObject({
        statusCode: HTTP.OK,
        body: zkpResultCacheDtoFrom(user1.prog1.zkpResultCache),
      });
    });
    test('throws unauthorized', async ({ expect }) => {
      await expect(fastify.inject({
        method, url: urlByJalId(user1.prog1.zkpResultCache.jalId),
        headers: { origin },
      }).then(bodyJson)).resolves.toMatchObject({
        statusCode: HTTP.UNAUTHORIZED,
        body: new HTTP.UnauthorizedError('No Authorization was found in request.headers').serialize(),
      });
    });
    test('throws not found', async ({ expect }) => {
      await expect(fastify.inject({
        method, url: urlByJalId(jalIdFrom({ notFound: 'not-found' })),
        headers: { origin, Authorization: user1.auth },
      }).then(bodyJson)).resolves.toMatchObject({
        statusCode: HTTP.NOT_FOUND,
        body: new HTTP.NotFoundError('ZkpResultCache not found').serialize(),
      });
    });
    test(`other user can't use someone else's ZkpResult`, async ({ expect }) => {
      await expect(fastify.inject({
        method, url: urlByJalId(user1.prog1.zkpResultCache.jalId),
        headers: { origin, Authorization: user2.auth },
      }).then(bodyJson)).resolves.toMatchObject({
        statusCode: HTTP.NOT_FOUND,
        body: new HTTP.NotFoundError('ZkpResultCache not found').serialize(),
      });
      await expect(decryptDecodeZkpResult(user1.did, user1.prog1.zkpResultCache.data)).resolves.toEqual(user1.prog1.zkpResult);
      await expect(decryptDecodeZkpResult(user2.did, user1.prog1.zkpResultCache.data)).rejects.toThrow(/Failed to decrypt/i);
      expect.assertions(3);
    });
    test(`throws not found when user2 getting user1's cache`, async ({ expect }) => {
      await expect(db.select().from(ZkpResultCacheEntity).execute()).resolves.toEqual([user1.prog1.zkpResultCache]);
      await expect(fastify.inject({
        method, url: urlByJalId(user1.prog1.zkpResultCache.jalId),
        headers: { origin, Authorization: user1.auth },
      }).then(bodyJson)).resolves.toMatchObject({
        statusCode: HTTP.OK,
        body: zkpResultCacheDtoFrom(user1.prog1.zkpResultCache),
      });
      await expect(fastify.inject({
        method, url: urlByJalId(user1.prog1.zkpResultCache.jalId),
        headers: { origin, Authorization: user2.auth },
      }).then(bodyJson)).resolves.toMatchObject({
        statusCode: HTTP.NOT_FOUND,
        body: new HTTP.NotFoundError('ZkpResultCache not found').serialize(),
      });
      expect.assertions(3);
    });
  });
});

async function makeMocks(app: App) {
  const user1_did = await didFromSeed('user1');
  const user1_jalProgram1 = { program1: '1' };
  const user1_zkpResult1 = { proof: 'data1' };
  const user1_jalProgram2 = { program2: '2' };
  const user1_zkpResult2 = { proof: 'data2' };

  const user2_did = await didFromSeed('user2');
  const user2_jalProgram1 = { program1: '1' };
  const user2_zkpResult1 = { proof: 'data1' };

  return {
    user1: {
      did: user1_did,
      auth: await testJwtCreate({ app, did: user1_did.id }),
      prog1: {
        jalProgram: user1_jalProgram1,
        zkpResult: user1_zkpResult1,
        zkpResultCache: {
          id: 'bfa9c7b8-50ac-42e0-be67-b163d35dc1e1',
          controlledBy: user1_did.id,
          jalId: jalIdFrom(user1_jalProgram1),
          data: await encryptEncodeZkpResult(user1_did, user1_zkpResult1),
          updatedAt: new Date(2000, 7, 21),
          createdAt: new Date(2000, 7, 21),
        } satisfies ZkpResultCacheEntity as ZkpResultCacheEntity,
      },
      prog2: {
        jalProgram: { program2: '2' },
        zkpResult: { proof: 'value2' },
        zkpResultCache: {
          id: 'c6b62ff3-f9f7-4ddc-8ae4-bfbd5ec726e8',
          controlledBy: user1_did.id,
          jalId: jalIdFrom(user1_jalProgram2),
          data: await encryptEncodeZkpResult(user1_did, user1_zkpResult2),
          updatedAt: new Date(2024, 6, 19),
          createdAt: new Date(2024, 6, 19),
        } satisfies ZkpResultCacheEntity as ZkpResultCacheEntity,
      },
    },
    user2: {
      did: user2_did,
      auth: await testJwtCreate({ app, did: user2_did.id }),
      prog1: {
        jalProgram: user2_jalProgram1,
        zkpResult: user2_zkpResult1,
        zkpResultCache: {
          id: 'bfa9c7b8-50ac-42e0-be67-b163d35dc1e1',
          controlledBy: user2_did.id,
          jalId: jalIdFrom(user2_jalProgram1),
          data: await encryptEncodeZkpResult(user2_did, user2_zkpResult1),
          updatedAt: new Date(2000, 11, 8),
          createdAt: new Date(2000, 11, 8),
        } satisfies ZkpResultCacheEntity as ZkpResultCacheEntity,
      },
    },
  } as const;
}

function jalIdFrom(jalProgram: object): string {
  const sorted = sortKeys(jalProgram, { deep: true });
  const stringed = JSON.stringify(sorted);
  const bytes = new TextEncoder().encode(stringed);
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

async function encryptEncodeZkpResult(did: DID, data: object): Promise<string> {
  const dataStringed = JSON.stringify(data);
  const dataBytes = new TextEncoder().encode(dataStringed);
  const jwe = await did.createJWE(dataBytes, [did.id]);
  const jweStringed = JSON.stringify(jwe);
  const jweBuffer = Buffer.from(jweStringed);
  return jweBuffer.toString('base64url');
}

async function decryptDecodeZkpResult(did: DID, data: string): Promise<object> {
  const jweStringed = Buffer.from(data, 'base64url').toString();
  const jwe = JSON.parse(jweStringed);
  const dataBuffer = await did.decryptJWE(jwe);
  const dataStringed = Buffer.from(dataBuffer).toString();
  return JSON.parse(dataStringed);
}
