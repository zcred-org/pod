import { isJsonIssuerException, isJsonVerifierException } from '@zcredjs/core';
import { toast } from 'sonner';
import { promptModal } from '@/components/modals/PromptModals.tsx';
import { AppGlobal } from '@/config/app-global.ts';
import { IssuerBrowserIssueException, VerifierProofSendException } from '@/stores/verification-store/other/exceptions-specification.ts';
import { VerificationInitActions } from '@/stores/verification-store/verification-init-actions.ts';
import { VerificationStore } from '@/stores/verification-store/verification-store.ts';
import { VerificationTerminateActions } from '@/stores/verification-store/verification-terminate-actions.ts';


export class VerificationErrorActions {
  public static async credentialIssueCatch(args: { error: unknown, issuerHost: string }): Promise<void> {
    if (!args.error || !VerificationStore.$terminateAsync.peek().isIdle) return;
    if (IssuerBrowserIssueException.isPopupError(args.error)) {
      return void await promptModal({
        title: 'Can not open popup window to issue credential',
        text: <>Please, allow popups in your browser, otherwise you will not be able to pass the credential issue.</>,
        actions: ['Ok'],
      });
    } else if (isJsonIssuerException(args.error)) {
      if (IssuerBrowserIssueException.isIssuerNotWorkOrNotExist(args.error.code)) {
        return void await VerificationTerminateActions.reject({
          ui: { message: `Issuer (${(args.issuerHost)}) is unavailable or not working. Please try again later.` },
          error: args.error,
        });
      } else if (IssuerBrowserIssueException.isIssuerRejectsCredentialIssuance(args.error.code)) {
        return void await VerificationTerminateActions.reject({
          ui: { message: 'Issuer rejects credential issuance' },
          error: args.error,
        });
      } else if (IssuerBrowserIssueException.isTooLongIssuance(args.error.code)) {
        return void await promptModal({
          title: 'Credential issuance session expired',
          text: <>You took too long to pass the credential issuance.<br />You can restart the credential issuance or reject verification.</>,
          actions: ['Ok'],
        });
      } else if (IssuerBrowserIssueException.isIssuerCanNotIssue(args.error.code)) {
        return void await promptModal({
          title: 'Credential can not be issued',
          text: <>Issuer can not issue the credential.<br />You can restart the credential issuance or reject verification.</>,
          actions: ['Ok'],
        });
      }
    }
    console.error('Unknown error occurred during the credential issuance', args.error);
    toast.error('Unknown error occurred during the credential issuance');
  }

  public static async proofSendCatch(
    args: { error: unknown, verifierHost: string },
  ): Promise<void> {
    if (!args.error || !VerificationStore.$terminateAsync.peek().isIdle) return;
    if (isJsonVerifierException(args.error)) {
      if (VerifierProofSendException.isVerifierIsNotWorkingProperly(args.error.code)) {
        return void await VerificationTerminateActions.reject({
          ui: { message: `Verifier (${args.verifierHost}) is not working properly` },
          error: args.error,
        });
      } else if (VerifierProofSendException.isSessionExpired(args.error.code)) {
        switch (await promptModal({
          title: 'Verification session expired',
          isNoClosable: true,
          text: 'You can restart the verification or reject it',
          actions: [
            { value: 'Reject', variant: 'light', color: 'danger' },
            { value: 'Restart', variant: 'shadow', color: 'success' },
          ],
        })) {
          case 'Reject':
            return void await VerificationTerminateActions.rejectByUser();
          case 'Restart':
            return void await VerificationInitActions.restart();
        }
      } else if (VerifierProofSendException.isVerifierCannotVerifyTheUser(args.error.code)) {
        return void await VerificationTerminateActions.reject({
          ui: { message: `Verifier is unable to verify you` },
          error: args.error,
        });
      } else {
        return void await VerificationTerminateActions.reject({
          ui: { message: `Verifier (${args.verifierHost}) is not working` },
          isSkipVerifierReq: true,
        });
      }
    }
    console.error('Unknown error occurred while sending the proof to the verifier', args.error);
    toast.error('Unknown error occurred while sending the proof to the verifier');
  }
}

AppGlobal.VerificationErrorActions = VerificationErrorActions;
