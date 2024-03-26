import type { PropsWithChildren, ReactNode } from 'react';
import { NavigateToLogin } from '@/components/navigate/NavigateToLogin.tsx';
import { $isWalletConnected } from '@/stores/other.ts';


export function RequireWalletHoc({ children }: PropsWithChildren): ReactNode {
  return $isWalletConnected.value
    ? <>{children}</>
    : <NavigateToLogin />;
}
