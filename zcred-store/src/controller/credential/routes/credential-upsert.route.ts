import type { Route } from '../../../types/route.js';
import { type Issuer, IssuerSchema } from '../../../types/subject-id.type.js';
import { type Identifier, IdentifierSchema } from '../../../types/identifier.type.js';
import { CredentialEntityParsedSchema } from '../../../entities/credential.entity.js';

export type CredentialUpsertRoute = {
  Body: {
    id?: string,
    issuer: Issuer,
    subjectId: Identifier,
    data: string,
  },
  Headers: {
    did: string,
  },
}

export const CredentialUpsertRoute = {
  method: 'POST',
  url: '/api/v1/credential',
  schema: {
    body: {
      type: 'object',
      required: ['data', 'issuer', 'subjectId'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        data: { type: 'string' },
        issuer: IssuerSchema,
        subjectId: IdentifierSchema,
      },
    },
    response: {
      200: CredentialEntityParsedSchema,
    },
  },
} as const satisfies Route;
