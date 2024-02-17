import { generateColor, generateSecondaryColor } from '@marko19907/string-to-color';
import { useMemo } from 'react';

export const useColored = (input: string | undefined) => {
  const color = useMemo(() => generateColor(input || ''), [input]);
  const secondaryColor = useMemo(() => generateSecondaryColor(input || ''), [input]);
  return [color, secondaryColor] as const;
};
