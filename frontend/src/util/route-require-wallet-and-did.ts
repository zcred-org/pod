import { type ParsedLocation, redirect } from '@tanstack/react-router';
import { useWalletStore } from '@/hooks/web3/useWallet.store.ts';
import { useDidStore } from '@/hooks/useDid.store.ts';

/**
 * Simple middleware to check auth inside createFileRoute() in beforeLoad etc.
 * @param location - if not authenticated: location for redirect after login
 * @param requireDid - if true, will check if DID is present
 */
export const routeRequireWalletAndDid = (location: ParsedLocation, requireDid = true) => {
  const isWallet = !!useWalletStore.getState().type;
  const isDid = !requireDid || !!useDidStore.getState().did;

  if (!isWallet || !isDid) {
    throw redirect({ to: '/', search: { redirect: location.href } });
  }
};
