import { CredentialsMocked } from '../../interfaces/ICredential.ts';
import { Card, CardBody, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@nextui-org/react';
import { createFileRoute } from '@tanstack/react-router';
import { PageContainer } from '../../components/PageContainer.tsx';

export const Route = createFileRoute('/_authenticated/credential/$id')({
  component: CredentialComponent,
});

function CredentialComponent() {
  const params = Route.useParams();
  const credential = CredentialsMocked.find((credential) => credential.id === params.id);

  if (!credential) {
    return <p>Credential not found</p>;
  }

  return (
    <PageContainer>
      <p className="font-bold text-2xl">{credential.title}</p>
      <Card>
        <CardBody>
          <p>Issued At:&nbsp;{credential.issuedAt?.toLocaleDateString()}</p>
          <p>No:&nbsp;{credential.No}</p>
          <p>Name:&nbsp;{credential.fio}</p>
          <p>Country:&nbsp;{credential.country}</p>
        </CardBody>
      </Card>
      <Table>
        <TableHeader>
          <TableColumn>Presented at</TableColumn>
          <TableColumn>Date</TableColumn>
        </TableHeader>
        <TableBody emptyContent="Not presented yet">
          {(credential.presentedAt || []).map((presentation) => (
            <TableRow>
              <TableCell>{presentation.site}</TableCell>
              <TableCell>{presentation.date?.toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </PageContainer>
  );
}
