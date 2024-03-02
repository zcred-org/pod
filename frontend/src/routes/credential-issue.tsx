import { createFileRoute } from '@tanstack/react-router';
import { HttpIssuer } from '@zcredjs/core';
import { Button } from '@nextui-org/react';
import { PageContainer } from '../components/PageContainer.tsx';
import { useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { zCredStore } from '@/service/external/zcred-store';
import { RequireWalletAndDidHoc } from '@/components/HOC/RequireWalletAndDidHoc.tsx';
import { useWalletStore } from '@/hooks/web3/useWallet.store.ts';
import { link } from '@/components/factories/link.tsx';

export const Route = createFileRoute('/credential-issue')({
  component: () => <RequireWalletAndDidHoc><CredentialIssue/></RequireWalletAndDidHoc>,
  beforeLoad: () => ({ title: 'Issue Credential' }),
});

/*
 * Test page
 */

function CredentialIssue() {
  const { adapter: walletAdapter, subjectId, chainId } = useWalletStore();
  const { mutate: credentialIssue, isPending, isSuccess } = useMutation({
    onSuccess: () => toast.success('Credential created'),
    onError: (error) => toast.error(error.message),
    mutationFn: async () => {
      if (!walletAdapter) throw new Error('No wallet connected');
      const credential = await issuer.browserIssue!({
        challengeReq: {
          subject: { id: subjectId },
          options: {
            redirectURL: 'http://localhost:5173/test-page',
            chainId,
          },
          validFrom: new Date('2024-02-18').toISOString(),
          validUntil: new Date('2024-05-18').toISOString(),
        },
        sign: walletAdapter.sign,
        windowOptions: {
          target: '_blank',
        },
      });
      await zCredStore.credential.credentialUpsert(credential);
    },
  });
  const issuer = useMemo(() => new HttpIssuer('https://api.dev.sybil.center/api/v1/zcred/issuers/passport'), []);

  return (
    <PageContainer>
      <Button
        onClick={() => credentialIssue()}
        isLoading={!subjectId || isPending}
        isDisabled={!walletAdapter || isSuccess}
      >
        Create Credential
      </Button>
      {isSuccess && <Button as={link({ to: '/' })} color="success">Go Home</Button>}
    </PageContainer>
  );
}
