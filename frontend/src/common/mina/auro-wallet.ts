enum ProviderErrorCodeEnum {
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

export interface ProviderError extends Error {
  message: string; // error message.
  code: ProviderErrorCodeEnum; // error code.
  data?: unknown; // error body.
}

type ChainInfoArgs = {
  /**
   * Current chain ID, now will return mainnet, devnet, berkeley, testworld2.
   */
  chainId: 'mainnet' | 'devnet' | 'berkeley' | 'testworld2',
  /**
   * Current chain name. The default node name is fixed, and the custom added ones are user-defined.
   */
  name: string,
}

export interface SignedData {
  /**
   * sign account address.
   */
  publicKey: string;
  /**
   * sign message.
   */
  data: string;
  /**
   * sign result.
   */
  signature: {
    field: string;
    scalar: string;
  };
}

export interface IMinaEventHandlers {
  accountsChanged: (accounts: string[]) => void;
  chainChanged: (chainInfo: ChainInfoArgs) => void;
}

interface IMinaWallet {
  /**
   * This method is used to request the current connected account.
   * It is a silent request.
   * If there is a connected account, it will return the connected account.
   * If not, it will return an empty array.
   */
  getAccounts: () => string[];
  /**
   * This method is used to request the current connect account.
   * If there is a connected account, the connected account will be returned.
   * If not, a popup window will show to request a connection.
   * @throws {ProviderError}
   */
  requestAccounts: () => Promise<string[]>;
  /**
   * This method is used to request the chain info of the Auro wallet.
   */
  requestNetwork: () => Promise<ChainInfoArgs>;
  /**
   * This method is used to sign message.
   * @throws {ProviderError}
   */
  signMessage: (args: { message: string }) => Promise<SignedData>;

  on: <K extends keyof IMinaEventHandlers>(event: K, handler: IMinaEventHandlers[K]) => void;
  removeEventListener: <K extends keyof IMinaEventHandlers>(event: K, handler: IMinaEventHandlers[K]) => void;
}

const listeners = {
  'accountsChanged': new Set<(accounts: string[]) => void>(),
  'chainChanged': new Set<(chainInfo: ChainInfoArgs) => void>(),
} satisfies Record<keyof IMinaEventHandlers, Set<IMinaEventHandlers[keyof IMinaEventHandlers]>>;

if (window.mina) {
  for (const event of Object.keys(listeners) as (keyof typeof listeners)[]) {
    window.mina.on(event, (data: any) => Promise.all([...listeners[event]].map((handler) => handler(data))));
  }

  window.mina.on = (event, handler) => {
    listeners[event].add(handler as never);
  };
  window.mina.removeEventListener = (event, handler) => {
    listeners[event].delete(handler as never);
  };
}

declare global {
  interface Window {
    mina?: IMinaWallet;
  }
}

