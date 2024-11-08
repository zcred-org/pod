import { type Static, Type } from '@sinclair/typebox';
import { ZkpResultCacheDto } from './zkp-result-cache.dto.js';


export type ZkpResultCacheUpsertDto = Static<typeof ZkpResultCacheUpsertDto>

export const ZkpResultCacheUpsertDto = Type.Pick(ZkpResultCacheDto, ['jalId', 'data'], {
  $id: 'ZkpResultCacheUpsertDto',
  description: 'ZkpResultCache upsert object',
  additionalProperties: false,
});

export const ZkpResultCacheUpsertDtoRef = Type.Ref(ZkpResultCacheUpsertDto);
