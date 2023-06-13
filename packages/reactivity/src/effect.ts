import { Dep, createDep } from './dep';

type KeyToDepMap = Map<any, Dep>;
const targetMap = new WeakMap<any, KeyToDepMap>();

export let activeEffect: ReactiveEffect | undefined;

export class ReactiveEffect<T = any> {
  fn: () => T;
  constructor(fn: () => T) {
    this.fn = fn;
  }
  run() {
    activeEffect = this;
    return this.fn();
  }
}

export function trackEffects(dep: Dep) {
  dep.add(activeEffect as ReactiveEffect);
  console.log(targetMap);
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
  effect.run();
}

export function triggerEffects(deps: Dep) {
  const effects = Array.isArray(deps) ? deps : [...deps];
  for (const effect of effects) {
    triggerEffect(effect);
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

export function effect<T = any>(fn: () => T) {
  const _effect = new ReactiveEffect(fn);
  _effect.run();
}
