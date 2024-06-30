import { Button, Divider, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';
import { useMutation } from '@tanstack/react-query';
import { type ReactNode } from 'react';
import { toast } from 'sonner';
import { RequireWalletHoc } from '@/components/HOC/RequireWalletHoc.tsx';
import { IconByWalletType } from '@/components/icons.tsx';
import { useDisconnect } from '@/hooks/web3/useDisconnect.ts';
import { AuroErrorCodeEnum } from '@/types/auro-error-code.enum.ts';
import { DidStore } from '@/stores/did.store.ts';
import { WalletStore } from '@/stores/wallet.store.ts';
import { addressShort } from '@/util/helpers.ts';

// TODO: Need to think about signMessageText, and pass it to WalletAdapter.sign entirely
const messageText = 'WARNING! Make sure you are on zcred.org domain. If not, you are being phished!';

export function DidModal(): ReactNode {
  const wallet = WalletStore.$wallet.value;

  const onConfirm = () => signMessage({ message: messageText });
  const onCancel = () => useDisconnect.signOutBase();

  const { mutate: signMessage, isPending } = useMutation({
    mutationFn: wallet?.adapter.sign || (() => Promise.reject(new Error('No wallet connected'))),
    onSuccess: signature => DidStore.authenticate(signature, wallet!.address),
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
    <RequireWalletHoc>
      <Modal isOpen backdrop="blur" placement="center" hideCloseButton>
        <ModalContent>
          <ModalHeader>
            <p>Sign In</p>
            <div className="grow" />
            <span className="flex items-center gap-2 text-medium font-medium">
              <IconByWalletType walletType={wallet?.type || null} className="w-7 h-7" />
              {` `}
              {wallet?.address ? addressShort(wallet?.address) : ''}
            </span>
          </ModalHeader>
          <ModalBody>
            <p>Sign the message to log in to your account:</p>
            <Divider />
            <p>{messageText}</p>
            <Divider />
          </ModalBody>
          <ModalFooter className="flex items-center">
            <Button
              size="sm"
              onClick={onCancel}
              variant="light"
              color="danger"
              isDisabled={isPending}
            >Disconnect</Button>
            <Button
              size="sm"
              onClick={onConfirm}
              color="success"
              variant="shadow"
              isLoading={!wallet?.address || isPending}
            >Continue</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </RequireWalletHoc>
  );
}
