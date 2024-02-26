import { FC, PropsWithChildren } from 'react';
import { NavigateToLogin, NavigateToLoginProps } from '../navigate/NavigateToLogin.tsx';
import { useWalletTypeStore } from '../../hooks/web3/useWalletType.store.ts';

type RequireWalletHocProps = PropsWithChildren & NavigateToLoginProps;

export const RequireWalletHoc: FC<RequireWalletHocProps> = ({ children, saveLocation }) => {
  const walletType = useWalletTypeStore(state => state.walletType);
  return walletType ? children : <NavigateToLogin saveLocation={saveLocation}/>;
};
