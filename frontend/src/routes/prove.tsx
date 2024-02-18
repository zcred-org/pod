import { createFileRoute } from '@tanstack/react-router';
import { RequireRequiredSubjectId } from '../components/HOC/RequireRequiredSubjectId.tsx';
import { PageContainer } from '../components/PageContainer.tsx';

export const Route = createFileRoute('/prove')({
  component: ProveComponent,
});

function ProveComponent() {
  // const proposal = Route.useLoaderData({ select: data => data.data });

  return (
    <RequireRequiredSubjectId>
      <PageContainer>
        ProvePage
        requiredId === subjectId
        {/*<pre>*/}
        {/*{JSON.stringify(proposal, null, 2).split('\n').map((line, i) => (*/}
        {/*  <div key={i}>{line}</div>*/}
        {/*))}*/}
        {/*</pre>*/}
      </PageContainer>
    </RequireRequiredSubjectId>
  );
}
