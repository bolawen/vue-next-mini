import { queueJob } from './scheduler';
import { isRef } from 'packages/reactivity/src/ref';
import { isReactive } from 'packages/reactivity/src/reactive';
import { hashChanged, isFunction, isObject } from '@vue/shared';

import {
  EffectScheduler,
  ReactiveEffect
} from 'packages/reactivity/src/effect';

export type WatchOptions<immediate = boolean> = {
  deep?: boolean;
  immediate?: immediate;
  flush?: 'pre' | 'post' | 'sync';
};

export function watch(source, cb: Function, options?: WatchOptions) {
  return doWatch(source, cb, options);
}

function doWatch(
  source,
  cb: Function,
  { deep, flush, immediate }: WatchOptions = {}
) {
  let getter: () => any;

  if (isReactive(source)) {
    getter = () => source;
    deep = true;
  } else if (isFunction(source)) {
    getter = () => source();
  } else {
    getter = () => {};
  }

  if (cb && deep) {
    const baseGetter = getter;
    getter = () => traverse(baseGetter());
  }

  let oldValue = {};

  const job = () => {
    if (cb) {
      const newValue = effect.run();
      if (deep || hashChanged(newValue, oldValue)) {
        cb(newValue, oldValue);
        oldValue = newValue;
      }
    }
  };

  let scheduler: EffectScheduler;

  if (flush === 'sync') {
    scheduler = job as any;
  } else if (flush === 'post') {
    scheduler = job;
  } else {
    scheduler = () => queueJob(job);
  }

  const effect = new ReactiveEffect(getter, scheduler);

  if (cb) {
    if (immediate) {
      job();
    } else {
      oldValue = effect.run();
    }
  } else {
    effect.run();
  }

  const unWatch = () => {
    effect.stop();
  };

  return unWatch;
}

export function traverse(value: any, seen?: Set<any>) {
  if (!isObject(value)) {
    return value;
  }
  seen = seen || new Set();
  if (seen.has(value)) {
    return value;
  }
  seen.add(value);
  if (isRef(value)) {
    traverse(value.value, seen);
  } else if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      traverse(value[i], seen);
    }
  }
  for (const key in value) {
    traverse(value[key], seen);
  }
  return value;
}
