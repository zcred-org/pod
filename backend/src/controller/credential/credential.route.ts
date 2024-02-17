import { TRoute } from '../../types/TRoute.js';
import { TCredentialEntityNew } from '../../entities/schema.js';

export type TCredentialUpsertRoute = {
  Body: TCredentialEntityNew,
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
} as const satisfies TRoute;
