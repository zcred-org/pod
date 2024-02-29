import { useDidStore } from '../useDid.store.ts';
import { useWalletTypeStore } from './useWalletType.store.ts';

export const useCheckAuth = () => {
  const did = useDidStore(state => state.did?.id);
  const walletType = useWalletTypeStore(state => state.walletType);

  const isWalletConnected = !!walletType;
  const isAuthorized = isWalletConnected && !!did;

  return {
    isWalletConnected,
    isAuthorized,
  };
};
