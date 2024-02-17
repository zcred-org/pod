import { useAuth } from '../hooks/web3/useAuth.ts';
import { FC, PropsWithChildren } from 'react';
import { NavigateToLogin } from '../components/navigate/NavigateToLogin.tsx';

export const RequireWalletHoc: FC<PropsWithChildren> = ({ children }) => {
  const { isWalletConnected } = useAuth();

  if (isWalletConnected) {
    return children;
  }

  return <NavigateToLogin/>;
};
