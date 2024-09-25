import { type Static, Type } from '@sinclair/typebox';
import { ZkpResultCacheDto } from './zkp-result-cache.dto.js';


export type ZkpResultCacheCreateDto = Static<typeof ZkpResultCacheCreateDto>

export const ZkpResultCacheCreateDto = Type.Pick(ZkpResultCacheDto, ['jalId', 'data'], {
  $id: 'ZkpResultCacheCreateDto',
  description: 'ZkpResultCache create object',
  additionalProperties: false,
});

export const ZkpResultCacheCreateDtoRef = Type.Ref(ZkpResultCacheCreateDto);
