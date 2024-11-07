export function JSONSafeParse<T>(str: string): [T, undefined] | [undefined, Error] {
  try {
    return [JSON.parse(str), undefined];
  } catch (err) {
    return [undefined, err as Error];
  }
}
