import { Type, type Static } from '@sinclair/typebox';


export type ZkpResultCacheDto = Static<typeof ZkpResultCacheDto>

export const ZkpResultCacheDto = Type.Object({
  id: Type.String(),
  jalId: Type.String({ minLength: 64, maxLength: 64 }),
  data: Type.String(), // base64url encoded
  createdAt: Type.String({ format: 'date-time' }),
}, {
  $id: 'ZkpResultCacheDto',
  description: 'ZkpResultCache object',
  additionalProperties: false,
});

export const ZkpResultCacheDtoRef = Type.Ref(ZkpResultCacheDto);
