import { useByWalletType } from './useByWalletType.ts';
import { useEIP1193Adapter } from './ethereum/useEIP1193Adapter.ts';
import { useAuroStore } from './auro/useAuro.store.ts';
import { WalletTypeEnum } from './useWalletType.store.ts';

export const useWalletAdapter = () => {
  const { data: ethAdapter = null } = useEIP1193Adapter();
  const auroAdapter = useAuroStore(state => state.auroWalletAdapter);

  return useByWalletType({
    [WalletTypeEnum.Auro]: auroAdapter,
    [WalletTypeEnum.Ethereum]: ethAdapter,
  });
};
