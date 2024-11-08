import { Type, type Static } from '@sinclair/typebox';
import { ZkpResultCacheEntity } from '../../../models/entities/zkp-result-cache.entity.js';


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

export function zkpResultCacheDtoFrom(
  entity: Pick<ZkpResultCacheEntity, 'id' | 'jalId' | 'data' | 'createdAt'>
): ZkpResultCacheDto {
  return {
    id: entity.id,
    jalId: entity.jalId,
    data: entity.data,
    createdAt: entity.createdAt.toISOString(),
  }
}
