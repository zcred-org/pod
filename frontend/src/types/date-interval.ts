import type { Info } from '@zcredjs/core';

export type DateInterval = { from?: Date, to?: Date };
export type DateIntervalRequiredFields = { from?: boolean, to?: boolean };

export function isDateIntervalMatched(interval: DateInterval | undefined, required: DateIntervalRequiredFields | undefined): boolean {
  return !!required?.from === interval?.from instanceof Date
    && !!required?.to === interval?.to instanceof Date;
}

export function dateIntervalFieldsFromIssuerInfo(issuerInfo: Info): DateIntervalRequiredFields {
  return {
    from: issuerInfo.credential.attributesPolicy.validFrom === 'custom',
    to: issuerInfo.credential.attributesPolicy.validUntil === 'custom',
  };
}
