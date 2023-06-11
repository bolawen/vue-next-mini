import { mutableHandlers } from './baseHandlers';

export const reactiveMap = new WeakMap<WeakMap<object, any>>();

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
  proxyMap.set(target, proxy);
  return proxy;
}
