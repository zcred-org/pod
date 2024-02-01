import { createFileRoute } from '@tanstack/react-router';
import { PageContainer } from '../../components/PageContainer.tsx';
import { CredentialsMocked } from '../../types/ICredential.ts';
import { CredentialCard } from '../../components/CredentialCard.tsx';

export const Route = createFileRoute('/_authenticated/credentials')({
  component: CredentialsComponent,
});

function CredentialsComponent() {
  return (
    <PageContainer>
      {CredentialsMocked.map((credential) => <CredentialCard key={credential.id}{...credential}/>)}
    </PageContainer>
  );
}
