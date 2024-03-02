import { Button, Card, CardBody, CardHeader, Divider, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';
import { CircleUserRound, ShieldAlert } from 'lucide-react';
import { useDisconnect } from '@/hooks/web3/useDisconnect.ts';
import type { Identifier } from '@zcredjs/core';
import { useNavigate } from '@tanstack/react-router';
import { addressShort } from '@/util/helpers.ts';

export const SwitchToRequiredIdModal = (
  { requiredId, subjectId }: { requiredId: Identifier; subjectId: Identifier },
) => {
  const navigate = useNavigate();

  return (
    <Modal isOpen backdrop="blur" onClose={() => navigate({ to: '/' })} placement="center">
      <ModalContent>
        <ModalHeader className="flex items-center gap-3">
          <ShieldAlert/>
          Switch to required account
        </ModalHeader>
        <ModalBody>
          <p>To create this proof you need to be authorised under the same account as on the verifier page:</p>
          <Card>
            <CardHeader className="text-warning font-bold flex gap-1">
              <CircleUserRound/>Current:
            </CardHeader>
            <Divider/>
            <CardBody className="flex flex-row gap-3">
              <pre>{subjectId.type}</pre>
              :
              <pre>{addressShort(subjectId.key)}</pre>
            </CardBody>
          </Card>
          <Card>
            <CardHeader className="text-success font-bold flex gap-1">
              <CircleUserRound/>Required:
            </CardHeader>
            <Divider/>
            <CardBody className="flex flex-row gap-3">
              <pre>{requiredId.type}</pre>
              :
              <pre>{addressShort(requiredId.key)}</pre>
            </CardBody>
          </Card>
        </ModalBody>
        {subjectId.type === requiredId.type
          && <p className="text-small text-center">You can simply switch the account in your cryptocurrency wallet</p>}
        <ModalFooter className="items-center">
          <Button color="success" className="w-full" onClick={useDisconnect.signOutBase}>Relogin</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
