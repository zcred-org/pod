export function go<TErr>() {
  return async <TRes>(
    promise: Promise<TRes>,
  ): Promise<[TRes, undefined] | [undefined, TErr]> => {
    try {
      return [await promise, undefined] as const;
    } catch (err) {
      return [undefined, err as TErr] as const;
    }
  };
}

export async function gopher<TRes, TErr = unknown>(
  func: Promise<TRes>,
): Promise<[TRes, undefined] | [undefined, TErr]> {
  try {
    return [await func, undefined] as const;
  } catch (err) {
    return [undefined, err as TErr] as const;
  }
}
