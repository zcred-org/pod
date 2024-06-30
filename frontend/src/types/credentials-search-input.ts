import type { Proposal, Selector } from '@/service/external/verifier/types.ts';
import type { CredentialsApi } from '@/service/external/zcred-store/credentials.api.ts';

export type CredentialsSearchInput = Required<Parameters<CredentialsApi['credentials']>[0]>

export function credentialsSearchInputFrom(
  input: NonNullable<CredentialsSearchInput> | Proposal | Selector,
): CredentialsSearchInput {
  if ('meta' in input && 'attributes' in input) {
    return {
      issuer: input.meta.issuer,
      subject: input.attributes.subject.id,
    };
  }
  if ('selector' in input) {
    return {
      issuer: input.selector.meta.issuer,
      subject: input.selector.attributes.subject.id,
    };
  }
  return input;
}
