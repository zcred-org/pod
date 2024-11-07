import { TableHeader, TableBody, Table, TableColumn, TableRow, TableCell, Card, CardBody, CardHeader, Divider, Link, cn } from '@nextui-org/react';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useRouter, type ErrorComponentProps } from '@tanstack/react-router';
import Avvvatar from 'avvvatars-react';
import { AxiosError } from 'axios';
import { get } from 'lodash-es';
import { ChevronLeft } from 'lucide-react';
import { useMemo, useReducer } from 'react';
import { RequireWalletAndDidHoc } from '@/components/HOC/RequireWalletAndDidHoc.tsx';
import { IconVisibility } from '@/components/icons/IconVisibility.tsx';
import { PageContainer } from '@/components/PageContainer.tsx';
import { ErrorView } from '@/components/sub-pages/ErrorView.tsx';
import { PendingView } from '@/components/sub-pages/PendingView.tsx';
import { useAsLinkBuilder } from '@/hooks/useAsLinkBuilder.ts';
import { credentialQuery } from '@/service/queries/credential.query.ts';
import { tryToLocalDateTime } from '@/util/independent/date.ts';
import { objectFlat } from '@/util/independent/object.ts';
import { routeRequireWalletAndDid } from '@/util/route-require-wallet-and-did.ts';


export const Route = createFileRoute('/credential/$id')({
  component: () => <RequireWalletAndDidHoc><CredentialView /></RequireWalletAndDidHoc>,
  pendingComponent: CredentialPendingView,
  errorComponent: CredentialErrorView,

  beforeLoad: ({ location }) => {
    routeRequireWalletAndDid(location);
    return ({
      title: 'Credential',
      isCanBack: 'isCanBack' in location.state || false,
    });
  },
  loader: ({ params }) => credentialQuery.prefetch(params.id),
});

function CredentialView() {
  const router = useRouter();
  const isCanBack = Route.useRouteContext({ select: (state) => state.isCanBack });
  const link = useAsLinkBuilder();
  const credentialId = Route.useParams().id;
  const { data: zCred, error, isPending, isError } = useQuery(credentialQuery(credentialId));
  const attributesList = useMemo(() => zCred ? Object.entries(objectFlat(zCred.data.attributes)) : null, [zCred]);

  if (isPending) return <CredentialPendingView />;
  if (isError) throw error;

  const type = zCred.data.attributes.type;
  const attributesDefinitions = zCred.data.meta.definitions.attributes;
  const issuerHost = new URL(zCred.data.meta.issuer.uri).host;

  const attributeRow = (args: { key: string, value: string }) => {
    const description: string = get(attributesDefinitions, args.key).toString();
    const isPrivate = /warning|private/i.test(description);
    const valueMapped = tryToLocalDateTime(args.value);
    return (
      <TableRow key={args.key}>
        <TableCell>{description}</TableCell>
        <TableCell className={cn({ 'break-all': !valueMapped.includes(' ') })}>
          {isPrivate ? <PrivateField value={valueMapped} /> : valueMapped}
        </TableCell>
      </TableRow>
    );
  };


  return (
    <PageContainer className="gap-5 px-0 pb-10">
      <Card className="rounded-none sm:rounded-large">
        <CardHeader className="text-2xl justify-between items-center [&>:last-child]:shrink-0">
          <p><strong>{type}</strong><span>{` from ${issuerHost}`}</span></p>
          <Avvvatar value={zCred.id} style="shape" radius={8} />
        </CardHeader>
        <Divider />
        <CardBody className="p-0">
          <Table isStriped className="" classNames={{ wrapper: 'rounded-none p-0', th: '!rounded-none', td: 'before:!rounded-none' }}>
            <TableHeader>
              <TableColumn>Attribute</TableColumn>
              <TableColumn>Value</TableColumn>
            </TableHeader>
            <TableBody emptyContent={'Empty attributes'}>
              {attributesList?.map(([key, value]) => attributeRow({ key, value })) || []}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
      <div className="flex justify-center">
        <Link
          {...link({ to: '/credentials' })}
          className="flex items-center cursor-pointer"
          onClick={isCanBack ? (e) => {
            e.preventDefault();
            router.history.back();
          } : undefined}
        >
          <ChevronLeft />
          <span className="inline leading-[13px] -mt-[1px] align-sub">{' Go back'}</span>
        </Link>
      </div>
    </PageContainer>
  );
}

function PrivateField({ value }: { value: string }) {
  const [isVisible, toggle] = useReducer((isVisible) => !isVisible, false);
  return (<div className="flex justify-between items-center">
    <span>{isVisible ? value : '*'.repeat(10)}</span>
    <IconVisibility className="cursor-pointer" onClick={toggle} isVisible={isVisible} height={16} width={16} />
  </div>);
}

function CredentialPendingView() {
  return <PendingView label="Loading credential..." />;
}

function CredentialErrorView({ error, reset }: ErrorComponentProps) {
  const is404 = error instanceof AxiosError && error.response?.status === 404;
  return (
    <ErrorView
      error={error}
      reset={reset}
      title={is404 ? <>Credential not&nbsp;found</> : undefined}
      message={is404 ? 'The credential you are looking for does not exist' : undefined}
    />
  );
}
