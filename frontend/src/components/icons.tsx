import IconMinaWord from '@/assets/mina-word.svg?react';
import IconEthereum from '@/assets/icons8_ethereum.svg?react';
import IconSheild from '@/assets/shield.svg?react';

import { WalletTypeEnum } from '@/types/wallet-type.enum.ts';
import { type FC, SVGProps } from 'react';
import { cn } from '@nextui-org/react';

export const IconShield = IconSheild;

export const IconEth: FC<SVGProps<SVGSVGElement>> = ({ className, ...props }) => (
  <IconEthereum className={cn('fill-blue-500 -mx-1', className)} {...props}/>
);

export const IconMina: FC<SVGProps<SVGSVGElement>> = ({ className, ...props }) => (
  <IconMinaWord className={cn('fill-indigo-500 stroke-indigo-500 stroke-1', className)} {...props}/>
);

export const IconByWalletType: FC<{ type: WalletTypeEnum | null } & SVGProps<SVGSVGElement>> = ({ type, ...props }) => {
  if (type === WalletTypeEnum.Ethereum) return <IconEth {...props}/>;
  if (type === WalletTypeEnum.Auro) return <IconMina {...props}/>;
  if (type !== null) {
    throw new Error(`Unknown wallet type: ${type satisfies never}`);
  }
  return null;
};
