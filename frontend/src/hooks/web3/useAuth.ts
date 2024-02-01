import { useAccount as useEthAccount, useDisconnect } from 'wagmi';
import { useDidStore } from '../../store/did.store.ts';
import { useAuroAccount } from './auro/useAuroAccount.ts';
import { useWeb3Modal } from '@web3modal/wagmi/react';

export const useAuth = () => {
  const auro = useAuroAccount();
  const eth = useEthAccount();
  const { disconnect: ethDisconnect } = useDisconnect();
  const did = useDidStore();
  const ethWeb3Modal = useWeb3Modal();
  const connectEth = () => ethWeb3Modal.open();

  const address = auro.address || eth.address;
  const isAuthorized = address && did.did;

  const signOut = async () => {
    ethDisconnect();
    auro.disconnect();
    did.reset();
  };

  return {
    address,
    provider: auro.address ? 'Mina' : 'Eth',
    did,
    isAuthorized,
    signOut,
    connectEth,
    connectMina: auro.connect,
  };
};
