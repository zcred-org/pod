import { createFileRoute } from '@tanstack/react-router';
import { PageContainer } from '../../components/PageContainer.tsx';
import { z } from 'zod';
import axios from 'axios';
import { base64UrlDecode } from '../../util/helpers.ts';
import { Proposal } from '../../service/external/verifier/types.ts';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from '@nextui-org/react';
import { useGetSubjectId } from '../../hooks/web3/useGetSubjectId.ts';
import { RequireWalletAndDidHoc } from '../../components/HOC/RequireWalletAndDidHoc.tsx';
import { zCredStore } from '../../service/zcred-store/zcred-store.api.ts';
import { isEqual } from 'lodash';

export const Route = createFileRoute('/prove')({
  component: () => <RequireWalletAndDidHoc><ProveComponent/></RequireWalletAndDidHoc>,
  validateSearch: z.object({
    proposalURL: z.string(),
  }).transform(({ proposalURL }) => ({
    proposalURL: base64UrlDecode(proposalURL),
  })),
});

function ProveComponent() {
  const { proposalURL } = Route.useSearch();
  const { data: subjectId, isFetching: isSubjectIdFetching } = useGetSubjectId();
  const { data: proposal, isFetching: isProposalFetching } = useQuery({
    queryKey: ['proposal', proposalURL],
    queryFn: () => axios.get<Proposal>(proposalURL),
    select: data => data.data,
  });
  const issuer = proposal?.selector.meta.issuer;
  const requiredId = proposal?.selector.attributes.subject.id;

  const { /*data, */isFetching: isCredentialsFetching } = useQuery({
    queryKey: ['credentials', proposalURL],
    queryFn: () => zCredStore.credential.credentials({ subject: requiredId, issuer }),
    enabled: isEqual(subjectId, requiredId),
    select: data => data[0], // TODO: implement credential selection
  });

  if (isSubjectIdFetching || isProposalFetching || isCredentialsFetching) {
    return <PageContainer><Spinner size={'lg'}/></PageContainer>;
  }

  return (
    <PageContainer>
      ProvePage
      requiredId === subjectId
      <br/>
      {JSON.stringify(subjectId, null, 2)}
      <br/>
      {JSON.stringify(requiredId, null, 2)}
      <pre>
        {isProposalFetching && <Spinner size={'lg'}/>
          || JSON.stringify(proposal, null, 2).split('\n').map((line, i) => (
            <div key={i}>{line}</div>
          ))}
      </pre>
    </PageContainer>
  );
}
