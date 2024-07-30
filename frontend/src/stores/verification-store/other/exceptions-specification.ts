import { IEC, PopupError, VEC } from '@zcredjs/core';


// ===============================================================
// === HttpIssuer.browserIssue: IssuerException and PopupError ===
// ===============================================================
export abstract class IssuerBrowserIssueException {
  // Please allow to open Popup in your browser
  public static isPopupError(error: unknown): error is PopupError {
    return error instanceof PopupError;
  }

  private static readonly issuerNotWorkOrNotExistCodes = [
    IEC.NO_ISSUER, // 10000
    IEC.ISSUER_ERROR, // 10001
    IEC.INFO_BAD_RESP, // 11001
    IEC.CHALLENGE_BAD_REQ, // 12001
    IEC.CHALLENGE_BAD_RESP, // 12002
    IEC.CAN_ISSUE_BAD_REQ, // 13001
    IEC.CAN_ISSUE_BAD_RESP, // 13002
    IEC.ISSUE_BAD_REQ, // 14001
    IEC.ISSUE_BAD_RESP, // 14002
    IEC.ISSUE_BAD_SIGNATURE, // 14004
  ];

  // Issuer not work or not exist
  // Forward error to POST Proposal.verifierURL {"code": e.code, "message": e.message}
  // Verification ended
  public static isIssuerNotWorkOrNotExist(
    code: number,
  ): code is typeof IssuerBrowserIssueException.issuerNotWorkOrNotExistCodes[number] {
    return (IssuerBrowserIssueException.issuerNotWorkOrNotExistCodes as number[]).includes(code);
  }

  private static readonly issuerRejectsCredentialIssuanceCodes = [
    IEC.NO_ACCESS_TOKEN, // 10002
    IEC.INVALID_ACCESS_TOKEN, // 10003
  ];

  // Issuer rejects credential issuance
  // Forward error to POST Proposal.verifierURL {"code": e.code, "message": e.message}
  // Verification ended
  public static isIssuerRejectsCredentialIssuance(
    code: number,
  ): code is typeof IssuerBrowserIssueException.issuerRejectsCredentialIssuanceCodes[number] {
    return (IssuerBrowserIssueException.issuerRejectsCredentialIssuanceCodes as number[]).includes(code);
  }

  private static readonly tooTooLongIssuanceCodes = [
    IEC.CAN_ISSUE_NO_SESSION, // 13003
    IEC.ISSUE_NO_SESSION, // 14003
  ];

  // Too long issuance. You can restart the issuance or reject verification.
  public static isTooLongIssuance(
    code: number,
  ): code is typeof IssuerBrowserIssueException.tooTooLongIssuanceCodes[number] {
    return (IssuerBrowserIssueException.tooTooLongIssuanceCodes as number[]).includes(code);
  }

  // Issuer can not issue. You can restart the issuance or reject verification.
  public static isIssuerCanNotIssue(code: number): code is typeof IEC.ISSUE_DENIED {
    return code === IEC.ISSUE_DENIED;
  }
}


// ===================================================================
// ============ HttpIssuer.updateProofs: IssuerException =============
// ===================================================================

// Remember the error, and continue verification.
// If verification fails, then forward error to POST Proposal.verifierURL {"code": e.code, "message": e.message}

// ===================================================================
// ======================== POST proposalURL =========================
// ===================================================================

// the verifier doesn't work
// Verification ended

// ===========================================================
// ======================== proofSend ========================
// ===========================================================

export abstract class VerifierProofSendException {
  // HTTP status code 400 and isJsonVerifierException(body).code:

  private static readonly verifierIsNotWorkingProperlyCodes = [
    VEC.PROPOSAL_BAD_RESP, // 31002
    VEC.VERIFY_BAD_REQ, // 32001
    VEC.VERIFY_BAD_RESP, // 32002
    VEC.VERIFY_INVALID_SIGNATURE, // 32004
    VEC.VERIFY_INVALID_PROOF, // 32005
  ];

  // Verifier is not working properly
  public static isVerifierIsNotWorkingProperly(
    code: number,
  ): code is typeof VerifierProofSendException.verifierIsNotWorkingProperlyCodes[number] {
    return (VerifierProofSendException.verifierIsNotWorkingProperlyCodes as number[]).includes(code);
  }

  // Session has expired. You can restart the verification or reject it.
  public static isSessionExpired(code: number): code is typeof VEC.VERIFY_NO_SESSION {
    return code === VEC.VERIFY_NO_SESSION;
  }

  // Verifier can't verify you
  public static isVerifierCannotVerifyTheUser(code: number): code is typeof VEC.VERIFY_NOT_PASSED {
    return code === VEC.VERIFY_NOT_PASSED;
  }

  // In any other cases: Verifier is not working
}
