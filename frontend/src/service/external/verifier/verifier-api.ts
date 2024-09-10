import { type JsonZcredException, VerifierException, VEC, isJsonVerifierException } from '@zcredjs/core';
import axios, { type AxiosError } from 'axios';
import { createChallengeRejectJWS } from '@/service/external/verifier/create-challenge-reject-jws.ts';
import { WebhookCallError } from '@/service/external/verifier/errors.ts';
import {
  type ProvingResult,
  type VerificationRejectResponse,
  type Proposal,
  isProposal,
  type VerificationResponse,
} from '@/service/external/verifier/types.ts';
import type { ZCredStore } from '@/service/external/zcred-store/api-specification.ts';
import { checkProposalValidity } from '@/util/helpers.ts';


export class VerifierApi {
  public static async proposalGet({ proposalURL, secretData, signal }: {
    proposalURL: string,
    secretData: ZCredStore['SecretDataDto'],
    signal?: AbortSignal,
  }): Promise<Proposal> {
    const res = await axios.post<Proposal>(proposalURL, secretData, { signal })
      .catch(VerifierApi.#catchVerifierException);
    if (!isProposal(res.data)) throw new VerifierException(VEC.PROPOSAL_BAD_RESP);
    if (!checkProposalValidity(res.data)) throw new VerifierException(VEC.PROPOSAL_BAD_RESP);
    return res.data;
  }

  public static async proposalReject(args: {
    proposal: Proposal,
    error: JsonZcredException,
  }): Promise<VerificationRejectResponse> {
    const jws = await createChallengeRejectJWS(args.proposal.challenge.message);
    const res = await axios.post<VerificationRejectResponse>(args.proposal.verifierURL, args.error, {
      headers: { Authorization: `Bearer ${jws}` },
    }).catch(VerifierApi.#catchVerifierException);
    return res.data;
  }

  public static async proofSend(args: { verifierURL: string, proof: ProvingResult }): Promise<VerificationResponse> {
    const res = await axios.post<VerificationResponse>(args.verifierURL, args.proof)
      .then(res => res.data)
      .catch(VerifierApi.#catchVerifierException);
    if (res.webhookURL) {
      await axios.post(res.webhookURL, res.sendBody, {
        headers: { Authorization: `Bearer ${res.jws}` },
      }).catch((e: AxiosError) => {
        console.error('Webhook call error:', e);
        throw new WebhookCallError(e.message);
      });
    }
    return res;
  }

  static #catchVerifierException(res: AxiosError): never {
    if (isJsonVerifierException(res.response?.data))
      throw new VerifierException(res.response.data.code, res.response.data.message);
    else
      throw new VerifierException(VEC.NO_VERIFIER);
  }
}
