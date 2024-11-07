import { Progress } from '@nextui-org/react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { FileSearch2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { CredentialCard } from '@/components/CredentialCard.tsx';
import { RequireWalletAndDidHoc } from '@/components/HOC/RequireWalletAndDidHoc.tsx';
import { PageContainer } from '@/components/PageContainer.tsx';
import { ErrorView } from '@/components/sub-pages/ErrorView.tsx';
import { PendingView } from '@/components/sub-pages/PendingView.tsx';
import { useOnScrollOver } from '@/hooks/useOnScrollOver.ts';
import { credentialsInfiniteQuery } from '@/service/queries/credentials.query.ts';
import { routeRequireWalletAndDid } from '@/util/route-require-wallet-and-did.ts';


export const Route = createFileRoute('/credentials')({
  component: () => <RequireWalletAndDidHoc><CredentialsView /></RequireWalletAndDidHoc>,
  pendingComponent: CredentialsPendingView,
  errorComponent: ErrorView,

  beforeLoad: ({ location }) => {
    routeRequireWalletAndDid(location);
    return ({ title: 'Credentials' });
  },
  loader: () => credentialsInfiniteQuery.prefetch(),
});

function CredentialsView() {
  const {
    data, error,
    isPending, isError, isFetchingNextPage,
    hasNextPage, fetchNextPage,
  } = useInfiniteQuery(credentialsInfiniteQuery());

  useOnScrollOver({
    refOrElement: window,
    onScrollOver: fetchNextPage,
    isDisabled: !hasNextPage || isFetchingNextPage || isPending,
  });

  if (isPending) return <CredentialsPendingView />;
  if (isError) throw error;

  const credentials = data.pages.flatMap(p => p.credentials);
  const isHasCredentials = !!credentials.length;

  const Credentials = (): ReactNode[] => credentials.map((credential) => (
    <Link
      key={credential.id}
      to={`/credential/$id`}
      state={prev => ({ ...prev, isCanBack: true })}
      params={{ id: credential.id }}
    >
      <CredentialCard
        credential={credential}
        className="rounded-none sm:rounded-large"
        classNames={{ header: 'px-8 sm:px-3', body: 'px-8 sm:px-3' }}
      />
    </Link>
  ));

  const EmptyPage = (): ReactNode => (
    <div className="flex gap-3 justify-center">
      <FileSearch2 /><span>You have no credentials</span>
    </div>
  );

  return (
    <PageContainer className="px-0" yCenter={!isHasCredentials}>
      {isHasCredentials ? <Credentials /> : <EmptyPage />}
      {isFetchingNextPage && <Progress isIndeterminate />}
    </PageContainer>
  );
}

function CredentialsPendingView() {
  return <PendingView label="Loading credentials..." />;
}
