import type { AxiosError } from 'axios';
import { bindAll } from 'lodash-es';
import type { ZkpResult } from '@/service/external/verifier/types.ts';
import type { ZCredStoreApi } from '@/service/external/zcred-store';
import {
  type ZCredStore,
  ZCredStoreZkpResultCacheGetRoute,
  ZCredStoreZkpResultCacheSaveRoute,
} from '@/service/external/zcred-store/api-specification.ts';
import { base64UrlDecode, base64UrlEncode } from '@/util/independent/base64.ts';


export class ZkpResultCacheApi {
  constructor(private readonly context: ZCredStoreApi['context']) {
    bindAll(this);
  }

  public async save(args: { jalId: string, zkpResult: ZkpResult, signal?: AbortSignal }): Promise<void> {
    const body: ZCredStore['ZkpResultCacheUpsertDto'] = {
      jalId: args.jalId,
      data: base64UrlEncode(await this.context.didStore.encrypt(args.zkpResult)),
    };
    await this.context.axios.request<ZCredStore['ZkpResultCacheSaveRoute']['200']>({
      ...ZCredStoreZkpResultCacheSaveRoute,
      data: body,
      signal: args.signal,
    });
  }

  public async get(args: { jalId: string, signal?: AbortSignal }): Promise<ZkpResult | null> {
    const res = await this.context.axios.request<ZCredStore['ZkpResultCacheGetRoute']['200']>({
      ...ZCredStoreZkpResultCacheGetRoute,
      url: ZCredStoreZkpResultCacheGetRoute.url.replace('{jalId}', args.jalId),
      signal: args.signal,
    }).catch((err: AxiosError) => {
      if (err.response?.status === 404) return null;
      else throw err;
    });
    if (!res) return null;
    return await this.context.didStore.decrypt<ZkpResult>(base64UrlDecode(res.data.data));
  }
}
