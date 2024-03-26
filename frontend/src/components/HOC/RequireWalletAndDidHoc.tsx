import type { PropsWithChildren, ReactNode } from 'react';
import { NavigateToLogin } from '@/components/navigate/NavigateToLogin.tsx';
import { $isWalletAndDidConnected } from '@/stores/other.ts';


export function RequireWalletAndDidHoc({ children }: PropsWithChildren): ReactNode {
  return $isWalletAndDidConnected.value
    ? <>{children}</>
    : <NavigateToLogin />;
}
