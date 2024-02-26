import { tokens } from '../util/tokens.js';
import { type CredentialStore } from '../stores/credential.store.js';
import { ReturnType } from '@sinclair/typebox';

export class CredentialService {
  public static readonly inject = tokens('credentialStore');

  constructor(private readonly credentialStore: CredentialStore) {}

  public async credentialUpsert(
    ...args: Parameters<CredentialStore['credentialUpsert']>
  ): ReturnType<CredentialStore['credentialUpsert']> {
    return this.credentialStore.credentialUpsert(...args);
  }

  public async credentialsSearch(
    ...args: Parameters<CredentialStore['credentialsSearch']>
  ): ReturnType<CredentialStore['credentialsSearch']> {
    return this.credentialStore.credentialsSearch(...args);
  }
}
