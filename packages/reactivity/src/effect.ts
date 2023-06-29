import { extend } from '@vue/shared';
import { ComputeRefImpl } from './computed';
import { Dep, createDep } from './dep';

type KeyToDepMap = Map<any, Dep>;
const targetMap = new WeakMap<any, KeyToDepMap>();
export let activeEffect: ReactiveEffect | undefined;
export type EffectScheduler = (...args: any[]) => any;
export interface ReactiveEffectOptions {
  lazy?: boolean;
  scheduler?: EffectScheduler;
}

export class ReactiveEffect<T = any> {
  computed?: ComputeRefImpl<T>;

  constructor(
    public fn: () => T,
    public scheduler: EffectScheduler | null = null
  ) {
    this.fn = fn;
  }
  run() {
    activeEffect = this;
    return this.fn();
  }
  stop() {}
}

export function trackEffects(dep: Dep) {
  dep.add(activeEffect as ReactiveEffect);
}

export function track(target: object, key: any) {
  if (!activeEffect) {
    return;
  }
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }

  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = createDep()));
  }
  trackEffects(dep);
}

export function triggerEffect(effect: ReactiveEffect) {
  if (effect.scheduler) {
    effect.scheduler();
  } else {
    effect.run();
  }
}

export function triggerEffects(deps: Dep) {
  const effects = Array.isArray(deps) ? deps : [...deps];
  for (const effect of effects) {
    if (effect.computed) {
      triggerEffect(effect);
    }
  }
  for (const effect of effects) {
    if (!effect.computed) {
      triggerEffect(effect);
    }
  }
}

export function trigger(target: object, key: any, value: any) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  const deps: Dep | undefined = depsMap.get(key) as Dep;
  if (!deps) {
    return;
  }
  triggerEffects(deps);
}

export function effect<T = any>(fn: () => T, options?: ReactiveEffectOptions) {
  const _effect = new ReactiveEffect(fn);

  if (options) {
    extend(_effect, options);
  }

  if (!options || !options.lazy) {
    _effect.run();
  }
}
