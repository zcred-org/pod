import { cn } from '@nextui-org/react';
import { Children, isValidElement, cloneElement, type ReactElement } from 'react';
import { StepperStep, type StepperStepProps } from '@/components/ui/Stepper/StepperStep.tsx';
import type { Nillable } from '@/types';


type StepperProps = {
  className?: string,
  children: Nillable<ReactElement<StepperStepProps>>[] | Nillable<ReactElement<StepperStepProps>>,
}

export function Stepper(props: StepperProps) {
  const childrenCount = Children.count(props.children);

  let skipped = 0;
  const childrenWithNumber = Children.map(props.children, (child, index) => {
    if (!child) return void ++skipped;
    const isStepperStep = isValidElement(child) && (child.type as unknown as { name?: string } | undefined)?.name === StepperStep.name;
    if (!isStepperStep) console.error('Stepper children must be Stepper.Step');
    const number = index + 1 - skipped;
    const isFirst = index === 0;
    const isLast = index === childrenCount - 1;
    return isStepperStep
      ? [cloneElement(child, { number, isFirst, isLast }), isLast ? null : midLine]
      : child;
  });

  // grid-cols-[repeat(auto-fit,minmax(0,1fr))]
  // auto-cols-[max-content_1fr]
  // auto-cols-[1fr_2fr]
  // what's better???

  return (
    <div
      className={cn('grid grid-flow-col auto-cols-[1fr_auto] grid-rows-[repeat(3,auto)] justify-between justify-items-center', props.className)}>
      {childrenWithNumber}
    </div>
  );
}

Stepper.Step = StepperStep;

const midLine = (
  <div className={[
    'row-[span_3] relative w-full',
    'before:content-[\'\'] before:absolute before:top-5 sm:before:top-6 before:w-full before:bg-foreground before:-translate-y-1/2 before:h-[3px]',
  ].join(' ')} />
);
