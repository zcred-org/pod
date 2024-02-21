import type { MetaIssuerType } from '@zcredjs/core';

export type Issuer = {
  type: MetaIssuerType;
  uri: string;
}

export const IssuerSchema = {
  type: 'object',
  required: ['type', 'uri'],
  properties: {
    type: { type: 'string' },
    uri: { type: 'string' },
  },
} as const;
