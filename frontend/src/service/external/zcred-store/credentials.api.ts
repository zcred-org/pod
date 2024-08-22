import type { HttpCredential } from '@zcredjs/core';
import type { CredentialsApiGetManyArgs } from '@/service/external/zcred-store/types/credentials-api.types.ts';
import type { CredentialDecoded, CredentialsDecodedDto } from '@/service/external/zcred-store/types/credentials.types.ts';
import { DidStore } from '@/stores/did.store.ts';
import { type ZCredStore, ZCredStoreCredentialByIdRoute, ZCredStoreCredentialsRoute, ZCredStoreCredentialUpsertRoute } from './api-specification.ts';
import type { ZCredStoreApi } from './index.ts';


export class CredentialsApi {
  constructor(private readonly context: ZCredStoreApi['context']) {
    this.credentialById = this.credentialById.bind(this);
    this.credentials = this.credentials.bind(this);
    this.credentialUpsert = this.credentialUpsert.bind(this);
  }

  public async credentialById(args: { id: string, signal?: AbortSignal }): Promise<CredentialDecoded> {
    const res = await this.context.axios.request<ZCredStore['CredentialByIdRoute']['200']>({
      ...ZCredStoreCredentialByIdRoute,
      url: ZCredStoreCredentialByIdRoute.url.replace('{id}', args.id),
      signal: args.signal,
    });
    return {
      ...res.data,
      data: await DidStore.decrypt<HttpCredential>(res.data.data),
    };
  }

  public async credentials(
    args?: CredentialsApiGetManyArgs & {
      signal?: AbortSignal,
    },
  ): Promise<CredentialsDecodedDto> {
    const result = await this.context.axios.request<ZCredStore['CredentialsRoute']['200']>({
      ...ZCredStoreCredentialsRoute,
      params: {
        ...args?.search,
        ...args?.pagination,
      } satisfies ZCredStore['CredentialsSearchParamsDto'],
      signal: args?.signal,
    }).then(res => res.data);
    return {
      ...result,
      // TODO: hangup???!
      credentials: await Promise.all(result.credentials.map(async credential => ({
        ...credential,
        data: await DidStore.decrypt<HttpCredential>(credential.data),
      }))),
    };
  }

  public async credentialUpsert(credential: HttpCredential, id?: string): Promise<CredentialDecoded> {
    const body: ZCredStore['CredentialUpsertRoute']['body'] = {
      id,
      data: await DidStore.encrypt(credential),
      issuer: credential.meta.issuer,
      subjectId: credential.attributes.subject.id,
    };
    const res = await this.context.axios.request<ZCredStore['CredentialUpsertRoute']['200']>({
      ...ZCredStoreCredentialUpsertRoute,
      data: body,
    });
    return {
      ...res.data,
      data: await DidStore.decrypt<HttpCredential>(res.data.data),
    };
  }
}
