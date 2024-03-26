import { Progress } from '@nextui-org/react';
import { createFileRoute } from '@tanstack/react-router';
import { FileSearch2 } from 'lucide-react';
import { CredentialCard } from '@/components/CredentialCard.tsx';
import { link } from '@/components/factories/link.tsx';
import { RequireWalletAndDidHoc } from '@/components/HOC/RequireWalletAndDidHoc.tsx';
import { PageContainer } from '@/components/PageContainer.tsx';
import { queryClient } from '@/config/query-client.ts';
import { zCredStore } from '@/service/external/zcred-store';
import { routeRequireWalletAndDid } from '@/util/route-require-wallet-and-did.ts';

export const Route = createFileRoute('/credentials')({
  component: () => <RequireWalletAndDidHoc><CredentialsComponent /></RequireWalletAndDidHoc>,
  beforeLoad: ({ location }) => {
    routeRequireWalletAndDid(location);
    return ({ title: 'Credentials' });
  },
  loader: () => queryClient.ensureQueryData({
    queryKey: ['credentials'],
    queryFn: () => zCredStore.credential.credentials(),
  }),
  pendingComponent: () => (
    <PageContainer>
      <p>Loading credentials...</p>
      <Progress isStriped isIndeterminate />
    </PageContainer>
  ),
});

function CredentialsComponent() {
  const credentials = Route.useLoaderData();

  return (
    <PageContainer>
      {credentials.length ? credentials.map((credential) => (
          <CredentialCard
            credential={credential}
            key={credential.id}
            as={link({ to: `/credential/$id`, params: { id: credential.id } })}
          />
        ))
        : (
          <div className="flex gap-3 justify-center">
            <FileSearch2 />
            <p>You have no credentials</p>
          </div>
        )
      }
    </PageContainer>
  );
}
