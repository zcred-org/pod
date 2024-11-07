import { Button, Spacer } from '@nextui-org/react';
import { Link } from '@tanstack/react-router';
import { PageContainer } from '@/components/PageContainer.tsx';


export function NotFoundView() {
  return (
    <PageContainer isCenter>
      <h1 className="text-8xl font-thin">404</h1>
      <p>Page not found</p>
      <Spacer y={3} />
      <Button as={Link} to="/" variant="faded">Go home</Button>
    </PageContainer>
  );
}
