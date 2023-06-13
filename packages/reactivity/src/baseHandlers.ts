import { track, trigger } from './effect';

function createGetter() {
  return function get(target: object, key: string | symbol, reaceiver: object) {
    const result = Reflect.get(target, key, reaceiver);
    track(target, key);
    return result;
  };
}

function createSetter() {
  return function set(
    target: object,
    key: string | symbol,
    value: any,
    receiver: object
  ) {
    const result = Reflect.set(target, key, value, receiver);
    trigger(target, key, value);
    return result;
  };
}

const get = createGetter();
const set = createSetter();

export const mutableHandlers: ProxyHandler<object> = {
  get,
  set
};
