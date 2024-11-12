import { cn, Spinner } from '@nextui-org/react';
import IconErrorSvg from '@/assets/error.svg?react';
import IconOkSvg from '@/assets/ok.svg?react';
import { ApproximateSpin } from '@/components/ui/LoadingSpin/ApproximateSpin.tsx';
import type { UsePercentArgs } from '@/components/ui/LoadingSpin/useApproximatePercent.ts';


export type StepperStepProps = {
  label: string,
  description?: string,
  isError?: boolean,
  isSuccess?: boolean,
  isLoading?: boolean,
  // meta from <Stepper/>:
  number?: number,
  isFirst?: boolean,
  isLast?: boolean,
} & (
  | { isApproximate: boolean } & UsePercentArgs
  | { isApproximate?: undefined } & { [key in keyof UsePercentArgs]: undefined }
  )

export function StepperStep(
  {
    label, description,
    isSuccess, isError, isLoading, isApproximate, isSlow,
    // meta from <Stepper/>:
    number, isFirst, isLast,
  }: StepperStepProps,
) {
  const iconLoadingSize = 'w-10 h-10';
  const iconSize = 'w-10 sm:w-12 h-10 sm:h-12';

  const Icon = () => isSuccess
    ? <IconOkSvg className={iconSize} />
    : isError
      ? <IconErrorSvg className={iconSize} />
      : isLoading
        ? isApproximate
          ? <ApproximateSpin classNames={{ svg: iconLoadingSize }} strokeWidth={2} isSlow={isSlow} />
          : <Spinner classNames={{ wrapper: iconLoadingSize, circle1: 'border-2', circle2: 'border-2' }} />
        : <div className={`flex bg-primary rounded-full text-white text-xl sm:text-3xl justify-center items-center ${iconSize}`}>{number}</div>;

  return (
    <>
      <div className={cn(`flex justify-center w-full relative`, {
        'before:content-[\'\'] before:absolute before:bg-foreground before:top-1/2 before:-translate-y-1/2 before:w-[calc(50%-2rem)] sm:before:w-[calc(50%-3rem)] before:h-[3px] before:left-0 before:rounded-r-full': !isFirst,
        'after:content-[\'\'] after:absolute after:bg-foreground after:top-1/2 after:-translate-y-1/2 after:w-[calc(50%-2rem)] sm:after:w-[calc(50%-3rem)] after:h-[3px] after:right-0 after:rounded-l-full': !isLast,
      })}>
        <Icon />
      </div>
      <div className="min-w-max text-center font-semibold mx-1">{label}</div>
      {description && <div className="min-w-max text-center text-xs text-gray-400 mx-1">{description}</div>}
    </>
  );
}
