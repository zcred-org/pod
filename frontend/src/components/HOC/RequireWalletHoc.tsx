import { type FC, PropsWithChildren } from 'react';
import { NavigateToLogin, NavigateToLoginProps } from '@/components/navigate/NavigateToLogin.tsx';
import { useWalletStore } from '@/hooks/web3/useWallet.store.ts';

type RequireWalletHocProps = PropsWithChildren & NavigateToLoginProps;

export const RequireWalletHoc: FC<RequireWalletHocProps> = ({ children, saveLocation }) => {
  const walletType = useWalletStore(state => state.type);
  return walletType ? children : <NavigateToLogin saveLocation={saveLocation}/>;
};
