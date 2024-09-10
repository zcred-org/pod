import { type JsonZcredException, VerifierException, VEC, isJsonVerifierException } from '@zcredjs/core';
import axios, { type AxiosError } from 'axios';
import { createChallengeRejectJWS } from '@/service/external/verifier/create-challenge-reject-jws.ts';
import { type ProvingResult, type VerifierResponse, type Proposal, isProposal } from '@/service/external/verifier/types.ts';
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
  }): Promise<VerifierResponse> {
    const jws = await createChallengeRejectJWS(args.proposal.challenge.message);
    const res = await axios.post<VerifierResponse>(args.proposal.verifierURL, args.error, {
      headers: { Authorization: `Bearer ${jws}` },
    }).catch(VerifierApi.#catchVerifierException);
    return res.data;
  }

  public static async proofSend(args: { verifierURL: string, proof: ProvingResult }): Promise<VerifierResponse> {
    const res = await axios.post<VerifierResponse>(args.verifierURL, args.proof)
      .catch(VerifierApi.#catchVerifierException);
    return res.data;
  }

  static #catchVerifierException(res: AxiosError): never {
    if (isJsonVerifierException(res.response?.data))
      throw new VerifierException(res.response.data.code, res.response.data.message);
    else
      throw new VerifierException(VEC.NO_VERIFIER);
  }
}
