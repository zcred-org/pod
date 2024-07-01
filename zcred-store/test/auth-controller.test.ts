import { describe, afterAll, assert, expect, beforeEach } from 'vitest';
import { bodyJson, testAppStart } from './utils.js';
import * as HTTP from 'http-errors-enhanced';
import { didFromSeed } from '../src/util/index.js';
import { jwtDecode } from 'jwt-decode';

describe('AuthController', async (test) => {
  const { pgContainer, app } = await testAppStart();
  const fastify = app.context.resolve('httpServer').fastify;
  const frontendOrigin = app.context.resolve('config').frontendURL.origin;
  const { nonceCache } = app.context.resolve('cacheManager');
  const did = await didFromSeed('user1');

  beforeEach(() => nonceCache.clear());

  afterAll(async () => {
    await app.close();
    await pgContainer.stop();
  });

  test('Should provide JWT', async () => {
    const nonceResp = await fastify.inject({
      url: '/api/v1/want-auth',
      method: 'POST',
      body: { did: did.id },
      headers: { origin: frontendOrigin },
    });
    assert.equal(nonceResp.statusCode, HTTP.OK, `authResp.statusCode must be ${HTTP.OK}, but got ${nonceResp.statusCode}. Body: ${nonceResp.body}`);
    const nonce = nonceResp.body;
    const { signatures: [signature] } = await did.createJWS(nonce);
    const authResp = await fastify.inject({
      url: '/api/v1/auth',
      method: 'POST',
      body: { did: did.id, signature },
      headers: { origin: frontendOrigin },
    });
    assert.equal(authResp.statusCode, HTTP.OK, `authResp.statusCode must be ${HTTP.OK}, but got ${authResp.statusCode}. Body: ${authResp.body}`);
    const { jwt, jwtPayload } = { jwt: authResp.body, jwtPayload: jwtDecode(authResp.body) };
    assert.isString(jwt, 'Auth must return a JWT string');
    expect(jwtPayload).toMatchObject({
      nonce: expect.any(String),
      did: did.id,
      exp: expect.any(Number),
      iat: expect.any(Number),
    });
    assert(Object.keys(jwtPayload).length === 4);
  });

  test('Should reject when user1 tries to authenticate as user2', async () => {
    const { id: otherId } = await didFromSeed('user2');
    const wantAuthResp = await fastify.inject({
      method: 'POST', url: '/api/v1/want-auth',
      body: { did: otherId },
      headers: { origin: frontendOrigin },
    });
    expect(wantAuthResp).toMatchObject({
      statusCode: HTTP.OK,
      body: expect.stringMatching(/^.{8}-.{4}-.{4}-.{4}-.{12}$/), // body is UUID "nonce"
    });
    const { signatures: [signature] } = await did.createJWS(wantAuthResp.body);
    assert.deepNestedInclude(await fastify.inject({
      method: 'POST', url: '/api/v1/auth',
      body: { did: otherId, signature },
      headers: { origin: frontendOrigin },
    }).then(bodyJson), {
      statusCode: HTTP.UNAUTHORIZED,
      body: new HTTP.UnauthorizedError('Invalid signature').serialize(),
    });
  });

  test('Auth without receiving nonce should fail', async () => {
    assert.deepNestedInclude(await fastify.inject({
      method: 'POST', url: '/api/v1/auth',
      body: {
        did: did.id,
        signature: { protected: '', signature: '' },
      },
      headers: { origin: frontendOrigin },
    }).then(bodyJson), {
      statusCode: HTTP.UNAUTHORIZED,
      body: new HTTP.UnauthorizedError('Nonce not found').serialize(),
    });
  });

  test('Should reject on strange signature', async () => {
    await nonceCache.set(did.id, '123');
    assert.deepNestedInclude(await fastify.inject({
      method: 'POST', url: '/api/v1/auth',
      body: { did: did.id, signature: { protected: 'something', signature: 'something' } },
      headers: { origin: frontendOrigin },
    }).then(bodyJson), {
      statusCode: HTTP.UNAUTHORIZED,
      body: new HTTP.UnauthorizedError('Invalid signature').serialize(),
    });
  });

  test('Should reject on invalid input', async () => {
    assert.deepNestedInclude(await fastify.inject({
      method: 'POST', url: '/api/v1/auth',
      headers: { origin: frontendOrigin },
    }).then(bodyJson), {
      statusCode: HTTP.BAD_REQUEST,
      body: new HTTP.BadRequestError('One or more validations failed trying to process your request.', {
        failedValidations: { body: { $root: 'must be a object' } },
      }).serialize(true, true),
    });

    assert.deepNestedInclude(await fastify.inject({
      method: 'POST', url: '/api/v1/auth',
      body: {},
      headers: { origin: frontendOrigin },
    }).then(bodyJson), {
      statusCode: HTTP.BAD_REQUEST,
      body: new HTTP.BadRequestError('One or more validations failed trying to process your request.', {
        failedValidations: { body: { did: 'must be present', signature: 'must be present' } },
      }).serialize(true, true),
    });

    assert.deepNestedInclude(await fastify.inject({
      method: 'POST', url: '/api/v1/auth',
      body: { did: did.id, signature: '123' },
      headers: { origin: frontendOrigin },
    }).then(bodyJson), {
      statusCode: HTTP.BAD_REQUEST,
      body: new HTTP.BadRequestError('One or more validations failed trying to process your request.', {
        failedValidations: { body: { signature: 'must be a object' } },
      }).serialize(true, true),
    });
  });
});
