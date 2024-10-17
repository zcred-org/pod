import type { PropsWithChildren, ReactNode } from 'react';
import { NavigateToLogin } from '@/components/navigate/NavigateToLogin.tsx';
import { WalletStore } from '@/stores/wallet.store.ts';


export function RequireWalletHoc({ children }: PropsWithChildren): ReactNode {
  return WalletStore.$isConnected.value
    ? <>{children}</>
    : <NavigateToLogin />;
}
