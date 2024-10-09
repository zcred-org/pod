import type { ZCredStoreApi } from '@/service/external/zcred-store';
import { type ZCredStore, ZCredStoreAuthRoute, ZCredStoreWantAuthRoute } from '@/service/external/zcred-store/api-specification.ts';


export class AuthApi {
  constructor(private readonly context: ZCredStoreApi['context']) {
    this.wantAuth = this.wantAuth.bind(this);
    this.auth = this.auth.bind(this);
  }

  public async wantAuth(body: ZCredStore['WantAuthRoute']['body']) {
    return this.context.axios.request<ZCredStore['WantAuthRoute']['200']>({
      ...ZCredStoreWantAuthRoute,
      data: body,
    }).then(({ data }) => data);
  }

  public async auth(body: ZCredStore['AuthRoute']['body']) {
    return this.context.axios.request<ZCredStore['AuthRoute']['200']>({
      ...ZCredStoreAuthRoute,
      data: body,
    }).then(({ data }) => data);
  }
}
