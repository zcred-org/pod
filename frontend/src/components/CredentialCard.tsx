import { Card, CardBody, type CardProps, Divider, CardHeader } from '@nextui-org/react';
import Avvvatar from 'avvvatars-react';
import { type ReactNode, useMemo } from 'react';
import type { CredentialDecoded } from '@/service/external/zcred-store/types/credentials.types.ts';
import { tryToLocalDateTime } from '@/util/helpers.ts';


type CredentialCardProps = {
  credential: CredentialDecoded,
  onClick?: (credential: CredentialDecoded) => void | Promise<void>,
} & CardProps;

export function CredentialCard(
  { credential, onClick, ...cardProps }: CredentialCardProps,
): ReactNode {
  const type = credential.data.attributes.type;
  const { issuanceDate, validFrom, validUntil } = useMemo(() => ({
    issuanceDate: tryToLocalDateTime(credential.data.attributes.issuanceDate),
    validFrom: tryToLocalDateTime(credential.data.attributes.validFrom),
    validUntil: tryToLocalDateTime(credential.data.attributes.validUntil),
  }), [credential]);
  const issuerHost = new URL(credential.data.meta.issuer.uri).host;

  return (
    <Card className="w-full" isPressable={!!onClick} onClick={() => onClick?.(credential)} {...cardProps}>
      <CardHeader className="text-xl py-2 justify-between">
        <p>
          <strong>{type}</strong>
          <span>{` from ${issuerHost}`}</span>
        </p>
        <Avvvatar value={credential.id} style="shape" radius={8} />
      </CardHeader>
      <Divider className="" />
      <CardBody className="py-2">
        <p>
          <span className="font-bold">{'Issued: '}</span>
          {issuanceDate}
        </p>
        <p>
          <span className="font-bold">{'Valid: '}</span>
          {validFrom}{' - '}{validUntil}
        </p>
      </CardBody>
    </Card>
  );
}
