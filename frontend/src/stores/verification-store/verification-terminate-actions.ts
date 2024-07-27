import type { JsonZcredException } from '@zcredjs/core';
import { SEC } from '@zcredjs/core';
import type { SetOptional } from 'type-fest';
import { IconStatusEnum } from '@/components/icons/IconStatus.tsx';
import { VerifierApi } from '@/service/external/verifier/verifier-api.ts';
import { VerificationStore, type VerificationTerminateErr } from '@/stores/verification-store/verification-store.ts';


export abstract class VerificationTerminateActions {
  static get #verifierURL() {
    const verifierURL = VerificationStore.$initDataAsync.peek().data?.proposal.verifierURL;
    if (!verifierURL) throw new Error('VerificationStore is not initialized');
    return verifierURL;
  }

  public static async resolve(redirectURL?: string) {
    VerificationStore.$terminateAsync.resolve({
      ui: {
        status: IconStatusEnum.Ok,
        redirectURL,
      },
    });
    await appRouter.navigate({ to: '/terminate' });
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

  public static async rejectAttributesNotMatch() {
    return await VerificationTerminateActions.reject({
      ui: {
        status: IconStatusEnum.Error,
        message: 'Your attributes don\'t match the conditions to create a proof',
      },
      error: { code: SEC.REJECT },
    });
  }

  public static async rejectNoCredsAndNoIssuer(issuerHost: string) {
    return await VerificationTerminateActions.reject({
      ui: {
        status: IconStatusEnum.Error,
        message: `
You have no suitable credential and the issuer (${issuerHost}) cannot issue a new one because it does not exist or is not operational for now.
Please check back later.
          `.trim(),
      },
      error: { code: SEC.REJECT },
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
  ) {
    let redirectURLFromVerifier: string | undefined;
    if (!isSkipVerifierReq) {
      VerificationStore.$terminateAsync.loading();
      redirectURLFromVerifier = await VerifierApi.proposalReject({
        verifierURL: VerificationTerminateActions.#verifierURL,
        error,
      }).then(res => res?.redirectURL).catch(() => undefined);
    }
    VerificationStore.$terminateAsync.resolve({
      ui: {
        status: ui.status ?? IconStatusEnum.Error,
        message: ui.message,
        redirectURL: ui.redirectURL || redirectURLFromVerifier,
      },
    });
    await appRouter.navigate({ to: '/terminate' });
  }
}
