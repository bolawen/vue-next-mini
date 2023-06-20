import { hashChanged } from '@vue/shared';
import { Dep, createDep } from './dep';
import { activeEffect, trackEffects, triggerEffects } from './effect';
import { toReactive } from './reactive';

export interface Ref<T = any> {
  value: T;
}

export function ref(value?: any) {
  return createRef(value, false);
}

export function isRef(r: any): r is Ref {
  return !!(r && r.__v_isRef === true);
}

function createRef(rawValue: any, shallow: boolean) {
  if (isRef(rawValue)) {
    return rawValue;
  }
  return new RefImpl(rawValue, shallow);
}

export function trackRefValue(ref) {
  if (activeEffect) {
    trackEffects(ref.dep || (ref.dep = createDep()));
  }
}

export function triggerRefValue(ref) {
  if (ref.dep) {
    triggerEffects(ref.dep);
  }
}

class RefImpl<T> {
  private _value: T;
  private _rawValue: T;
  public dep?: Dep = undefined;
  public readonly __v_isRef = true;
  constructor(value: T, public readonly __v_isShallow: boolean) {
    this._rawValue = value;
    this._value = __v_isShallow ? value : toReactive(value);
  }
  get value() {
    trackRefValue(this);
    return this._value;
  }
  set value(newValue) {
    if (hashChanged(newValue, this._rawValue)) {
      this._rawValue = newValue;
      this._value = toReactive(newValue);
      triggerRefValue(this);
    }
  }
}
