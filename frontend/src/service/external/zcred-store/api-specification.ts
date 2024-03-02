import { components, paths } from './generated';
import { type HttpCredential } from '@zcredjs/core';

export type ZCredStore = components['schemas'] & {
  CredentialDecoded: Omit<components['schemas']['CredentialDto'], 'data'> & {
    data: HttpCredential;
  },
  CredentialByIdRoute: {
    path: paths['/api/v1/credential/{id}']['get']['parameters']['path'];
    200: paths['/api/v1/credential/{id}']['get']['responses']['200']['content']['application/json'];
  },
  CredentialsRoute: {
    query: paths['/api/v1/credentials']['get']['parameters']['query'];
    200: paths['/api/v1/credentials']['get']['responses']['200']['content']['application/json'];
  },
  CredentialUpsertRoute: {
    body: NonNullable<paths['/api/v1/credential']['post']['requestBody']>['content']['application/json'];
    200: paths['/api/v1/credential']['post']['responses']['200']['content']['application/json'];
  },
  WantAuthRoute: {
    body: NonNullable<paths['/api/v1/want-auth']['post']['requestBody']>['content']['application/json'];
    200: paths['/api/v1/want-auth']['post']['responses']['200']['content']['application/json'];
  },
  AuthRoute: {
    body: NonNullable<paths['/api/v1/auth']['post']['requestBody']>['content']['application/json'];
    200: paths['/api/v1/auth']['post']['responses']['200']['content']['application/json'];
  },
};

type Route<Url extends keyof paths, Method extends keyof paths[Url]> = {
  url: Url;
  method: Method;
}

export const ZCredStoreCredentialByIdRoute = {
  url: '/api/v1/credential/{id}',
  method: 'get',
} satisfies Route<'/api/v1/credential/{id}', 'get'>;

export const ZCredStoreCredentialUpsertRoute = {
  url: '/api/v1/credential',
  method: 'post',
} satisfies Route<'/api/v1/credential', 'post'>;

export const ZCredStoreCredentialsRoute = {
  url: '/api/v1/credentials',
  method: 'get',
} satisfies Route<'/api/v1/credentials', 'get'>;

export const ZCredStoreWantAuthRoute = {
  url: '/api/v1/want-auth',
  method: 'post',
} satisfies Route<'/api/v1/want-auth', 'post'>;

export const ZCredStoreAuthRoute = {
  url: '/api/v1/auth',
  method: 'post',
} satisfies Route<'/api/v1/auth', 'post'>;
