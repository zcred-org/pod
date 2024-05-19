import { App } from '../src/app.js';
import { describe, beforeAll, afterAll, assert, expect } from 'vitest';
import { jwtRequest, bodyJson } from './utils.js';
import type { FastifyInstance } from 'fastify';
import type { DID } from 'dids';
import * as HTTP from 'http-errors-enhanced';
import { didFromSeed } from '../src/util/index.js';

describe('AuthController', (test) => {
  let app: App;
  let fastify: FastifyInstance;
  let did: DID;

  beforeAll(async () => {
    app = await App.init();
    fastify = app.context.resolve('httpServer').fastify;
    did = await didFromSeed('user1');
  });
  afterAll(async () => await app.close());

  test('Should provide JWT', async () => await jwtRequest({ fastify, did }));

  test('Should reject when user1 tries to authenticate as user2', async () => {
    // Step 1: get nonce for user2
    const { id: otherId } = await didFromSeed('user2');
    const wantAuthResp = await fastify.inject({
      method: 'POST', url: '/api/v1/want-auth',
      body: { did: otherId },
    });
    expect(wantAuthResp).toMatchObject({
      statusCode: HTTP.OK,
      body: expect.stringMatching(/^.{8}-.{4}-.{4}-.{4}-.{12}$/), // body is UUID "nonce"
    });
    // Step 2: try to authenticate as user2
    const { signatures: [signature] } = await did.createJWS(wantAuthResp.body);
    assert.deepNestedInclude(await fastify.inject({ method: 'POST', url: '/api/v1/auth', body: { did: otherId, signature } }).then(bodyJson), {
      statusCode: HTTP.UNAUTHORIZED,
      body: new HTTP.UnauthorizedError('Invalid signature').serialize(),
    });
  });

  test('Should reject on strange signature', async () => {
    assert.deepNestedInclude(await fastify.inject({
      method: 'POST', url: '/api/v1/auth',
      body: { did: did.id, signature: { protected: 'something', signature: 'something' } },
    }).then(bodyJson), {
      statusCode: HTTP.UNAUTHORIZED,
      body: new HTTP.UnauthorizedError('Invalid signature').serialize(),
    });
  });

  test('Should reject on invalid input', async () => {
    assert.deepNestedInclude(await fastify.inject({ method: 'POST', url: '/api/v1/auth' }).then(bodyJson), {
      statusCode: HTTP.BAD_REQUEST,
      body: new HTTP.BadRequestError('One or more validations failed trying to process your request.', {
        failedValidations: { body: { $root: 'must be a object' } },
      }).serialize(true, true),
    });

    assert.deepNestedInclude(await fastify.inject({ method: 'POST', url: '/api/v1/auth', body: {} }).then(bodyJson), {
      statusCode: HTTP.BAD_REQUEST,
      body: new HTTP.BadRequestError('One or more validations failed trying to process your request.', {
        failedValidations: { body: { did: 'must be present', signature: 'must be present' } },
      }).serialize(true, true),
    });

    assert.deepNestedInclude(await fastify.inject({ method: 'POST', url: '/api/v1/auth', body: { did: did.id, signature: '123' } }).then(bodyJson), {
      statusCode: HTTP.BAD_REQUEST,
      body: new HTTP.BadRequestError('One or more validations failed trying to process your request.', {
        failedValidations: { body: { signature: 'must be a object' } },
      }).serialize(true, true),
    });
  });
});
