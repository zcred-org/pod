import { Progress } from '@nextui-org/react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { createFileRoute, type ErrorComponentProps, Link } from '@tanstack/react-router';
import { AxiosError } from 'axios';
import { FileSearch2 } from 'lucide-react';
import { CredentialCard } from '@/components/CredentialCard.tsx';
import { RequireWalletAndDidHoc } from '@/components/HOC/RequireWalletAndDidHoc.tsx';
import { PageContainer } from '@/components/PageContainer.tsx';
import { useOnScrollOver } from '@/hooks/useOnScrollOver.ts';
import { credentialsInfiniteQuery } from '@/service/queries/credentials.query.ts';
import { routeRequireWalletAndDid } from '@/util/route-require-wallet-and-did.ts';


export const Route = createFileRoute('/credentials')({
  component: () => <RequireWalletAndDidHoc><CredentialsComponent /></RequireWalletAndDidHoc>,
  pendingComponent: PendingComponent,
  errorComponent: ErrorComponent,

  beforeLoad: ({ location }) => {
    routeRequireWalletAndDid(location);
    return ({ title: 'Credentials' });
  },
  loader: () => credentialsInfiniteQuery.prefetch(),
});

function CredentialsComponent() {
  const {
    data, error,
    isPending, isError, isFetchingNextPage,
    hasNextPage, fetchNextPage,
  } = useInfiniteQuery(credentialsInfiniteQuery.default);

  useOnScrollOver({
    refOrElement: window,
    onScrollOver: fetchNextPage,
    isDisabled: !hasNextPage || isFetchingNextPage || isPending,
  });

  if (isPending) return <PendingComponent />;
  if (isError) return <ErrorComponent error={error} />;

  const credentials = data.pages.flatMap(p => p.credentials);

  return (
    <PageContainer>
      {credentials.length ? credentials.map((credential) => (
          <Link key={credential.id} to={`/credential/$id`} params={{ id: credential.id }}>
            <CredentialCard credential={credential} />
          </Link>
        ))
        : (
          <div className="flex gap-3 justify-center">
            <FileSearch2 />
            <p>You have no credentials</p>
          </div>
        )
      }
      {isFetchingNextPage && <Progress isIndeterminate />}
    </PageContainer>
  );
}

function PendingComponent() {
  return (
    <PageContainer>
      <p>Loading credentials...</p>
      <Progress isIndeterminate />
    </PageContainer>
  );
}

function ErrorComponent({ error }: Pick<ErrorComponentProps, 'error'>) {
  return <PageContainer className="text-center">{
    error instanceof AxiosError && error.response?.status === 404 ? <p>Credential not found</p>
      : error instanceof Error ? <p>Error: {error.message}</p>
        : <p>Unknown Error</p>
  }</PageContainer>;
}
