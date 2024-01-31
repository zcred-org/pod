import { EIP1193Adapter, IEIP1193Provider } from '@zcredjs/ethereum';

const injected = 'ethereum' in window && (window.ethereum as IEIP1193Provider);
export const zCredWalletAdapter = injected ? new EIP1193Adapter(injected) : null
