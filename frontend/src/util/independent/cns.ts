import { cn } from '@nextui-org/react';
import type { Nillable } from '@/types';


type ClassValue = Parameters<typeof cn>[number]

export function cns<T extends Nillable<Record<string, ClassValue>>>(
  ...inputs: Nillable<Record<keyof T, ClassValue>>[]
): T {
  return (inputs as Required<typeof inputs>).filter(Boolean).reduce<NonNullable<T>>((acc, input) => {
    if (!input) return acc;
    for (const key of Object.keys(input)) {
      acc[key] = cn(acc[key] || '', input[key as keyof typeof input]);
    }
    return acc;
  }, {} as NonNullable<T>);
}
