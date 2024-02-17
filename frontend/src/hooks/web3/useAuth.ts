import { useAccount, useDisconnect } from 'wagmi';
import { useDidStore } from '../useDid.store.ts';
import { useAuroStore } from './auro/useAuro.store.ts';
import { useNavigate } from '@tanstack/react-router';
import { useCallback } from 'react';

export const useAuth = () => {
  const navigate = useNavigate();
  const eth = useAccount();
  const auro = useAuroStore();
  const { disconnect: ethDisconnect } = useDisconnect();
  const did = useDidStore();

  const signOutBase = useCallback(async () => {
    ethDisconnect();
    auro.disconnect();
    did.reset();
  }, [auro, did, ethDisconnect]);

  const signOut = useCallback(async () => {
    await navigate({ to: '/' });
    await signOutBase();
    await navigate({ to: '/' });
  }, [navigate, signOutBase]);

  const isWalletConnected = eth.isConnected || !!auro.address;
  const isAuthorized = isWalletConnected && !!did.did;

  return {
    signOut,
    signOutBase,
    isWalletConnected,
    isAuthorized,
  };
};
