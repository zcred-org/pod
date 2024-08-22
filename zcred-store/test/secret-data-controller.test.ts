import { describe, afterAll, beforeEach, expect } from 'vitest';
import { bodyJson, testAppStart } from './utils.js';
import * as HTTP from 'http-errors-enhanced';
import type { SecretDataDto } from '../src/controllers/secret-data/dtos/secret-data.dto.js';

describe('SecretDataController', async (test) => {
  const { pgContainer, app } = await testAppStart();
  const fastify = app.context.resolve('httpServer').fastify;
  const frontendOrigin = app.context.resolve('config').frontendURLs[0]!.origin;
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
    const resCreate = await fastify.inject({
      method: 'POST', url: '/api/v1/secret-data',
      payload,
    }).then(bodyJson);
    expect(resCreate).toMatchObject({
      statusCode: HTTP.OK,
      body: { id: expect.stringMatching(/^[0-9a-z]{40}$/) },
    });
    const id = resCreate.body.id as string;
    expect(await secretDataCache.get(id)).to.deep.equal(payload);

    const resGet = await fastify.inject({
      method: 'GET', url: `/api/v1/secret-data/${id}`,
      headers: { origin: frontendOrigin },
    }).then(bodyJson);
    expect(resGet).toMatchObject({ statusCode: HTTP.OK, body: payload });
  });

  test('Incorrect data cannot be saved', async () => {
    expect(await fastify.inject({
      method: 'POST', url: '/api/v1/secret-data',
      payload: {},
      headers: { origin: frontendOrigin },
    }).then(bodyJson)).toMatchObject({
      statusCode: HTTP.BAD_REQUEST,
      body: new HTTP.BadRequestError('One or more validations failed trying to process your request.', {
        failedValidations: { body: { subject: 'must be present' } },
      }).serialize(true, true),
    });

    expect(await fastify.inject({
      method: 'POST', url: '/api/v1/secret-data',
      payload: { subject: { id: {} }, clientSession: 123, redirectURL: '', other1: 1, other2: { value: 2 } },
      headers: { origin: frontendOrigin },
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

  test('Route handles a non-existing ID', async () => {
    expect(await fastify.inject({
      method: 'GET', url: '/api/v1/secret-data/123',
      headers: { origin: frontendOrigin },
    }).then(bodyJson)).toMatchObject({
      statusCode: HTTP.NOT_FOUND,
      body: new HTTP.NotFoundError('Data not found').serialize(true, true),
    });
  });

  test('Saved data accessible from frontend only', async () => {
    expect(await fastify.inject({
      method: 'GET', url: `/api/v1/secret-data/123`,
      headers: { origin: 'http://example.com' },
    }).then(bodyJson)).toMatchObject({
      statusCode: HTTP.FORBIDDEN,
      body: new HTTP.ForbiddenError('You do not have permission to access this resource.').serialize(),
    });
  });
});
