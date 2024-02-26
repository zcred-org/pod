import { components, paths } from './generated';

export type ZCredStore = components['schemas'] & {
  CredentialUpsertRoute: {
    body: NonNullable<paths['/api/v1/credential']['post']['requestBody']>['content']['application/json'];
    200: paths['/api/v1/credential']['post']['responses']['200']['content']['application/json'];
  },
  CredentialsRoute: {
    query: paths['/api/v1/credentials']['get']['parameters']['query'];
    200: paths['/api/v1/credentials']['get']['responses']['200']['content']['application/json'];
  }
};

type Route<Url extends keyof paths, Method extends keyof paths[Url]> = {
  url: Url;
  method: Method;
}

export const ZCredStoreCredentialUpsertRoute = {
  url: '/api/v1/credential',
  method: 'post',
} satisfies Route<'/api/v1/credential', 'post'>;


export const ZCredStoreCredentialsRoute = {
  url: '/api/v1/credentials',
  method: 'get',
} satisfies Route<'/api/v1/credentials', 'get'>;
