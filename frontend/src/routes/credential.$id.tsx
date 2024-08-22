import { Card, CardBody, Progress } from '@nextui-org/react';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, type ErrorComponentProps } from '@tanstack/react-router';
import { AxiosError } from 'axios';
import dayjs from 'dayjs';
import { RequireWalletAndDidHoc } from '@/components/HOC/RequireWalletAndDidHoc.tsx';
import { PageContainer } from '@/components/PageContainer.tsx';
import { credentialQuery } from '@/service/queries/credential.query.ts';
import { routeRequireWalletAndDid } from '@/util/route-require-wallet-and-did.ts';


export const Route = createFileRoute('/credential/$id')({
  component: () => <RequireWalletAndDidHoc><CredentialComponent /></RequireWalletAndDidHoc>,
  pendingComponent: PendingComponent,
  errorComponent: ErrorComponent,

  beforeLoad: ({ location }) => {
    routeRequireWalletAndDid(location);
    return ({ title: 'Credential' });
  },
  loader: ({ params }) => credentialQuery.prefetch(params.id),
});

function CredentialComponent() {
  const params = Route.useParams();
  const { data, error, isPending, isError } = useQuery(credentialQuery(params.id));

  if (isPending) return <PendingComponent />;
  if (isError) return <ErrorComponent error={error} />;

  const { attributes: { issuanceDate, type, validFrom, validUntil } } = data.data;

  // TODO: Display credential attributes by their definitions

  return (
    <PageContainer>
      <p className="font-bold text-2xl">{type}</p>
      <Card>
        <CardBody>
          <p>Issuance date:{' '}{dayjs(issuanceDate).format('YYYY-MM-DD')}</p>
          <p>{'Valid: '}{dayjs(validFrom).format('YYYY-MM-DD')}{' - '}{dayjs(validUntil).format('YYYY-MM-DD')}</p>
        </CardBody>
      </Card>
      {/*<Table>*/}
      {/*  <TableHeader>*/}
      {/*    <TableColumn>Presented at</TableColumn>*/}
      {/*    <TableColumn>Date</TableColumn>*/}
      {/*  </TableHeader>*/}
      {/*  <TableBody emptyContent="Not presented yet">*/}
      {/*    {(credential.presentedAt || []).map((presentation) => (*/}
      {/*      <TableRow>*/}
      {/*        <TableCell>{presentation.site}</TableCell>*/}
      {/*        <TableCell>{presentation.date?.toLocaleDateString()}</TableCell>*/}
      {/*      </TableRow>*/}
      {/*    ))}*/}
      {/*  </TableBody>*/}
      {/*</Table>*/}
    </PageContainer>
  );
}

function PendingComponent() {
  return (
    <PageContainer>
      <p>Loading credential...</p>
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
