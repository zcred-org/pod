import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, cn, Divider } from '@nextui-org/react';
import { useMutation } from '@tanstack/react-query';
import { type ReactNode, useMemo } from 'react';
import { toast } from 'sonner';
import { IconByWalletType } from '@/components/icons/icons.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { useDisconnect } from '@/hooks/web3/useDisconnect.ts';
import { DidStore } from '@/stores/did-store/did.store.ts';
import { $isWalletAndDidConnected } from '@/stores/other.ts';
import { WalletStore } from '@/stores/wallet.store.ts';
import { AuroErrorCodeEnum } from '@/types/auro-error-code.enum.ts';
import { addressShort } from '@/util/independent/address-short.ts';


export function DidModal(): ReactNode {
  const wallet = WalletStore.$wallet.value;
  const message = useMemo(() => wallet ? messageCreate({ address: wallet.address, blockchain: wallet.type }) : null, [wallet]);

  const onConfirm = () => signMessage();
  const onCancel = () => useDisconnect.signOutBase();

  const { mutate: signMessage, isPending } = useMutation({
    mutationFn: async () => {
      if (!wallet) throw new Error('Please connect wallet first');
      if (!message) throw new Error('Message is not ready');
      const signature = await wallet.adapter.sign({ message: message.asString });
      await DidStore.authenticate(signature, wallet!.subjectId);
    },
    onError: async (error) => {
      const isUserRejected = error.name === 'UserRejectedRequestError'
        || 'code' in error && error.code === AuroErrorCodeEnum.UserRejectedRequest;

      if (isUserRejected) toast.warning('Sign in canceled. You need to sign the message to continue.');
      else toast.error(`Unexpected error: ${error.message}`);

      await onCancel();
    },
  });

  return (
    <Modal
      isOpen={DidStore.$isConnecting.value}
      backdrop="blur"
      placement="center"
      hideCloseButton
      size="lg"
    >
      <ModalContent>
        <ModalHeader>
          <p>Sign In</p>
          <div className="grow" />
          <span className="flex items-center gap-2 text-medium font-medium">
            <IconByWalletType walletType={wallet?.type || null} className="w-7 h-7" />
            {wallet?.address ? addressShort(wallet?.address) : ''}
          </span>
        </ModalHeader>
        <ModalBody>
          <p>Please sign this message to log in to zCred:</p>
          <Divider />
          <p className="text-wrap text-justify whitespace-pre-wrap">
            {message?.asSplitByWarning.map((line, i) => (
              <span key={i} className={cn('break-words', { 'font-semibold text-orange-500 dark:text-warning': i == 1 })}>
                {line}
              </span>
            ))}
          </p>
          <Divider />
        </ModalBody>
        <ModalFooter className="flex items-center">
          <Button
            onClick={onCancel}
            variant="light"
            color="danger"
            isDisabled={isPending}
          >Disconnect</Button>
          <Button
            onClick={onConfirm}
            color="success"
            variant="shadow"
            isLoading={!wallet?.address || isPending}
            isDisabled={$isWalletAndDidConnected.value}
          >Continue</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}


function messageCreate(args: { address: string, blockchain: string }) {
  const domain = location.hostname;

  const warning = `Warning: Ensure you sign this message only on the ${domain} domain, as signing it elsewhere may result in the loss of control over your digital credentials.`;

  const asString = `
${domain} wants you to sign in with your ${args.blockchain} account:
${args.address}

${warning}
  `.trim();

  const [begin, end] = asString.split(warning);
  const asSplitByWarning = [begin, warning, end];

  return { asString, asSplitByWarning };
}
