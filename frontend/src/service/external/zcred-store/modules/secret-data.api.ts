import type { ZCredStoreApi } from '@/service/external/zcred-store';
import { type ZCredStore, ZCredStoreSecretDataByIdRoute } from '@/service/external/zcred-store/api-specification.ts';


export class SecretDataApi {
  constructor(private readonly context: ZCredStoreApi['context']) {
    this.secretDataById = this.secretDataById.bind(this);
  }

  public async secretDataById(id: string): Promise<ZCredStore['SecretDataDto']> {
    const res = await this.context.axios.request<ZCredStore['SecretDataByIdRoute']['200']>({
      ...ZCredStoreSecretDataByIdRoute,
      url: ZCredStoreSecretDataByIdRoute.url.replace('{id}', id),
    });
    return res.data;
  }
}
