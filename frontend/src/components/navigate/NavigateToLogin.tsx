import { Navigate, useRouterState } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { ProveRoutePath } from '@/routes/prove/-constants.ts';


export function NavigateToLogin(): ReactNode {
  const { location } = useRouterState();

  const search = location.pathname === ProveRoutePath
    ? location.search
    : { redirect: location.href };

  return <Navigate to={'/'} search={search} />;
}
