import { createFileRoute } from '@tanstack/react-router';
import { PageContainer } from '@/components/PageContainer.tsx';
import { z } from 'zod';
import axios from 'axios';
import { base64UrlDecode, toJWTPayload } from '@/util/helpers.ts';
import { Proposal, ProvingResult } from '@/service/external/verifier/types.ts';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Card, CardBody, CardHeader, Divider, Progress, Select, SelectItem, Skeleton, Textarea } from '@nextui-org/react';
import { RequireWalletAndDidHoc } from '@/components/HOC/RequireWalletAndDidHoc.tsx';
import { compact, differenceBy, isEqual, omit } from 'lodash-es';
import { useMemo, useState } from 'react';
import { SwitchToRequiredIdModal } from '@/components/modals/SwitchToRequiredIdModal.tsx';
import { CredentialCard } from '@/components/CredentialCard.tsx';
import { type HttpCredential, HttpIssuer } from '@zcredjs/core';
import { zCredProver } from '@/service/o1js-zcred-prover';
import { toast } from 'sonner';
import sortKeys from 'sort-keys';
import { useDidStore } from '@/hooks/useDid.store.ts';
import { FriendlyZCredTranslator } from '@jaljs/friendly-zcred';
import { O1JSCredentialFilter } from '@/service/o1js-credential-filter';
import { useWalletStore } from '@/hooks/web3/useWallet.store.ts';
import { zCredStore } from '@/service/external/zcred-store';
import { routeRequireWalletAndDid } from '@/util/route-require-wallet-and-did.ts';
import { alert } from '@/components/modals/Alerts.tsx';
import { CredentialValidIntervalModal } from '@/components/modals/CredentialValidIntervalModal.tsx';

export const Route = createFileRoute('/prove')({
  component: () => <RequireWalletAndDidHoc><ProveComponent /></RequireWalletAndDidHoc>,
  validateSearch: z.object({
    proposalURL: z.string(),
  }),
  pendingComponent: PendingComponent,
  beforeLoad: ({ location, search }) => {
    routeRequireWalletAndDid(location);
    const verifierHost = new URL(base64UrlDecode(search.proposalURL)).host;
    return { title: `Prove ${verifierHost}` };
  },
  loaderDeps: ({ search }) => ({ proposalURL: base64UrlDecode(search.proposalURL) }),
  loader: async ({ deps }) => {
    console.log('loader: proposal fetching');
    const { data: proposal } = await axios.get<Proposal>(deps.proposalURL);
    const recipientDomain = /(?<=recipient url: ).*?(?=\n)/i.exec(proposal.challenge.message)?.[0];
    if (!recipientDomain || !proposal.verifierURL.startsWith(recipientDomain))
      throw new Error('Invalid Proposal');
    const httpIssuer = new HttpIssuer(proposal.selector.meta.issuer.uri, proposal.accessToken ? `Bearer ${proposal.accessToken}` : undefined);
    return {
      proposal,
      credentialFilter: await O1JSCredentialFilter.create(proposal.program),
      httpIssuer,
      issuerInfo: await httpIssuer.getInfo(),
      verifierHost: new URL(proposal.verifierURL).host,
      issuerHost: new URL(proposal.selector.meta.issuer.uri).host,
    };
  },
});

