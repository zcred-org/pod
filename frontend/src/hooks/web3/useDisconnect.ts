import { batch } from '@preact/signals-react';
import { useNavigate } from '@tanstack/react-router';
import { useCallback } from 'react';
import { queryClient } from '@/config/query-client.ts';
import { appWagmi } from '@/config/wagmi-config.ts';
import { AuroStore } from '@/stores/auro.store';
import { DidStore } from '@/stores/did-store/did.store.ts';
import { ZCredDidSessionStore } from '@/stores/did-store/zcred-did-session.store.ts';
import { WalletStore } from '@/stores/wallet.store';


const signOutBase = async () => {
  await appWagmi.disconnect();
  batch(() => {
    WalletStore.reset();
    AuroStore.disconnect();
    DidStore.reset();
    ZCredDidSessionStore.clear();
  });
};

export const useDisconnect = () => {
  const navigate = useNavigate();

  const signOut = useCallback(async () => {
    await signOutBase();
    queryClient.clear();
    await navigate({ to: '/' });
  }, [navigate]);

  return { signOut, signOutBase };
};

useDisconnect.signOutBase = signOutBase;
