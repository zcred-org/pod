import { Card, CardFooter, CardHeader } from '@nextui-org/react';
import { FC } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ICredential } from '../interfaces/ICredential.ts';

export const CredentialCard: FC<ICredential> = (props1) => {
  const { No, id, issuedAt, title } = props1;
  const navigate = useNavigate();

  const onClick = () => navigate({ to: `/credential/$id`, params: { id } });

  return (
    <Card className="min-h-[8rem] w-full" isPressable onClick={onClick}>
      <CardHeader className="text-xl">
        {title}
      </CardHeader>
      {issuedAt || No ? <CardFooter className="flex-col items-start">
        {issuedAt && <p>
          Issued At:&nbsp;{issuedAt?.toLocaleDateString()}
        </p>}
        {No && <p>
          No:&nbsp;{No}
        </p>}
      </CardFooter> : null}
    </Card>
  );
};
