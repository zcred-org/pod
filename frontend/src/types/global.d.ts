import type { ReduxDevtoolsExtensionCompose } from '@redux-devtools/extension';
import type { IEIP1193Provider } from '@zcredjs/ethereum';
import type { IAuroWallet } from '@zcredjs/mina';

declare module '@zcredjs/mina' {
  interface IAuroEventHandlers {
    accountsChanged: (accounts: string[]) => void;
    chainChanged: (chainInfo: { chainId: string, name: string }) => void;
  }

  interface IAuroWallet {
    on: <K extends keyof IAuroEventHandlers>(event: K, handler: IAuroEventHandlers[K]) => void;
  }
}

declare global {
  interface Window {
    mina?: IAuroWallet;
    ethereum?: IEIP1193Provider;
    __REDUX_DEVTOOLS_EXTENSION__?: ReduxDevtoolsExtensionCompose;
  }
}
