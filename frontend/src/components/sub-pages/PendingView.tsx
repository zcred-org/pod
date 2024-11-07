import { PageContainer } from '@/components/PageContainer.tsx';
import { ApproximateSpin } from '@/components/ui/LoadingSpin/ApproximateSpin.tsx';


type PendingComponentProps = {
  label?: string;
}

export function PendingView({ label }: PendingComponentProps) {
  return (
    <PageContainer isCenter>
      <ApproximateSpin label={label} />
    </PageContainer>
  );
}
