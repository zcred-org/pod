import { MultiEventEmitter } from './base/multi-event-emitter.ts';
import { WalletTypeEnum } from '@/types/wallet-type.enum.ts';

export enum WalletAddressEventsEnum {
  WalletChanged = 'WalletChanged',
}

export const WalletAddressEventEmitter = new MultiEventEmitter<{
  [WalletAddressEventsEnum.WalletChanged]: [WalletTypeEnum, address: string | null],
}>('WalletAddressEventEmitter', true);
