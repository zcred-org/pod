import { tokens } from '../util/tokens.js';
import { type CredentialStore } from '../stores/credential.store.js';
import { ReturnType } from '@sinclair/typebox';

export class CredentialService {
  public static readonly inject = tokens('credentialStore');

  constructor(private readonly credentialStore: CredentialStore) {}

  public async findOneById(
    ...args: Parameters<CredentialStore['findOneById']>
  ): ReturnType<CredentialStore['findOneById']> {
    return this.credentialStore.findOneById(...args);
  }

  public async findMany(
    ...args: Parameters<CredentialStore['findMany']>
  ): ReturnType<CredentialStore['findMany']> {
    return this.credentialStore.findMany(...args);
  }

  public async upsertOne(
    ...args: Parameters<CredentialStore['upsertOne']>
  ): ReturnType<CredentialStore['upsertOne']> {
    return this.credentialStore.upsertOne(...args);
  }
}
