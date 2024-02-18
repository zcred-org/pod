import { FC, PropsWithChildren } from 'react';
import { useRequiredId } from '../../hooks/useRequiredId.ts';
import { useGetSubjectId } from '../../hooks/web3/useGetSubjectId.ts';
import { PageContainer } from '../PageContainer.tsx';
import { Card, CardBody, CardFooter, CardHeader, Divider, Modal, ModalBody, ModalContent, ModalHeader, Spinner } from '@nextui-org/react';
import { isEqual } from 'lodash';
import { CircleUserRound, ShieldAlert } from 'lucide-react';
import { Navigate, useNavigate } from '@tanstack/react-router';
import { RequireWalletHoc } from './RequireWalletHoc.tsx';
import { useAuth } from '../../hooks/web3/useAuth.ts';

export const RequireRequiredSubjectId: FC<PropsWithChildren> = ({ children }) => {
  const auth = useAuth();
  const navigate = useNavigate();
  const { requiredId } = useRequiredId() || {};
  const { data: subjectId, isFetching: isSubjectIdFetching } = useGetSubjectId();

  if (!requiredId) {
    return <Navigate to="/"/>;
  }

  if (isSubjectIdFetching || !subjectId) {
    return (
      <RequireWalletHoc>
        <PageContainer>
          <Spinner size="lg"/>
        </PageContainer>
      </RequireWalletHoc>
    );
  }

  if (!isEqual(subjectId, requiredId)) {
    return (
      <Modal isOpen backdrop="blur" onClose={() => navigate({ to: '/' })}>
        <ModalContent>
          <ModalHeader className="flex items-center gap-3">
            <ShieldAlert/>
            Switch to required account
          </ModalHeader>
          <ModalBody>
            <p>To generate a proof, you need to re-authorise with the required account.</p>
            <Card>
              <CardHeader className="text-danger font-bold flex gap-1">
                <CircleUserRound/>Current:
              </CardHeader>
              <Divider/>
              <CardBody>
                <pre>{subjectId.type}</pre>
                <pre>{subjectId.key}</pre>
              </CardBody>
            </Card>
            <Card isPressable onClick={auth.signOutBase}>
              <CardHeader className="text-success font-bold flex gap-1">
                <CircleUserRound/>Required:
              </CardHeader>
              <Divider/>
              <CardBody>
                <pre>{requiredId.type}</pre>
                <pre>{requiredId.key}</pre>
              </CardBody>
              <Divider/>
              <CardFooter className="flex justify-center">
                Click to switch
              </CardFooter>
            </Card>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  return children;
};