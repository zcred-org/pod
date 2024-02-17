import { base64Decode } from '../util/helpers.ts';
import { useSearch } from '@tanstack/react-router';
import type { Identifier } from '@zcredjs/core';

export const useRequiredId = () => {
  const { proposalURL: proposalEncodedURL } = useSearch({ strict: false }) as Record<string, string | undefined>;

  if (!proposalEncodedURL) {
    return null;
  }

  const proposalURL = new URL(base64Decode(proposalEncodedURL));

  const requiredId: Identifier = {
    type: proposalURL.searchParams.get('subject.id.type')!,
    key: proposalURL.searchParams.get('subject.id.key')!,
  };

  if (!requiredId.type) throw new Error('Missing subject.id.type');
  if (!requiredId.key) throw new Error('Missing subject.id.key');

  return { proposalURL, requiredId };
};
