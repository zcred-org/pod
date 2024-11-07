import { cn } from '@nextui-org/react';
import { type ComponentProps } from 'react';

export type LoadingWaveProps = ComponentProps<'div'> & {
  size?: 'sm' | 'md' | 'lg';
}


export function LoadingWave({ className, ...props }: LoadingWaveProps) {
  const size = {
    'w-5 h-3': props.size === 'sm',
    'w-8 h-5': props.size === 'md' || !props.size,
    'w-10 h-7': props.size === 'lg',
  };

  return (
    <div className={cn('flex justify-between items-center text-primary', size, className)} {...props}>
      <div className="bg-current w-[20%] rounded-sm animate-wave-load animate-delay-[.2s]" />
      <div className="bg-current w-[20%] rounded-sm animate-wave-load animate-delay-[.4s]" />
      <div className="bg-current w-[20%] rounded-sm animate-wave-load animate-delay-[.6s]" />
    </div>
  );
}
