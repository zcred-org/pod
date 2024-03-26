import { Card, CardBody, Progress } from '@nextui-org/react';
import { createFileRoute } from '@tanstack/react-router';
import { AxiosError } from 'axios';
import dayjs from 'dayjs';
import { RequireWalletAndDidHoc } from '@/components/HOC/RequireWalletAndDidHoc.tsx';
import { PageContainer } from '@/components/PageContainer.tsx';
import { queryClient } from '@/config/query-client.ts';
import { zCredStore } from '@/service/external/zcred-store';
import { routeRequireWalletAndDid } from '@/util/route-require-wallet-and-did.ts';

export const Route = createFileRoute('/credential/$id')({
  component: () => <RequireWalletAndDidHoc><CredentialComponent /></RequireWalletAndDidHoc>,
  errorComponent: ({ error }) => (
    <PageContainer>{
      error instanceof AxiosError && error.response?.status === 404 ? <p>Credential not found</p>
        : error instanceof Error ? <p>Error: {error.message}</p>
          : <p>Unknown Error</p>
    }</PageContainer>
  ),
  beforeLoad: ({ location }) => {
    routeRequireWalletAndDid(location);
    return ({ title: 'Credential' });
  },
  loader: ({ params }) => queryClient.ensureQueryData({
    queryKey: ['credential', params.id],
    queryFn: () => zCredStore.credential.credentialById(params.id),
  }),
  pendingComponent: () => (
    <PageContainer>
      <p>Loading credential...</p>
      <Progress isStriped isIndeterminate />
    </PageContainer>
  ),
});

function CredentialComponent() {
  const credential = Route.useLoaderData();

  const { attributes: { issuanceDate, type, validFrom, validUntil } } = credential.data;

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
