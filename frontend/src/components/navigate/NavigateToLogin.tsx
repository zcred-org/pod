import { Navigate, useRouterState } from '@tanstack/react-router';
import { FC } from 'react';

export type NavigateToLoginProps = {
  /* Do redirect back after login, default is true */
  saveLocation?: boolean;
};

export const NavigateToLogin: FC<NavigateToLoginProps> = ({ saveLocation = true }) => {
  const { location } = useRouterState();

  return (
    <Navigate
      to={'/'}
      search={saveLocation ? { redirect: location.href } : undefined}
    />
  );
};
