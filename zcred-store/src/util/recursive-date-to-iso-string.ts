type RecursiveDateToISOString<T> = T extends Date ? string
  : T extends object ? { [K in keyof T]: RecursiveDateToISOString<T[K]> }
    : T;

export function recursiveDateToISOString<T>(value: T): RecursiveDateToISOString<T> {
  if (value instanceof Date) {
    return value.toISOString() as never;
  } else if (typeof value === 'object' && value !== null) {
    if (Array.isArray(value)) {
      return value.map(recursiveDateToISOString) as never;
    } else {
      return Object.fromEntries(
        Object.entries(value as Record<string, unknown>)
          .map(([key, val]) => [key, recursiveDateToISOString(val)]),
      ) as never;
    }
  } else {
    return value as never;
  }
}
