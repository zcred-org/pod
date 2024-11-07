import { Spacer, Button } from '@nextui-org/react';
import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import { type ErrorComponentProps, useRouter, Link, useLocation } from '@tanstack/react-router';
import { AxiosError } from 'axios';
import { useEffect, type ReactNode } from 'react';
import { PageContainer } from '@/components/PageContainer.tsx';


type ErrorViewProps = Pick<ErrorComponentProps, 'error'> & Partial<ErrorComponentProps> & {
  title?: ReactNode;
  message?: ReactNode;
};

export function ErrorView({ error, reset, title, message }: ErrorViewProps) {
  const router = useRouter();
  const isNotHome = useLocation({ select: state => state.pathname !== '/' });
  const queryErrorResetBoundary = useQueryErrorResetBoundary();

  useEffect(() => {
    queryErrorResetBoundary?.reset?.();
  }, [queryErrorResetBoundary]);

  const _reset = async () => {
    await router.invalidate();
    reset?.();
  };

  const code = error instanceof AxiosError ? error.response?.status : undefined;
  const _title = title || code || 'Error';
  const _message = message || ({
    0: error.message || 'Unhandled unknown error',
    400: 'Bad request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not found',
    500: 'Internal server error',
  })[code ?? 0];

  return (
    <PageContainer isCenter>
      <h1 className="text-center text-5xl sm:text-6xl font-thin max-w-[70vw]">{_title}</h1>
      <p className="text-center max-w-[70vw]">{_message}</p>
      <Spacer y={3} />
      <div className="flex gap-3">
        {isNotHome ? <Button as={Link} to="/" variant="faded">Go home</Button> : null}
        <Button onPress={_reset} variant="faded">Try to reload</Button>
      </div>
    </PageContainer>
  );
}
