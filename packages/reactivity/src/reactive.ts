import { isObject } from '@vue/shared';
import { mutableHandlers } from './baseHandlers';

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive'
}
const reactiveMap = new WeakMap<WeakMap<object, any>>();

export function reactive(target) {
  return createReacttiveObject(target, mutableHandlers, reactiveMap);
}

function createReacttiveObject(
  target: object,
  baseHandlers: ProxyHandler<any>,
  proxyMap: WeakMap<object, any>
) {
  const existingProxy = proxyMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }
  const proxy = new Proxy(target, baseHandlers);
  proxy[ReactiveFlags.IS_REACTIVE] = true;
  proxyMap.set(target, proxy);
  return proxy;
}

export const toReactive = <T extends unknown>(value: T): T => {
  return isObject(value) ? reactive(value as object) : value;
};

export function isReactive(value): boolean {
  return !!(value && value[ReactiveFlags.IS_REACTIVE]);
}
