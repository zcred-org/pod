import type { Identifier as _Identifier } from '@zcredjs/core';

export type Identifier = _Identifier;

export const IdentifierSchema = {
  type: 'object',
  required: ['type', 'key'],
  properties: {
    type: { type: 'string' },
    key: { type: 'string' },
  },
} as const;
