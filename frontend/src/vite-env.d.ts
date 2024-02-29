/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

import type { IAuroWallet } from '@zcredjs/mina';
import type { IEIP1193Provider } from '@zcredjs/ethereum';

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
  }
}
