import { Card, CardBody, type CardProps, Divider, CardHeader, cn } from '@nextui-org/react';
import Avvvatar from 'avvvatars-react';
import { type ReactNode, useMemo } from 'react';
import type { CredentialDecoded } from '@/service/external/zcred-store/types/credentials.types.ts';
import { tryToLocalDateTime } from '@/util/helpers.ts';


type CredentialCardProps = {
  credential: CredentialDecoded,
  onClick?: (credential: CredentialDecoded) => void | Promise<void>,
} & CardProps;

export function CredentialCard(
  { credential, onClick, className, classNames, ...cardProps }: CredentialCardProps,
): ReactNode {
  const type = credential.data.attributes.type;
  const { issuanceDate, validFrom, validUntil } = useMemo(() => ({
    issuanceDate: tryToLocalDateTime(credential.data.attributes.issuanceDate),
    validFrom: tryToLocalDateTime(credential.data.attributes.validFrom),
    validUntil: tryToLocalDateTime(credential.data.attributes.validUntil),
  }), [credential]);
  const issuerHost = new URL(credential.data.meta.issuer.uri).host;

  return (
    <Card
      className={cn('w-full', className)}
      isPressable={!!onClick}
      classNames={classNames}
      onClick={() => onClick?.(credential)}
      {...cardProps}
    >
      <CardHeader className="text-xl text-start py-2 justify-between [&>:last-child]:shrink-0">
        <strong>{type}</strong>
        <Avvvatar value={credential.id} style="shape" radius={8} />
      </CardHeader>
      <Divider className="" />
      <CardBody className="py-2">
        <p><span className="font-bold">{'Issuer: '}</span>{issuerHost}</p>
        <p><span className="font-bold">{'Issued: '}</span>{issuanceDate}</p>
        <p><span className="font-bold">{'Valid: '}</span>{validFrom}{' - '}{validUntil}</p>
      </CardBody>
    </Card>
  );
}
