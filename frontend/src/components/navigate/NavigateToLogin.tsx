import { Navigate, useRouterState } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { Route as ProveRoute } from '@/routes/prove/route.tsx';


export function NavigateToLogin(): ReactNode {
  const { location } = useRouterState();

  const search = location.pathname === ProveRoute.fullPath
    ? location.search
    : { redirect: location.href };

  return <Navigate to={'/'} search={search} />;
}
