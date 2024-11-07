import { createFileRoute, Navigate } from '@tanstack/react-router';
import { PageContainer } from '@/components/PageContainer.tsx';
import { VerificationTerminatedCard } from '@/components/VerificationTerminatedCard.tsx';
import { VerificationStore } from '@/stores/verification-store/verification-store.ts';


export const Route = createFileRoute('/terminate')({
  component: VerificationTerminatedView,
  beforeLoad: () => ({ title: 'Verification' }),
});

function VerificationTerminatedView() {
  const state = VerificationStore.$terminateAsync.value.data;

  if (!state) return <Navigate to={'/'} />;

  return (
    <PageContainer yCenter>
      <VerificationTerminatedCard {...state.ui} />
    </PageContainer>
  );
}