function ProveComponent() {
  const {
    proposal, verifierHost,
    httpIssuer, issuerInfo, issuerHost,
    credentialFilter,
  } = Route.useLoaderData();
  const did = useDidStore(state => state.did)!;
  const wallet = useWalletStore();
  const requiredId = proposal.selector.attributes.subject.id;
  const issuer = proposal.selector.meta.issuer;
  const isSubjectIdMatched = isEqual(wallet.subjectId, requiredId);

  /* Load credential(s) */
  const {
    data: { credentials = [], credentialsProvable = [] } = {},
    isFetching: isCredentialsFetching,
    refetch: credentialsRefetch,
  } = useQuery({
    queryKey: ['credentials', { subject: requiredId, issuer }] as const,
    queryFn: async ({ queryKey: { 1: filter } }) => {
      const credentials = await zCredStore.credential.credentials(filter).then(creds => creds.map(cred => ({
        ...cred,
        isUpdatable: issuerInfo.proofs.updatable && issuerInfo.proofs.updatedAt > cred.data.attributes.issuanceDate,
      })));
      const provableSet = new Set(compact(credentials.map(cred => credentialFilter.execute(cred.data) && cred.id)));
      const credentialsProvable = credentials.filter(cred => provableSet.has(cred.id));
      credentials.sort((a, b) => {
        if (provableSet.has(a.id) && !provableSet.has(b.id)) return -1;
        if (!provableSet.has(a.id) && provableSet.has(b.id)) return 1;
        return new Date(b.data.attributes.issuanceDate).getTime() - new Date(a.data.attributes.issuanceDate).getTime();
      });
      if (credentialsProvable.length === 1) setCredential(credentialsProvable[0]);
      else if (credential && !credentialsProvable.find(({ id }) => id === credential.id)) setCredential(null);
      return { credentials, credentialsProvable };
    },
    enabled: isSubjectIdMatched,
  });
  const [credential, setCredential] = useState<typeof credentials[number] | null>(null);

  /* Friendly JAL program */
  const friendlyJal = useMemo(() => {
    const definitions = credential?.data.meta.definitions.attributes || issuerInfo.definitions.attributes;
    return definitions ? new FriendlyZCredTranslator(proposal.program, definitions).translate() : null;
  }, [credential?.data.meta.definitions.attributes, issuerInfo.definitions.attributes, proposal.program]);

  /* Issue or update a credential */
  const [cantContinueReason, setCantContinueReason] = useState<string | null>(null);
  const isCredentialNeedIssue = !isCredentialsFetching && !credentialsProvable.length;
  const isCredentialNeedUpdate = credential?.isUpdatable;
  const isCredentialNeedsUpsert = isCredentialNeedIssue || isCredentialNeedUpdate;
  const credentialUpsert = useMutation({
    mutationKey: ['credentialUpsert'],
    mutationFn: async () => {
      if (!isCredentialNeedIssue && !isCredentialNeedUpdate) return;
      if (!wallet.adapter) throw new Error('Wallet adapter is required for credential issuance');
      let credentialNew: HttpCredential = null as never;
      if (isCredentialNeedIssue) {
        if (!httpIssuer.browserIssue) throw new Error('Issuer does not support credential issuance');
        const isFromCustom = issuerInfo.credential.attributesPolicy.validFrom === 'custom';
        const isToCustom = issuerInfo.credential.attributesPolicy.validUntil === 'custom';
        const validInterval = isFromCustom === true || isToCustom === true
          ? await CredentialValidIntervalModal.open({ from: isFromCustom, to: isToCustom })
          : undefined;
        toast.loading('Issuing new credential...', { id: 'credentialUpsert' });
        credentialNew = await httpIssuer.browserIssue({
          challengeReq: {
            subject: { id: wallet.subjectId },
            options: { chainId: wallet.chainId },
            validFrom: validInterval?.from?.toISOString(),
            validUntil: validInterval?.to?.toISOString(),
          },
          sign: wallet.adapter.sign,
          windowOptions: { target: '_blank' },
        }).catch((error) => {
          toast.error('Failed to issue new credential', { id: 'credentialUpsert' });
          throw error;
        });
        toast.success('Successfully issued new credential', { id: 'credentialUpsert' });
      } else if (isCredentialNeedUpdate) {
        if (!httpIssuer.updateProofs) throw new Error('Issuer does not support credential update');
        toast.loading('Updating credential...');
        credentialNew = await httpIssuer.updateProofs(credential.data).catch(error => {
          toast.error('Failed to update credential', { id: 'credentialUpsert' });
          throw error;
        });
        toast.success('Successfully updated credential', { id: 'credentialUpsert' });
      }
      toast.loading('Verifying new credential...', { id: 'credentialUpsert' });
      // Verify JWS
      const { 0: jwsHeader, 2: jwsSignature } = credentialNew.protection.jws.split('.');
      if (JSON.parse(base64UrlDecode(jwsHeader)).kid !== issuerInfo?.protection.jws.kid) {
        toast.error('Credential verification failed', { id: 'credentialUpsert' });
        throw new Error('JWS kid does not match');
      }
      const jwsPayload = toJWTPayload(sortKeys(omit(credentialNew, ['protection']), { deep: true }));
      await did.verifyJWS(`${jwsHeader}.${jwsPayload}.${jwsSignature}`).catch(error => {
        toast.error('Credential verification failed', { id: 'credentialUpsert' });
        throw error;
      });
      toast.success('Credential verified', { id: 'credentialUpsert' });
      // Store credential
      // // @ts-expect-error In DEV, we can break the credential
      // credentialNew.attributes.subject.firstName = 'Ivan 123';
      const isProvable = credentialFilter.execute(credentialNew);
      if (!isProvable) {
        setCantContinueReason('You can\'t get suitable credentials for this proposal');
      }
      const doSave = !isProvable ? await alert({
        title: 'Received credential is not provable',
        text: (<>
          <p>You can't use new credential for this proposal</p>
          <p className="font-bold">Do you want to save it anyway?</p>
        </>),
        actions: [
          { value: 'Yes', variant: 'light', color: 'success' },
          { value: 'No', variant: 'shadow', color: 'danger' },
        ],
      }) : null;
      if (isProvable || doSave === 'Yes') {
        await zCredStore.credential.credentialUpsert(credentialNew, credential?.id);
        await credentialsRefetch();
        toast.success('Credential verified and stored', { id: 'credentialUpsert' });
      } else {
        toast.warning('Received credential rejected', { id: 'credentialUpsert' });
      }
    },
    throwOnError: (error) => {
      toast.error(`Credential issuance failed: ${error.message}`, { id: 'credentialUpsert' });
      credentialUpsert.reset();
      return false;
    }
  });

  /* Prove mutation */
  const prove = useMutation({
    mutationKey: ['prove'],
    mutationFn: async () => {
      if (!wallet.adapter) throw new Error('Wallet adapter is required for proof creation');
      if (!credential) throw new Error('Credential is required for proof creation');
      const id = Math.random().toString(36);
      toast.loading('Creating a proof...', { id });
      console.time('createProof');
      try {
        const proof = await zCredProver.createProof({
          credential: credential.data,
          jalProgram: proposal.program,
        });
        toast.success('Proof created!', { id });
        return proof;
      } catch (e) {
        toast.error('Proof creation failed', { id });
      } finally {
        console.timeEnd('createProof');
      }
    },
  });

  const signChallenge = useMutation<ProvingResult>({
    mutationKey: ['signChallenge'],
    mutationFn: async () => {
      if (!prove.data) throw new Error('Proof is required for signing the challenge');
      if (!wallet.adapter) throw new Error('Wallet adapter is required for signing the challenge');
      return {
        ...prove.data,
        signature: await wallet.adapter.sign({ message: proposal.challenge.message }),
      };
    },
    onSuccess: async data => {
      const redirectURL = await axios.post<{ redirectURL: string }>(proposal.verifierURL, data).then(res => res.data.redirectURL);
      toast.loading('Challenge completed! Redirecting...', { duration: 3e3 });
      await new Promise(resolve => setTimeout(resolve, 3e3));
      location.replace(redirectURL);
    },
  });

  const isProcessing = prove.isPending;

  if (!isSubjectIdMatched) {
    return <SwitchToRequiredIdModal requiredId={requiredId} subjectId={(wallet.subjectId)!} />;
  }

  return (
    <PageContainer>
      <CredentialValidIntervalModal />
      {isCredentialNeedIssue ? <p>
        <span className="underline">{verifierHost}</span>
        {' asks you to receive a credential from '}
        <span className="underline">{issuerHost}</span>
        {' and create a proof:'}
      </p> : null}
      {isCredentialNeedUpdate ? <p>
        <span className="underline">{verifierHost}</span>
        {' asks you to update a credential and create a proof:'}
      </p> : null}
      {!isCredentialNeedsUpsert && <p>
        <span className="underline">{verifierHost}</span>
        {' asks you to create a proof:'}
      </p>}
      <Card>
        <CardHeader className="text-xl font-bold">
          {credential?.data.attributes.type || issuerInfo.credential.type}
        </CardHeader>
        <Divider />
        <CardBody>
          {friendlyJal?.split('\n').map((line, i) => line ? <p key={i}>{line}</p> : <p key={i}>&nbsp;</p>)}
        </CardBody>
      </Card>
      {credentials.length > 1 && !prove.isSuccess ? <Select
        items={credentials}
        selectedKeys={credential ? [credential.id] : []}
        label="Credential"
        disabledKeys={differenceBy(credentials, credentialsProvable, 'id').map(({ id }) => id)}
        placeholder="Select a credential"
        isLoading={isCredentialsFetching}
        isDisabled={prove.isPending}
        description={credentialsProvable.length > 1
          ? 'You have more than one suitable credential, please specify which one you would like to use'
          : credentialsProvable.length === 0
            ? 'You do not have any suitable credentials'
            : undefined
        }
        // labelPlacement="outside"
        renderValue={([item]) => item.data?.id}
      >{item => (
        <SelectItem key={item.id} value={item.id}>
          <CredentialCard credential={item} onClick={() => setCredential(item)} />
        </SelectItem>
      )}</Select> : null}
      {proposal.comment ? <Textarea
        label="Comment"
        defaultValue={proposal.comment}
        isReadOnly
        color="warning"
        minRows={1}
      /> : null}
      <div className="grow">
        {isProcessing && <Progress
          isIndeterminate
          isStriped
          label="Creating a proof..."
        />}
      </div>
      {cantContinueReason && <Textarea
        label="Can't continue"
        value={cantContinueReason}
        isReadOnly
        color="danger"
        minRows={1}
      />}
      <div className="flex gap-3">
        <Button
          className="grow"
          variant="light"
          color="danger"
          onClick={() => window.location.href = document.referrer}
        >Reject</Button>
        {isCredentialNeedsUpsert && <Button
          className="grow"
          color="success"
          isLoading={credentialUpsert.isPending}
          onClick={() => credentialUpsert.mutate()}
          isDisabled={!!cantContinueReason}
        >{isCredentialNeedIssue ? 'Issue credential' : 'Update credential'}</Button>}
        {!isCredentialNeedsUpsert && !prove.isSuccess && <Button
          className="grow"
          color="success"
          isLoading={prove.isPending || isCredentialsFetching}
          isDisabled={prove.isPending || !credential || !!cantContinueReason}
          onClick={() => prove.mutate()}
        >Create proof</Button>}
        {prove.isSuccess && <Button
          className="grow"
          color="success"
          isLoading={signChallenge.isPending}
          onClick={() => signChallenge.mutate()}
          isDisabled={signChallenge.isSuccess || !!cantContinueReason}
        >Sign challenge</Button>}
      </div>
    </PageContainer>
  );
}

function PendingComponent() {
  return <PageContainer>
    <div className="flex items-center gap-1">
      <Skeleton className="w-20 h-5 rounded-md" />
      {' asks you to create a proof:'}
    </div>
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-[30%] rounded-md" />
      </CardHeader>
      <Divider />
      <CardBody className="flex flex-col gap-2">
        <Skeleton className="h-4 w-[20%] rounded-md" />
        <Skeleton className="h-4 w-[40%] rounded-md" />
        <Skeleton className="h-4 w-[56%] rounded-md" />
        <Skeleton className="h-4 w-[48%] rounded-md" />
        <Skeleton className="h-4 w-[32%] rounded-md" />
      </CardBody>
    </Card>
    <div className="flex gap-3">
      <Button className="grow" variant="light" color="danger" disabled isLoading>Reject</Button>
      <Button className="grow" color="success" disabled isLoading>Create proof</Button>
    </div>
  </PageContainer>;
}
