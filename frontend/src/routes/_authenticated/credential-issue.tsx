import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { HttpIssuer } from '@zcredjs/core';
import { Button } from '@nextui-org/react';
import { PageContainer } from '../../components/PageContainer.tsx';
import { useGetSubjectId } from '../../hooks/web3/useGetSubjectId.ts';
import { useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { zCredStore } from '../../service/zcred-store/zcred-store.api.ts';
import { useWalletAdapter } from '../../hooks/web3/useWalletAdapter.ts';
import { toast } from 'sonner';

export const Route = createFileRoute('/_authenticated/credential-issue')({
  component: CredentialIssue,
});

function CredentialIssue() {
  const navigate = useNavigate();
  const walletAdapter = useWalletAdapter();
  const { data: subjectId, isFetching: isSubjectIdFetching } = useGetSubjectId();
  const { mutate: credentialIssue, isPending, isSuccess } = useMutation({
    onSuccess: () => toast.success('Credential created'),
    onError: (error) => toast.error(error.message),
    mutationFn: async () => {
      const credential = await issuer.browserIssue!({
        challengeReq: {
          subject: { id: subjectId! },
          options: {
            redirectURL: 'http://localhost:5173/test-page',
            chainId: await walletAdapter!.getChainId(),
          },
          validFrom: new Date('2024-02-18').toISOString(),
          validUntil: new Date('2024-05-18').toISOString(),
        },
        sign: walletAdapter!.sign,
        windowOptions: {
          target: '_blank',
        },
      });
      await zCredStore.credential.credentialUpsert(credential);
    },
  });

  const issuer = useMemo(() => new HttpIssuer('https://api.dev.sybil.center/api/v1/zcred/issuers/passport/'), []);

  return (
    <PageContainer>
      <Button
        onClick={() => credentialIssue()}
        isLoading={isSubjectIdFetching || isPending}
        isDisabled={!walletAdapter || isSuccess}
      >
        Create Credential
      </Button>
      {isSuccess && <Button onClick={() => navigate({ to: '/' })} color="success">Go Home</Button>}
    </PageContainer>
  );
}
