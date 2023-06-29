import { Dep } from './dep';
import { isFunction } from '@vue/shared';
import { ReactiveEffect } from './effect';
import { trackRefValue, triggerRefValue } from './ref';

export class ComputeRefImpl<T> {
  private _value!: T;
  public _dirty = true;
  public dep?: Dep = undefined;
  public readonly __v_isRef = true;
  public readonly effect: ReactiveEffect<T>;

  constructor(getter) {
    this.effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true;
        triggerRefValue(this);
      }
    });
    this.effect.computed = this;
  }

  get value() {
    trackRefValue(this);
    if (this._dirty) {
      this._dirty = false;
      this._value = this.effect.run();
    }
    return this._value;
  }

  set value(newValue: T) {}
}

export function computed(getterOrOptions) {
  let getter;
  const onlyGetter = isFunction(getterOrOptions);
  if (onlyGetter) {
    getter = getterOrOptions;
  }
  const cRef = new ComputeRefImpl(getter);
  return cRef;
}
