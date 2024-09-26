import { cn } from '@nextui-org/react';
import type { ComponentProps, PropsWithChildren, ReactNode } from 'react';


type PageContainerProps = PropsWithChildren<ComponentProps<'div'>> & {
  isCenter?: boolean;
  yCenter?: boolean;
  xCenter?: boolean;
};

export function PageContainer(
  { children, className, isCenter, yCenter, xCenter, ...props }: PageContainerProps,
): ReactNode {
  return (
    <div className={cn(
      'flex flex-col sm:self-center sm:min-w-[30rem] px-4 gap-3 py-10',
      { 'grow justify-center': yCenter || isCenter },
      { 'items-center': xCenter || isCenter },
      className,
    )} {...props}>
      {children}
    </div>
  );
}
