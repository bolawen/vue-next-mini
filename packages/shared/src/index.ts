export { toDisplayString } from './toDisplayString';

export const EMPTY_OBJ = {};
export const EMPTY_ARR = [];

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

export const isString = (value: any): value is string =>
  typeof value === 'string';

const onReg = /^on[^a-z]/;

export const isOn = (key: string) => onReg.test(key);
