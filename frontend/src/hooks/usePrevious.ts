import { useEffect, useRef } from 'react';

export const usePrevious = <T>(value: T, initial?: T): T | undefined => {
  const ref = useRef<T | undefined>(initial);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}
