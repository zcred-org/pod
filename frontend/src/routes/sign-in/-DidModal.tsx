import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';
import { makeVar, useReactiveVar } from '@apollo/client';
import { merge } from 'lodash';
import { useDisconnect } from 'wagmi';
import { useDidStorage } from '../../store/did.store.ts';
import { toast } from 'sonner';
import { useSignMessage } from '../../hooks/useSignMessage.ts';

const IsDidModalOpen = makeVar(false);

const messageText = 'WARNING! Make sure you are on zcred.org domain. If not, you are being phished!';

export const DidModal = merge(() => {
  const isOpen = useReactiveVar(IsDidModalOpen);
  const { authenticate } = useDidStorage();
  const { disconnect } = useDisconnect();
  const onCancel = () => {
    disconnect();
    IsDidModalOpen(false);
  };
  const { signMessage, isPending } = useSignMessage({
    onSuccess: data => authenticate(data),
    onError: (error) => {
      if (error.name === 'UserRejectedRequestError') {
        toast.warning('Sign in canceled. You need to sign the message to continue.');
      } else {
        toast.error(`Unexpected error: ${error instanceof Error ? error.message : error}`);
      }
      onCancel();
    },
  });
  const onConfirm = () => signMessage(messageText);

  return (
    <Modal isOpen={isOpen} backdrop="blur" onClose={onCancel} placement="center">
      <ModalContent>
        <ModalHeader>
          Sign In
        </ModalHeader>
        <ModalBody>
          <p>Sign the message to prove you own this wallet and proceed. Canceling will disconnect you.</p>
          <br/>
          <p>{messageText}</p>
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={onCancel}
            variant="light"
            color="danger"
            isDisabled={isPending}
          >Disconnect</Button>
          <Button
            onClick={onConfirm}
            color="success"
            isLoading={isPending}
          >Continue</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}, {
  open: () => IsDidModalOpen(true),
});
