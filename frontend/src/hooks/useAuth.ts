import { useAccount as useEthAccount, useDisconnect } from 'wagmi';
import { useDidStorage } from '../store/did.store.ts';
import { useMinaAccount } from '../common/mina/useMinaAccount.ts';
import { useWeb3Modal } from '@web3modal/wagmi/react';

export const useAuth = () => {
  const eth = useEthAccount();
  const mina = useMinaAccount();
  const { disconnect: ethDisconnect } = useDisconnect();
  const did = useDidStorage();
  const ethWeb3Modal = useWeb3Modal();
  const connectEth = () => ethWeb3Modal.open();

  const address = mina.account || eth.address;
  const isAuthorized = address && did.did;

  const signOut = async () => {
    ethDisconnect();
    mina.disconnect();
    did.reset();
  };

  return {
    address: address,
    type: mina.account ? 'Mina' : 'Eth',
    did,
    isAuthorized,
    signOut,
    connectEth,
    connectMina: mina.connect,
  };
};
