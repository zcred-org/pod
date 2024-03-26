import { Navigate, useRouterState } from '@tanstack/react-router';
import type { ReactNode } from 'react';


export function NavigateToLogin(): ReactNode {
  const { location } = useRouterState();

  return <Navigate to={'/'} search={{ redirect: location.href }} />;
}
