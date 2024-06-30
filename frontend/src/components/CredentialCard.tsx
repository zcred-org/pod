import { Card, CardBody, type CardProps, Divider } from '@nextui-org/react';
import dayjs from 'dayjs';
import { type ReactNode, useMemo } from 'react';
import { config } from '@/config';
import { useColored } from '@/hooks/useColored.ts';
import type { ZCredStore } from '@/service/external/zcred-store/api-specification.ts';

type CredentialCardProps = {
  credential: ZCredStore['CredentialDecoded'],
  onClick?: (credential: ZCredStore['CredentialDecoded']) => void | Promise<void>,
} & CardProps;

export function CredentialCard(
  { credential, onClick, ...cardProps }: CredentialCardProps,
): ReactNode {
  const title = credential.data.attributes.type;
  const { issuanceDate, validFrom, validUntil } = useMemo(() => ({
    issuanceDate: dayjs(credential.data.attributes.issuanceDate).format('YYYY-MM-DD'),
    validFrom: dayjs(credential.data.attributes.validFrom).format('YYYY-MM-DD'),
    validUntil: dayjs(credential.data.attributes.validUntil).format('YYYY-MM-DD'),
  }), [credential]);

  const { 1: idColor } = useColored(credential.id);

  return (
    <Card className="w-full" isPressable={!!onClick} onClick={() => onClick?.(credential)} {...cardProps}>
      <CardBody>
        <p className="text-xl font-bold">{title}</p>
        <Divider className="mt-3 mb-1" />
        <p>
          <span className="font-bold">{'Issuance date: '}</span>
          {issuanceDate}
        </p>
        <p>
          <span className="font-bold">{'Valid: '}</span>
          {validFrom}{' - '}{validUntil}
        </p>
        {config.isDev ? <p style={{ color: idColor }} className="text-small">
          {credential.id}
        </p> : null}
      </CardBody>
    </Card>
  );
}
