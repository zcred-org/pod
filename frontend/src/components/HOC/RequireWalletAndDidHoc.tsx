import { FC, PropsWithChildren, useEffect } from 'react';
import { useDidStore } from '../../hooks/useDid.store.ts';
import { DidModal } from '../modals/DidModal.tsx';
import { RequireWalletHoc } from './RequireWalletHoc.tsx';
import { useGetSubjectId } from '../../hooks/web3/useGetSubjectId.ts';
import { isEqual } from 'lodash';

export const RequireWalletAndDidHoc: FC<PropsWithChildren> = ({ children }) => {
  const { data: subjectId, isFetching } = useGetSubjectId();
  const { seedFromSubjectId, reset, did } = useDidStore();

  useEffect(() => {
    if (!isFetching && subjectId && seedFromSubjectId && !isEqual(subjectId, seedFromSubjectId)) {
      // console.log(`Resetting DID store: subject(${subjectId?.key}) !== addrFrom(${seedFromSubjectId})`);
      reset();
    }
  }, [isFetching, reset, seedFromSubjectId, subjectId]);

  if (did) {
    return children;
  }

  return (
    <RequireWalletHoc>
      <DidModal/>
    </RequireWalletHoc>
  );
};
