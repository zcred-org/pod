import { watchAccount as wagmiWatchAccount } from 'wagmi/actions';
import { wagmiConfig } from '../../config/wagmi-config.ts';
import { WalletTypeEnum } from '../../hooks/web3/useWalletType.store.ts';
import { MultiEventEmitter } from './base/multi-event-emitter.ts';

export enum WalletAddressEventsEnum {
  WalletChanged = 'WalletChanged',
}

export const WalletAddressEventEmitter = new MultiEventEmitter<{
  [WalletAddressEventsEnum.WalletChanged]: [WalletTypeEnum, address: string | null],
}>('WalletAddressEventEmitter', true);

if (window.mina) {
  window.mina.on('accountsChanged', ([address]) => WalletAddressEventEmitter.emit(
    WalletAddressEventsEnum.WalletChanged,
    WalletTypeEnum.Auro,
    address || null,
  ));
  // window.mina.on('chainChanged', ...);
}
wagmiWatchAccount(wagmiConfig, {
  onChange: ({ address }) => WalletAddressEventEmitter.emit(
    WalletAddressEventsEnum.WalletChanged,
    WalletTypeEnum.Ethereum,
    address || null,
  ),
});
