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
