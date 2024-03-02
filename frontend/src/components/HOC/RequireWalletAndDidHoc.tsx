import { type FC, PropsWithChildren, useEffect } from 'react';
import { useDidStore } from '@/hooks/useDid.store.ts';
import { DidModal } from '@/components/modals/DidModal.tsx';
import { RequireWalletHoc } from './RequireWalletHoc.tsx';
import { useWalletStore } from '@/hooks/web3/useWallet.store.ts';

export const RequireWalletAndDidHoc: FC<PropsWithChildren> = ({ children }) => {
  const address = useWalletStore(state => state.address);
  const { addressOfOwner, reset, did } = useDidStore();

  useEffect(() => {
    if (addressOfOwner && address !== addressOfOwner) {
      // console.log(`Resetting DID store: subject(${subjectId?.key}) !== addrFrom(${addressOfOwner})`);
      reset();
    }
  }, [address, addressOfOwner, reset]);

  return <RequireWalletHoc>{did ? children : <DidModal />}</RequireWalletHoc>;
};
