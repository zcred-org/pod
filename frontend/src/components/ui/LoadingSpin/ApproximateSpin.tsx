import { CircularProgress, type CircularProgressProps } from '@nextui-org/react';
import { type UsePercentArgs, useApproximatePercent } from '@/components/ui/LoadingSpin/useApproximatePercent.ts';
import { cns } from '@/util/independent/cns.ts';


export type ApproximateSpinProps = UsePercentArgs & CircularProgressProps & {
  isLabelRight?: boolean;
};

export function ApproximateSpin({ isSlow, classNames, isLabelRight, ...props }: ApproximateSpinProps) {
  const percent = useApproximatePercent({ isSlow });

  return (
    <CircularProgress
      aria-label="Loading..."
      disableAnimation
      classNames={cns<CircularProgressProps['classNames']>({
        svg: {
          'animate-spin animate-duration-[3s]': isSlow,
          'animate-spin': !isSlow,
        },
        base: {
          'flex-row gap-2': isLabelRight,
        },
      }, classNames)}
      value={percent}
      {...props}
    />
  );
}
