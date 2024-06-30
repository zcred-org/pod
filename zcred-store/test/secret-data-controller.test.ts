import { describe, afterAll, beforeEach, expect } from 'vitest';
import { bodyJson, testAppStart } from './utils.js';
import * as HTTP from 'http-errors-enhanced';
import type { SecretDataDto } from '../src/controllers/secret-data/dtos/secret-data.dto.js';

describe('SecretDataController', async (test) => {
  const { pgContainer, app } = await testAppStart();
  const fastify = app.context.resolve('httpServer').fastify;
  const { secretDataCache } = app.context.resolve('cacheManager');

  beforeEach(() => secretDataCache.clear());

  afterAll(async () => {
    await app.close();
    await pgContainer.stop();
  });

  test('Create and receive by ID', async () => {
    const payload: SecretDataDto = {
      subject: { id: { type: 'type', key: 'key' } },
      clientSession: 'e1592b8b-de8f-499f-9d1c-1ddf0881a9c1',
      redirectURL: 'https://example.com',
      prop1: 1,
      otherInfo: { prop2: 2, prop3: 'prop3' },
    };
    const res1 = await fastify.inject({
      method: 'POST',
      url: '/api/v1/secret-data',
      payload,
    }).then(bodyJson);
    expect(res1).toMatchObject({
      statusCode: HTTP.OK,
      body: { id: expect.stringMatching(/^[0-9a-z]{40}$/) },
    });
    const id = res1.body.id as string;
    expect(await secretDataCache.get(id)).to.deep.equal(payload);

    const res2 = await fastify.inject({
      method: 'GET',
      url: `/api/v1/secret-data/${id}`,
      payload,
    }).then(bodyJson);
    expect(res2).toMatchObject({
      statusCode: HTTP.OK,
      body: payload,
    });
  });

  test('Route validates body', async () => {
    expect(await fastify.inject({
      method: 'POST',
      url: '/api/v1/secret-data',
      payload: {},
    }).then(bodyJson)).toMatchObject({
      statusCode: HTTP.BAD_REQUEST,
      body: new HTTP.BadRequestError('One or more validations failed trying to process your request.', {
        failedValidations: {
          body: {
            clientSession: 'must be present',
            redirectURL: 'must be present',
            subject: 'must be present',
          },
        },
      }).serialize(true, true),
    });

    expect(await fastify.inject({
      method: 'POST',
      url: '/api/v1/secret-data',
      payload: { subject: { id: {} }, clientSession: 123, redirectURL: '', other1: 1, other2: { value: 2 } },
    }).then(bodyJson)).toMatchObject({
      statusCode: HTTP.BAD_REQUEST,
      body: new HTTP.BadRequestError('One or more validations failed trying to process your request.', {
        failedValidations: {
          body: {
            type: 'must be present',
            key: 'must be present',
            redirectURL: 'must be a valid URI',
          },
        },
      }).serialize(true, true),
    });
  });

  test('Not found', async () => {
    expect(await fastify.inject({
      method: 'GET',
      url: '/api/v1/secret-data/123',
    }).then(bodyJson)).toMatchObject({
      statusCode: HTTP.NOT_FOUND,
      body: new HTTP.NotFoundError('Data not found').serialize(true, true),
    });
  });
});
