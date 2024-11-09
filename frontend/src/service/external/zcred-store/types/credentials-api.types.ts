import type { Proposal } from '@/service/external/verifier/types.ts';
import type { ZCredStore } from '@/service/external/zcred-store/api-specification.ts';


export type CredentialsGetManySearchArgs = Pick<ZCredStore['CredentialsSearchParamsDto'], 'issuer.type' | 'issuer.uri' | 'subject.id.type' | 'subject.id.key'>
export type CredentialsGetManyPaginationArgs = Pick<ZCredStore['CredentialsSearchParamsDto'], 'offset' | 'limit'>;
export type CredentialsGetManyPaginationRequiredArgs = Required<CredentialsGetManyPaginationArgs>;

export type CredentialsGetManyArgs = {
  search?: CredentialsGetManySearchArgs,
  pagination?: CredentialsGetManyPaginationArgs,
};

export function credentialsGetManySearchArgsFrom(input: Proposal): CredentialsGetManySearchArgs {
  return {
    'issuer.type': input.selector.meta.issuer.type,
    'issuer.uri': input.selector.meta.issuer.uri.replace(/\/+$/, ''), // TODO: Unify the format
    'subject.id.type': input.selector.attributes.subject.id.type,
    'subject.id.key': input.selector.attributes.subject.id.key,
  };
}
