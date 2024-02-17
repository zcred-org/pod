import { Navigate, useRouterState } from '@tanstack/react-router';

export const NavigateToLogin = () => {
  const { location } = useRouterState();

  return <Navigate to={'/'} search={{ redirect: location.href }}/>;
};
