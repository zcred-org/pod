import { Stepper } from '@/components/ui/Stepper/Stepper.tsx';
import { VerificationStore } from '@/stores/verification-store/verification-store.ts';
import { ZCredIssueStore } from '@/stores/z-cred-issue.store.ts';


export function ProveStepper() {
  const {
    $proofCacheAsync,
    $proofSendAsync,
    $proofSignAsync,
    $credentialIssueAsync,
    $credentialsAsync,
    $credential,
    $proofCreateAsync,
    $terminateAsync,
    $isIssuanceRequired,
  } = VerificationStore;

  const isOrWasIssuance = $isIssuanceRequired.value || !$credentialIssueAsync.value.isIdle;

  return (
    <Stepper>
      {isOrWasIssuance ? (
        <Stepper.Step
          label={ZCredIssueStore.session.value?.challenge ? 'Sign credential' : 'Get credential'}
          isSuccess={$credentialIssueAsync.value.isSuccess}
          isError={!$terminateAsync.value.isIdle}
          isLoading={$credentialIssueAsync.value.isLoading}
          isApproximate={!ZCredIssueStore.session.value}
        />
      ) : (
        <Stepper.Step
          label={$credentialsAsync.value.isLoading || $credential.value ? 'Find credential' : 'Select credential'}
          isSuccess={!!$credential.value}
          isError={!$terminateAsync.value.isIdle}
          isLoading={$credentialsAsync.value.isLoading}
          isApproximate
        />
      )}
      <Stepper.Step
        label={$proofCacheAsync.value.isIdle || $proofCacheAsync.value.isError ? 'Create proof' : 'Find proof'}
        isSuccess={$proofCreateAsync.value.isSuccess}
        isError={!$terminateAsync.value.isIdle}
        isLoading={$proofCreateAsync.value.isLoading || $proofCacheAsync.value.isLoading}
        isApproximate
        isSlow
      />
      <Stepper.Step
        label={$terminateAsync.value.isLoading ? 'Rejecting'
          : $proofSignAsync.value.isLoading ? 'Sign proof' : 'Prove'}
        isSuccess={$proofSendAsync.value.isSuccess}
        isError={!$proofSendAsync.value.isIdle && !$proofSendAsync.value.isLoading && !$proofSendAsync.value.isSuccess && $terminateAsync.value.isSuccess}
        isLoading={$proofSignAsync.value.isLoading
          || $proofSendAsync.value.isLoading
          || $terminateAsync.value.isLoading}
        isApproximate={$proofSendAsync.value.isLoading || $terminateAsync.value.isLoading}
      />
    </Stepper>
  );
}
