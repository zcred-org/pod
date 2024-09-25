import type { components, paths } from './generated';

export type ZCredStore = components['schemas'] & {
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
  SecretDataByIdRoute: {
    query: paths['/api/v1/secret-data/{id}']['get']['parameters']['path'];
    200: paths['/api/v1/secret-data/{id}']['get']['responses']['200']['content']['application/json'];
  },
  ZkpResultCacheSaveRoute: {
    body: NonNullable<paths['/api/v1/zkp-result-cache']['post']['requestBody']>['content']['application/json'];
    200: paths['/api/v1/zkp-result-cache']['post']['responses']['200']['content']['application/json'];
  },
  ZkpResultCacheGetRoute: {
    query: paths['/api/v1/zkp-result-cache/{jalId}']['get']['parameters']['path'];
    200: paths['/api/v1/zkp-result-cache/{jalId}']['get']['responses']['200']['content']['application/json'];
  },
};

type Route<Url extends keyof paths, Method extends keyof paths[Url]> = {
  url: Url;
  method: Method;
}

export const ZCredStoreCredentialByIdRoute: Route<'/api/v1/credential/{id}', 'get'> = {
  url: '/api/v1/credential/{id}',
  method: 'get',
};

export const ZCredStoreCredentialsRoute: Route<'/api/v1/credentials', 'get'> = {
  url: '/api/v1/credentials',
  method: 'get',
};

export const ZCredStoreCredentialUpsertRoute: Route<'/api/v1/credential', 'post'> = {
  url: '/api/v1/credential',
  method: 'post',
};

export const ZCredStoreWantAuthRoute: Route<'/api/v1/want-auth', 'post'> = {
  url: '/api/v1/want-auth',
  method: 'post',
};

export const ZCredStoreAuthRoute: Route<'/api/v1/auth', 'post'> = {
  url: '/api/v1/auth',
  method: 'post',
};

export const ZCredStoreSecretDataByIdRoute: Route<'/api/v1/secret-data/{id}', 'get'> = {
  url: '/api/v1/secret-data/{id}',
  method: 'get',
};

export const ZCredStoreZkpResultCacheSaveRoute: Route<'/api/v1/zkp-result-cache', 'post'> = {
  url: '/api/v1/zkp-result-cache',
  method: 'post',
};

export const ZCredStoreZkpResultCacheGetRoute: Route<'/api/v1/zkp-result-cache/{jalId}', 'get'> = {
  url: '/api/v1/zkp-result-cache/{jalId}',
  method: 'get',
};
