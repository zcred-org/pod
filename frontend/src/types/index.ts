export type Nillable<T> = T | null | undefined;

export type Result<T, E = Error> =
  // Ok:
  | [value: T]
  | [value: T, error: undefined]
  // Error:
  | [value: undefined, error: E];
