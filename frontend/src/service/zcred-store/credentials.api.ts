import { ZCredStore, ZCredStoreCredentialsRoute, ZCredStoreCredentialUpsertRoute } from './api-specification.ts';
import type { HttpCredential } from '@zcredjs/core';
import { ZCredStoreApi } from './zcred-store.api.ts';
import { useDidStore } from '@/hooks/useDid.store.ts';

export class CredentialsApi {
  constructor(private readonly context: ZCredStoreApi['context']) {}

  public readonly credentialUpsert = async (
    credential: HttpCredential,
  ) => {
    const body: ZCredStore['CredentialUpsertRoute']['body'] = {
      data: await useDidStore.getState().encrypt(credential),
      issuer: credential.meta.issuer,
      subjectId: credential.attributes.subject.id,
    };
    await this.context.axios.request<ZCredStore['CredentialUpsertRoute']['200']>({
      ...ZCredStoreCredentialUpsertRoute,
      data: body,
    });
  };

  public readonly credentials = async (
    filter: { subject?: ZCredStore['IdentifierDto'], issuer?: ZCredStore['IssuerDto'] },
  ) => {
    const params = filter.issuer && filter.subject && {
      'issuer.type': filter.issuer.type,
      'issuer.uri': filter.issuer.uri,
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
}
