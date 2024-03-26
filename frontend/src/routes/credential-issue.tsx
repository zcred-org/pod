import { Button } from '@nextui-org/react';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { HttpIssuer } from '@zcredjs/core';
import { useMemo } from 'react';
import { toast } from 'sonner';
import { link } from '@/components/factories/link.tsx';
import { RequireWalletAndDidHoc } from '@/components/HOC/RequireWalletAndDidHoc.tsx';
import { zCredStore } from '@/service/external/zcred-store';
import { WalletStore } from '@/stores/wallet.store.ts';
import { PageContainer } from '../components/PageContainer.tsx';


export const Route = createFileRoute('/credential-issue')({
  component: () => <RequireWalletAndDidHoc><CredentialIssue /></RequireWalletAndDidHoc>,
  beforeLoad: () => ({ title: 'Issue Credential' }),
});

/*
 * Test page
 */

function CredentialIssue() {
  const wallet = WalletStore.$wallet.value;
  const { mutate: credentialIssue, isPending, isSuccess } = useMutation({
    onSuccess: () => toast.success('Credential created'),
    onError: (error) => toast.error(error.message),
    mutationFn: async () => {
      if (!wallet?.adapter) throw new Error('No wallet connected');
      const credential = await issuer.browserIssue!({
        challengeReq: {
          subject: { id: wallet.subjectId },
          options: { chainId: wallet.chainId },
          validFrom: new Date('2024-01-01').toISOString(),
          validUntil: new Date('2030-05-18').toISOString(),
        },
        sign: wallet.adapter.sign,
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
        isLoading={isPending}
      >Create Credential</Button>
      {isSuccess && <Button as={link({ to: '/' })} color="success">Go Home</Button>}
    </PageContainer>
  );
}
