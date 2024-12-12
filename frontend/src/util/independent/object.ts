import { transform } from 'lodash-es';


export function objectFlat(obj: object, parentKey = '', result = {}): object {
  return transform(obj, (res, value, key) => {
    const newKey = parentKey ? `${parentKey}.${key}` : key;
    if (typeof value === 'object' && !Array.isArray(value)) {
      objectFlat(value, newKey as never, res);
    } else {
      res[newKey as never] = value as never;
    }
  }, result);
}

export async function objectPromiseAll<T extends { [key: string]: Promise<unknown> }>(obj: T): Promise<{ [K in keyof T]: Awaited<T[K]> }> {
  const keyValueList = Object.entries(obj).map(([key, promise]) => promise.then(value => [key, value]));
  const awaitedList = await Promise.all(keyValueList);
  return Object.fromEntries(awaitedList);
}
