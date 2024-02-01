import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';
import { useDidStore } from '../../store/did.store.ts';
import { toast } from 'sonner';
import { useSignMessage } from '../../hooks/web3/useSignMessage.ts';
import { AuroErrorCodeEnum } from '../../common/api/wallet-adapter-auro.ts';
import { useAuth } from '../../hooks/web3/useAuth.ts';
import { FC } from 'react';

const messageText = 'WARNING! Make sure you are on zcred.org domain. If not, you are being phished!';

export const DidModal: FC = () => {
  const { authenticate } = useDidStore();
  const auth = useAuth()

  const onConfirm = () => signMessage(messageText);
  const onCancel = () => auth.signOut();

  const { signMessage, isPending } = useSignMessage({
    onSuccess: data => authenticate(data),
    onError: async (error) => {
      const isUserRejected = error.name === 'UserRejectedRequestError'
        || 'code' in error && error.code === AuroErrorCodeEnum.UserRejectedRequest;
      if (isUserRejected) {
        toast.warning('Sign in canceled. You need to sign the message to continue.');
      } else {
        toast.error(`Unexpected error "${error}": ${error instanceof Error ? error.message : error}`);
      }
      await onCancel();
    },
  });

  return (
    <Modal isOpen={true} backdrop="blur" onClose={onCancel} placement="center">
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
};
