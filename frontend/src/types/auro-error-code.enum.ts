export enum AuroErrorCodeEnum {
  // User disconnect, need connect first.
  NeedConnectWallet = 1001,
  // The request was rejected by the user.
  UserRejectedRequest = 1002,
  // Can not find account, may need create or restore in Auro Wallet first.
  CanNotFindAccount = 20001,
  // Verify failed.
  VerifyFailed = 20002,
  // The parameters were invalid.
  InvalidParameters = 20003,
  // Not support chain.
  NotSupportChain = 20004,
  // Have Pending chain action.
  HavePendingChainAction = 20005,
  // Method not supported.
  MethodNotSupported = 20006,
  // Internal error.
  InternalError = 21001,
  // Unspecified error message.
  UnspecifiedErrorMessage = 22001,
  // Origin dismatch.
  OriginDismatch = 23001,
}
