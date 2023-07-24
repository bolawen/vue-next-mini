import { LifecycleHooks } from './enums';

export function injectHook(type, hook, target) {
  if (target) {
    target[type] = hook;
    return hook;
  }
}

export const createHook = lifecycle => {
  return (hook, target) => injectHook(lifecycle, hook, target);
};

export const onBeforeMount = createHook(LifecycleHooks.BEFORE_MOUNT);
export const onMounted = createHook(LifecycleHooks.MOUNTED);
