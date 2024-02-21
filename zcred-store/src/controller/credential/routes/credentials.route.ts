import type { Route } from '../../../types/route.js';
import type { MetaIssuerType } from '@zcredjs/core';
import { CredentialEntityParsedSchema } from '../../../entities/credential.entity.js';

export type CredentialsRoute = {
  Querystring: {
    'subject.id.key'?: string,
    'subject.id.type'?: string,
    'issuer.type'?: MetaIssuerType,
    'issuer.uri'?: string,
  },
  Headers: {
    did: string,
  },
}

export const CredentialsRoute = {
  method: 'GET',
  url: '/api/v1/credentials',
  schema: {
    querystring: {
      type: 'object',
      properties: {
        'subject.id.key': { type: 'string' },
        'subject.id.type': { type: 'string' },
        'issuer.type': { type: 'string' },
        'issuer.uri': { type: 'string' },
      },
    },
    response: {
      200: {
        type: 'array',
        items: CredentialEntityParsedSchema,
      },
    },
  },
} as const satisfies Route;
