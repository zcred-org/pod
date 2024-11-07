export function tryToLocalDateTime<T>(something: T): T | string {
  const isIso = isISOString(something);
  const date = isIso ? new Date(something) : null;
  const isHasTime = date && date.getHours() && date.getMinutes() && date.getSeconds() && date.getMilliseconds();
  return date ? (isHasTime ? date.toLocaleString() : date.toLocaleDateString()) : something;
}

export function isISOString(str: unknown): str is string {
  try {
    return typeof str === 'string' && new Date(str).toISOString() === str;
  } catch {
    return false;
  }
}
