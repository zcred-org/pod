import { useDidStore } from '../useDid.store.ts';
import { useWalletStore } from './useWallet.store.ts';

export const useCheckAuth = () => {
  const did = useDidStore(state => state.did?.id);
  const walletType = useWalletStore(state => state.type);

  const isWalletConnected = !!walletType;
  const isAuthorized = isWalletConnected && !!did;

  return {
    isWalletConnected,
    isAuthorized,
  };
};
