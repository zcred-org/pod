import { ZCredStoreApi } from '@/service/external/zcred-store/index.ts';
import { ZCredStore, ZCredStoreAuthRoute, ZCredStoreWantAuthRoute } from '@/service/external/zcred-store/api-specification.ts';

export class AuthApi {
  constructor(private readonly context: ZCredStoreApi['context']) {
  }

  public readonly wantAuth = async (body: ZCredStore['WantAuthRoute']['body']) => {
    return this.context.axios.request<ZCredStore['WantAuthRoute']['200']>({
      ...ZCredStoreWantAuthRoute,
      data: body,
    }).then(({ data }) => data);
  };

  public readonly auth = async (body: ZCredStore['AuthRoute']['body']) => {
    return this.context.axios.request<ZCredStore['AuthRoute']['200']>({
      ...ZCredStoreAuthRoute,
      data: body,
    }).then(({ data }) => data);
  };
}
