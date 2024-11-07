import type { JsonZcredException } from '@zcredjs/core';
import { SEC, IEC } from '@zcredjs/core';
import type { SetOptional } from 'type-fest';
import { AppGlobal } from '@/config/app-global.ts';
import { VerifierApi } from '@/service/external/verifier/verifier-api.ts';
import { VerificationStore, type VerificationTerminateErr } from '@/stores/verification-store/verification-store.ts';
import { IconStatusEnum } from '@/types/icon-status.enum.ts';


// TODO: abort all background actions on rejectByUser etc.
export abstract class VerificationTerminateActions {
  public static async resolve(redirectURL?: string) {
    VerificationStore.$terminateAsync.resolve({
      ui: {
        status: IconStatusEnum.Ok,
        redirectURL,
      },
    });
    await AppGlobal.router.navigate({ to: '/terminate' });
  }

  public static async rejectByUser() {
    return await VerificationTerminateActions.reject({
      ui: {
        status: IconStatusEnum.Warn,
        message: 'You canceled the verification',
      },
      error: { code: SEC.REJECT },
    });
  }

  public static async rejectNoSecretData() {
    return await VerificationTerminateActions.reject({
      ui: {
        status: IconStatusEnum.Error,
        message: 'Session has expired, please start from the beginning',
      },
      isSkipVerifierReq: true,
    });
  }

  public static async rejectAttributesNotMatch() {
    return await VerificationTerminateActions.reject({
      ui: {
        status: IconStatusEnum.Error,
        message: 'Your attributes don\'t match the conditions to create a proof',
      },
      error: { code: SEC.REJECT },
    });
  }

  public static async verificationFailed() {
    return await VerificationTerminateActions.reject({
      ui: {
        status: IconStatusEnum.Error,
        message: 'Verification failed',
      },
      isSkipVerifierReq: true,
    });
  }

  public static async rejectNoCredsAndNoIssuer(issuerHost: string) {
    const issuerError = VerificationStore.$issuerError.peek();
    return await VerificationTerminateActions.reject({
      ui: {
        status: IconStatusEnum.Error,
        message: `
You have no suitable credential and the issuer (${issuerHost}) cannot issue a new one because it does not exist or is not operational for now.
Please check back later.
          `.trim(),
      },
      error: issuerError ?? { code: IEC.NO_ISSUER },
    });
  }

  public static async reject(
    { ui, error, isSkipVerifierReq }: {
      ui: SetOptional<VerificationTerminateErr['ui'], 'status'>,
    } & ({
      error: JsonZcredException,
      isSkipVerifierReq?: undefined,
    } | {
      error?: undefined,
      isSkipVerifierReq: true,
    }),
  ): Promise<void> {
    if (!VerificationStore.$terminateAsync.peek().isIdle) return;
    let redirectURLFromVerifier: string | undefined;
    if (!isSkipVerifierReq) {
      VerificationStore.$terminateAsync.loading();
      try {
        const proposal = VerificationStore.$initDataAsync.peek().data?.proposal;
        if (!proposal) throw new Error('VerificationStore is not initialized');
        redirectURLFromVerifier = await VerifierApi.proposalReject({ proposal, error })
          .then(res => res?.redirectURL);
      } catch (e) {
        console.error('Failed to reject the proposal', e);
      }
    }
    console.debug('Verification rejected', { ui, error, redirectURLFromVerifier });
    VerificationStore.$terminateAsync.resolve({
      ui: {
        status: ui.status ?? IconStatusEnum.Error,
        message: ui.message,
        redirectURL: ui.redirectURL || redirectURLFromVerifier,
      },
    });
    await AppGlobal.router.navigate({ to: '/terminate' });
  }
}
