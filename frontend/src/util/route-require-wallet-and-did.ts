import { type ParsedLocation, redirect } from '@tanstack/react-router';
import { ProveRoutePath } from '@/routes/prove/-constants.ts';
import { $isWalletAndDidConnected } from '@/stores/other.ts';


/**
 * Simple middleware to check auth inside createFileRoute() in beforeLoad etc.
 * @param location - if not authenticated: location for redirect after login
 */
export const routeRequireWalletAndDid = (location: ParsedLocation) => {
  if (!$isWalletAndDidConnected.peek()) {
    const search = location.pathname === ProveRoutePath
      ? location.search
      : { redirect: location.href };
    throw redirect({ to: '/', search });
  }
};
