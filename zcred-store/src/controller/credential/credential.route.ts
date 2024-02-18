import { Route } from '../../types/route.js';
import { CredentialEntityNew } from '../../entities/schema.js';

export type TCredentialUpsertRoute = {
  Body: CredentialEntityNew,
}

export const CredentialUpsertRoute = {
  method: 'POST',
  url: '/api/v1/credential',
  schema: {
    body: {
      type: 'object',
      required: ['data'],
      properties: {
        id: { type: 'string' },
        data: { type: 'string' },
      },
    },
  },
} as const satisfies Route;
