import { describe, beforeEach, afterAll, assert } from 'vitest';
import { testAppStart, testJwtCreate, bodyJson } from './utils.js';
import { didFromSeed } from '../src/util/index.js';
import { sql, count } from 'drizzle-orm';
import { ZkpResultCacheEntity } from '../src/models/entities/zkp-result-cache.entity.js';
import sortKeys from 'sort-keys';
import crypto from 'node:crypto';
import type { DID } from 'dids';
import type { App } from '../src/app.js';
import * as HTTP from 'http-errors-enhanced';
import { type ZkpResultCacheCreateDto } from '../src/controllers/zkp-result-cache/dtos/zkp-result-cache-create.dto.js';
import { recursiveDateToISOString } from '../src/util/recursive-date-to-iso-string.js';
import type { ZkpResultCacheDto } from '../src/controllers/zkp-result-cache/dtos/zkp-result-cache.dto.js';


describe('ZkpResultCacheController', async () => {
  const { pgContainer, app } = await testAppStart();
  const fastify = app.context.resolve('httpServer').fastify;
  const db = app.context.resolve('dbClient').db;
  const origin = app.context.resolve('config').frontendURLs[0]!.origin;
  const {
    Authorization, did,
    zkpResult1, zkpResultCache1,
    /*zkpResult2,*/ zkpResultCache2,
  } = await makeMocks(app);

  beforeEach(async () => {
    await db.execute(sql`TRUNCATE TABLE ${ZkpResultCacheEntity}`);
    await db.insert(ZkpResultCacheEntity).values([zkpResultCache1]).execute();
  });

  afterAll(async () => {
    await app.close();
    await pgContainer.stop();
  });

  describe('Save', async (test) => {
    const method = 'POST', url = '/api/v1/zkp-result-cache';

    test('normal', async ({ expect }) => {
      expect(await db.select({ count: count() }).from(ZkpResultCacheEntity).execute()).toMatchObject([{ count: 1 }]);
      expect(await fastify.inject({
        method, url, headers: { origin, Authorization }, payload: {
          jalId: zkpResultCache2.jalId,
          data: zkpResultCache2.data,
        } satisfies ZkpResultCacheCreateDto,
      })).toMatchObject({
        statusCode: HTTP.OK,
        body: '',
      });
      expect(await db.select({ count: count() }).from(ZkpResultCacheEntity).execute()).toMatchObject([{ count: 2 }]);
      expect.assertions(3);
    });
    test('throws unauthorized', async ({ expect }) => {
      expect(await db.select({ count: count() }).from(ZkpResultCacheEntity).execute()).toMatchObject([{ count: 1 }]);
      expect(await fastify.inject({
        method, url, headers: { origin }, payload: {
          jalId: zkpResultCache2.jalId,
          data: zkpResultCache2.data,
        } satisfies ZkpResultCacheCreateDto,
      }).then(bodyJson)).toMatchObject({
        statusCode: HTTP.UNAUTHORIZED,
        body: new HTTP.UnauthorizedError('No Authorization was found in request.headers').serialize(),
      });
      expect(await db.select({ count: count() }).from(ZkpResultCacheEntity).execute()).toMatchObject([{ count: 1 }]);
      expect.assertions(3);
    });
  });

  describe('Get', async (test) => {
    const method = 'GET', urlByJalId = (jalId: string) => `/api/v1/zkp-result-cache/${jalId}`;

    test('normal', async ({ expect }) => {
      expect(await fastify.inject({
        method, url: urlByJalId(zkpResultCache1.jalId),
        headers: { origin, Authorization },
      }).then(bodyJson)).toMatchObject({
        statusCode: HTTP.OK,
        body: recursiveDateToISOString(zkpResultCache1),
      });
    });
    test('returns by createdAt desc', async ({ expect }) => {
      const [zkpResultCacheNew] = await db.insert(ZkpResultCacheEntity).values([{
        jalId: zkpResultCache1.jalId,
        data: await encryptEncodeZkpResult(did, { proof: 'new' }),
      }]).returning().execute();
      assert(zkpResultCacheNew);
      await expect(decryptDecodeZkpResult(did, zkpResultCacheNew.data)).resolves.toMatchObject({ proof: 'new' });
      expect(await fastify.inject({
        method, url: urlByJalId(zkpResultCache1.jalId),
        headers: { origin, Authorization },
      }).then(bodyJson)).toMatchObject({
        statusCode: HTTP.OK,
        body: recursiveDateToISOString(zkpResultCacheNew),
      });
    });
    test('throws unauthorized', async ({ expect }) => {
      expect(await fastify.inject({
        method, url: urlByJalId(zkpResultCache1.jalId),
        headers: { origin },
      }).then(bodyJson)).toMatchObject({
        statusCode: HTTP.UNAUTHORIZED,
        body: new HTTP.UnauthorizedError('No Authorization was found in request.headers').serialize(),
      });
    });
    test('throws not found', async ({ expect }) => {
      expect(await fastify.inject({
        method, url: urlByJalId(jalIdFrom({ notFound: 'not-found' })),
        headers: { origin, Authorization },
      }).then(bodyJson)).toMatchObject({
        statusCode: HTTP.NOT_FOUND,
        body: new HTTP.NotFoundError('ZkpResultCache not found').serialize(),
      });
    });
    test('other user can\'t use someone else\'s ZkpResult', async ({ expect }) => {
      const didSecond = await didFromSeed('user2');
      const AuthorizationSecond = `Bearer ${await testJwtCreate({ app, did: didSecond.id })}`;
      const res = await fastify.inject({
        method, url: urlByJalId(zkpResultCache1.jalId),
        headers: { origin, Authorization: AuthorizationSecond },
      }).then(bodyJson);
      expect(res).toMatchObject({
        statusCode: HTTP.OK,
        body: recursiveDateToISOString(zkpResultCache1),
      });
      const body = res.body as ZkpResultCacheDto;
      await expect(decryptDecodeZkpResult(did, body.data)).resolves.toMatchObject(zkpResult1);
      await expect(decryptDecodeZkpResult(didSecond, body.data)).rejects.toThrow(/Failed to decrypt/i);
      expect.assertions(3);
    });
  });
});

async function makeMocks(app: App) {
  const did = await didFromSeed('user1');
  const Authorization = `Bearer ${await testJwtCreate({ app, did: did.id })}`;

  const zkpResult1 = { proof: 'value1' };
  const zkpResultCache1: ZkpResultCacheEntity = {
    id: 'bfa9c7b8-50ac-42e0-be67-b163d35dc1e1',
    data: await encryptEncodeZkpResult(did, zkpResult1),
    createdAt: new Date(2000, 8, 21),
    jalId: jalIdFrom(zkpResult1),
  };

  const zkpResult2 = { proof: 'data2' };
  const zkpResultCache2: ZkpResultCacheEntity = {
    id: 'c6b62ff3-f9f7-4ddc-8ae4-bfbd5ec726e8',
    data: await encryptEncodeZkpResult(did, zkpResult2),
    createdAt: new Date(2024, 6, 19),
    jalId: jalIdFrom(zkpResult2),
  };

  return { did, Authorization, zkpResult1, zkpResult2, zkpResultCache1, zkpResultCache2 };
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
