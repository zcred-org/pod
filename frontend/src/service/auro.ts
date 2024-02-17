import { IAuroEventHandlers } from '@zcredjs/mina';

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

type Accounts = string[];
type ChainInfoArgs = {
  chainId: string;
  name: string;
};

/**
 * Additional implementation of 'removeEventListener' for mina.window.
 */
const listeners = {
  'accountsChanged': new Set<(accounts: Accounts) => void>(),
  'chainChanged': new Set<(chainInfo: ChainInfoArgs) => void>(),
} satisfies Record<keyof IAuroEventHandlers, Set<IAuroEventHandlers[keyof IAuroEventHandlers]>>;

if (window.mina) {
  for (const event of Object.keys(listeners) as (keyof IAuroEventHandlers)[]) {
    window.mina.on(event, (data: any) => Promise.all([...listeners[event]].map((handler) => handler(data))));
  }
  window.mina.on = (event, handler) => {
    listeners[event].add(handler as never);
  };
  window.mina.removeEventListener = (event, handler) => {
    listeners[event].delete(handler as never);
  };
}
