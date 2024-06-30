import type { HttpCredential, HttpIssuer, Info } from '@zcredjs/core';
import type { O1JSCredentialFilter } from '@/service/o1js-credential-filter';
import type { WalletStoreState } from '@/stores/wallet.store.ts';
import type { CredentialMarked } from '@/types/credentials-marked.ts';
import { type DateInterval, dateIntervalFieldsFrom, isDateIntervalMatched } from '@/types/date-interval.ts';
import { DetailedError } from '@/util/errors.ts';

export async function credentialIssueOrUpdatePure(
  args: {
    credential?: CredentialMarked,
    wallet: WalletStoreState,
    httpIssuer: HttpIssuer,
    issuerInfo: Info,
    credentialFilter: O1JSCredentialFilter,
    validInterval?: DateInterval,
  },
): Promise<HttpCredential> {
  let credentialNew: HttpCredential | undefined = undefined;
  if (!args.credential) {
    if (!args.httpIssuer.browserIssue) throw new Error('Issuer does not support credential issuance');
    if (!isDateIntervalMatched(args.validInterval, dateIntervalFieldsFrom(args.issuerInfo))) {
      throw new Error('Valid interval does not match issuer info');
    }
    credentialNew = await args.httpIssuer.browserIssue({
      challengeReq: {
        subject: { id: args.wallet.subjectId },
        options: { chainId: args.wallet.chainId },
        validFrom: args.validInterval?.from?.toISOString(),
        validUntil: args.validInterval?.to?.toISOString(),
      },
      sign: args.wallet.adapter.sign,
      windowOptions: { target: '_blank' },
    }).catch((error: Error) => {
      throw new DetailedError('Credential issuance failed', error);
    });
  } else if (args.credential.isUpdatable) {
    if (!args.httpIssuer.updateProofs) throw new Error('Issuer does not support credential update');
    credentialNew = await args.httpIssuer.updateProofs(args.credential.data).catch(error => {
      throw new DetailedError('Credential update failed', error);
    });
  }
  if (!credentialNew) {
    throw new Error('Credential issue or update is not required');
  }
  return credentialNew;
}
