import { cn } from '@nextui-org/react';
import type { ReactNode, SVGProps } from 'react';
import IconEthereum from '@/assets/ethereum.svg?react';
import IconLogoSvg from '@/assets/logo.svg?react';
import IconMinaWord from '@/assets/mina-word.svg?react';
import { WalletTypeEnum } from '@/types/wallet-type.enum.ts';

export const IconLogo = IconLogoSvg;

export function IconEth({ className, ...props }: SVGProps<SVGSVGElement>): ReactNode {
  return <IconEthereum className={cn('fill-blue-500 -mx-1', className)} {...props} />;
}

export function IconMina({ className, ...props }: SVGProps<SVGSVGElement>): ReactNode {
  return <IconMinaWord className={cn('fill-indigo-500 stroke-indigo-500 stroke-1', className)} {...props} />;
}

export function IconByWalletType(
  { walletType, ...props }: { walletType: WalletTypeEnum | null | undefined } & SVGProps<SVGSVGElement>,
): ReactNode {
  if (walletType === WalletTypeEnum.Ethereum) return <IconEth {...props} />;
  if (walletType === WalletTypeEnum.Auro) return <IconMina {...props} />;
  if (walletType !== null && walletType !== undefined) {
    throw new Error(`Unknown wallet type: ${walletType satisfies never}`);
  }
  return null;
}
