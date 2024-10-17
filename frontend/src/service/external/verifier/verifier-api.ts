import { type JsonZcredException, VerifierException, VEC, isJsonVerifierException } from '@zcredjs/core';
import axios, { type AxiosError } from 'axios';
import { queryClient } from '@/config/query-client.ts';
import { createChallengeRejectJWS } from '@/service/external/verifier/create-challenge-reject-jws.ts';
import { WebhookCallError } from '@/service/external/verifier/errors.ts';
import {
  type ProvingResult,
  type VerificationRejectResponse,
  type Proposal,
  isProposal,
  type VerificationResponse,
} from '@/service/external/verifier/types.ts';
import { checkProposalValidity } from '@/util';


export class VerifierApi {
  public static async proposalGet({ proposalURL, signal }: {
    proposalURL: string,
    signal?: AbortSignal,
  }): Promise<Proposal> {
    const res = await axios.get<Proposal>(proposalURL, { signal })
      .catch(VerifierApi.#catchVerifierException);
    if (!isProposal(res.data)) throw new VerifierException(VEC.PROPOSAL_BAD_RESP);
    if (!checkProposalValidity(res.data)) throw new VerifierException(VEC.PROPOSAL_BAD_RESP);
    return res.data;
  }

  public static async proposalReject(args: {
    proposal: Proposal,
    error: JsonZcredException,
  }): Promise<VerificationRejectResponse> {
    const jws = await createChallengeRejectJWS(args.proposal.challenge);
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
      await queryClient.fetchQuery({
        queryKey: ['webhook', res.webhookURL],
        queryFn: () => axios.post(res.webhookURL!, res.sendBody, {
          headers: { Authorization: `Bearer ${res.jws}` },
        }).catch((e: AxiosError) => {
          console.error('Webhook call error:', e);
          throw new WebhookCallError(e.message);
        }),
        retry: 2,
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
