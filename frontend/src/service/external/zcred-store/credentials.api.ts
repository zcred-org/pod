import { ZCredStore, ZCredStoreCredentialByIdRoute, ZCredStoreCredentialsRoute, ZCredStoreCredentialUpsertRoute } from './api-specification.ts';
import type { HttpCredential } from '@zcredjs/core';
import { ZCredStoreApi } from './index.ts';
import { useDidStore } from '@/hooks/useDid.store.ts';

export class CredentialsApi {
  constructor(private readonly context: ZCredStoreApi['context']) {}

  public readonly credentialById = async (id: string): Promise<ZCredStore['CredentialDecoded']> => {
    const res = await this.context.axios.request<ZCredStore['CredentialByIdRoute']['200']>({
      ...ZCredStoreCredentialByIdRoute,
      url: ZCredStoreCredentialByIdRoute.url.replace('{id}', id),
    });
    return {
      ...res.data,
      data: await useDidStore.getState().decrypt<HttpCredential>(res.data.data),
    };
  };

  public readonly credentials = async (
    filter: { subject?: ZCredStore['IdentifierDto'], issuer?: ZCredStore['IssuerDto'] } = {},
  ): Promise<ZCredStore['CredentialDecoded'][]> => {
    const params = filter.issuer && filter.subject && {
      'issuer.type': filter.issuer.type,
      'issuer.uri': filter.issuer.uri.replace(/\/+$/, ''), // TODO: Unify the format
      'subject.id.type': filter.subject.type,
      'subject.id.key': filter.subject.key,
    } satisfies ZCredStore['CredentialsRoute']['query'];
    const res = await this.context.axios.request<ZCredStore['CredentialsRoute']['200']>({
      ...ZCredStoreCredentialsRoute,
      params,
    });
    // TODO: hangup???!
    return Promise.all(res.data.map(async credential => ({
      ...credential,
      data: await useDidStore.getState().decrypt<HttpCredential>(credential.data),
    })));
  };

  public readonly credentialUpsert = async (credential: HttpCredential, id?: string): Promise<ZCredStore['CredentialDecoded']> => {
    const body: ZCredStore['CredentialUpsertRoute']['body'] = {
      id,
      data: await useDidStore.getState().encrypt(credential),
      issuer: credential.meta.issuer,
      subjectId: credential.attributes.subject.id,
    };
    const res = await this.context.axios.request<ZCredStore['CredentialUpsertRoute']['200']>({
      ...ZCredStoreCredentialUpsertRoute,
      data: body,
    });
    return {
      ...res.data,
      data: await useDidStore.getState().decrypt<HttpCredential>(res.data.data),
    };
  };
}
