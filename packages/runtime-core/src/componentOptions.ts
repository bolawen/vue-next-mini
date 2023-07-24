import { isArray, isObject } from '@vue/shared';
import { reactive } from 'vue';
import { onBeforeMount, onMounted } from './apiLifecycle';

export function callHook(hook, proxy) {
  hook.bind(proxy)();
}

export function applyOptions(instance) {
  const {
    data: dataOptions,
    beforeCreate,
    created,
    beforeMount,
    mounted
  } = instance.type;

  if (beforeCreate) {
    callHook(beforeCreate, instance.data);
  }

  if (dataOptions) {
    const data = dataOptions();
    if (isObject(data)) {
      instance.data = reactive(data);
    }
  }

  if (created) {
    callHook(created, instance.data);
  }

  function registerLifecycleHook(register, hook) {
    if (isArray(hook)) {
      hook.forEach(_hook => register(_hook.bind(instance.data), instance));
    } else if (hook) {
      register(hook.bind(instance.data), instance);
    }
  }

  registerLifecycleHook(onBeforeMount, beforeMount);
  registerLifecycleHook(onMounted, mounted);
}
