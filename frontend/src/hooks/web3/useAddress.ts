import { useAccount as useWagmiAccount } from 'wagmi';
import { useAuroStore } from './auro/useAuro.store.ts';
import { WalletTypeEnum } from './useWalletType.store.ts';
import { useByWalletType } from './useByWalletType.ts';
import { useWeb3ModalState } from '@web3modal/wagmi/react';

export const useAddress = () => {
  const eth = useWagmiAccount();
  const auroAddress = useAuroStore(state => state.address);
  const auroIsConnecting = useAuroStore(state => state.isConnecting);
  const web3ModalState = useWeb3ModalState();

  const isConnecting = useByWalletType({
    [WalletTypeEnum.Auro]: auroIsConnecting,
    [WalletTypeEnum.Ethereum]: eth.isConnecting || eth.isReconnecting || (!eth.address || web3ModalState.open),
  });

  const address = useByWalletType({
    [WalletTypeEnum.Auro]: auroAddress,
    [WalletTypeEnum.Ethereum]: eth.address,
  }) || null;

  return { address, isConnecting };
};
