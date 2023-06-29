export function isArray(data: any) {
  return Array.isArray(data);
}

export function isObject(value: unknown) {
  return value !== null && typeof value === 'object';
}

export function hashChanged(value: any, oldValue: any): boolean {
  return !Object.is(value, oldValue);
}

export function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

export const extend = Object.assign;
