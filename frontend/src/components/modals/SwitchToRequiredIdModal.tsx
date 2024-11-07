import { Button, Card, CardBody, CardHeader, Divider, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';
import type { Identifier } from '@zcredjs/core';
import { CircleUserRound, ShieldAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { IconByWalletType } from '@/components/icons/icons.tsx';
import { useDisconnect } from '@/hooks/web3/useDisconnect.ts';
import { addressShort } from '@/util/independent/address-short.ts';
import { subjectTypeToWalletEnum } from '@/util/subject-id.ts';


export function SwitchToRequiredIdModal(
  { requiredId, subjectId }: { requiredId: Identifier; subjectId: Identifier },
): ReactNode {
  return <Modal isOpen backdrop="blur" placement="center" hideCloseButton>
    <ModalContent>
      <ModalHeader className="flex items-center gap-3">
        <ShieldAlert />
        Switch to required account
      </ModalHeader>
      <ModalBody>
        <p>To create this proof you need to be authorised under the same account as on the verifier page:</p>
        <Card shadow="none" className="border-1 border-warning-200">
          <CardHeader className="text-warning font-bold flex gap-2">
            <CircleUserRound />Current:
          </CardHeader>
          <Divider />
          <CardBody className="flex flex-row gap-2 items-center">
            <IconByWalletType walletType={subjectTypeToWalletEnum(subjectId?.type ?? '')} className="w-7 h-7" />
            <pre>{addressShort(subjectId?.key ?? '')}</pre>
          </CardBody>
        </Card>
        <Card shadow="none" className="border-1 border-success-200">
          <CardHeader className="text-success font-bold flex gap-2">
            <CircleUserRound />Required:
          </CardHeader>
          <Divider />
          <CardBody className="flex flex-row gap-2 items-center">
            <IconByWalletType walletType={subjectTypeToWalletEnum(requiredId?.type ?? '')} className="w-7 h-7" />
            <pre>{addressShort(requiredId?.key ?? '')}</pre>
          </CardBody>
        </Card>
      </ModalBody>
      <ModalFooter className="flex flex-col">
        <Button
          size="sm"
          variant="shadow"
          color="success"
          className="w-full"
          onClick={useDisconnect.signOutBase}
        >Relogin</Button>
        {subjectId?.type === requiredId?.type
          && <p className="text-small text-center">You can simply switch the account in your cryptocurrency wallet</p>}
      </ModalFooter>
    </ModalContent>
  </Modal>;
}
