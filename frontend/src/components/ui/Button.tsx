import { Button as NUI_Button, type ButtonProps as NUI_ButtonProps, cn } from '@nextui-org/react';
import { ApproximateSpin, type ApproximateSpinProps } from '@/components/ui/LoadingSpin/ApproximateSpin.tsx';
import type { UsePercentArgs } from '@/components/ui/LoadingSpin/useApproximatePercent.ts';
import { LoadingWave, type LoadingWaveProps } from '@/components/ui/LoadingWave.tsx';
import { cns } from '@/util/independent/cns.ts';


export type ButtonProps = NUI_ButtonProps & UsePercentArgs & ({
  isApproximate?: undefined;
  loaderProps?: LoadingWaveProps;
} | {
  isApproximate: true;
  loaderProps?: ApproximateSpinProps;
})

export function Button({ isApproximate, isSlow, loaderProps, ...props }: ButtonProps) {
  return (
    <NUI_Button
      spinner={isApproximate ? (
        <ApproximateSpin
          isSlow={isSlow}
          size="sm"
          strokeWidth={3}
          {...loaderProps}
          classNames={cns<ApproximateSpinProps['classNames']>({ svg: 'w-6 h-6 text-foreground' }, loaderProps?.classNames)}
        />
      ) : <LoadingWave size="sm" {...loaderProps} className={cn('text-foreground', loaderProps?.className)} />}
      {...props}
      color={props.isLoading ? 'default' : props.color}
    />
  );
}
