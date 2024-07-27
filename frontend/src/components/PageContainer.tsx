import { cn } from '@nextui-org/react';
import type { ComponentProps, PropsWithChildren, ReactNode } from 'react';

export function PageContainer(
  { children, className, ...props }: PropsWithChildren<ComponentProps<'div'>>,
): ReactNode {
  return (
    <div className={cn('flex flex-col sm:self-center sm:min-w-[30rem] px-4 gap-3 py-10', className)} {...props}>
      {children}
    </div>
  );
}
