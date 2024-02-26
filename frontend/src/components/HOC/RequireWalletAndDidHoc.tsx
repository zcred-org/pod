import { FC, PropsWithChildren, useEffect } from 'react';
import { useDidStore } from '../../hooks/useDid.store.ts';
import { DidModal } from '../modals/DidModal.tsx';
import { isEqual } from 'lodash';
import { useAddress } from '../../hooks/web3/useAddress.ts';
import { RequireWalletHoc } from './RequireWalletHoc.tsx';

export const RequireWalletAndDidHoc: FC<PropsWithChildren> = ({ children }) => {
  const { address, isConnecting } = useAddress();
  const { addressOfOwner, reset, did } = useDidStore();

  useEffect(() => {
    if (!isConnecting && addressOfOwner && !isEqual(address, addressOfOwner)) {
      // console.log(`Resetting DID store: subject(${subjectId?.key}) !== addrFrom(${addressOfOwner})`);
      reset();
    }
  }, [address, isConnecting, addressOfOwner, reset]);

  return <RequireWalletHoc>{did ? children : <DidModal/>}</RequireWalletHoc>;
};
