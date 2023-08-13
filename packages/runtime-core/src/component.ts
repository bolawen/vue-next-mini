import { ShapeFlags } from 'packages/shared/src/shapeFlags';
import { applyOptions } from './componentOptions';
import { isFunction } from '@vue/shared';

let uid = 0;
let compile;

export function createComponentInstance(vnode) {
  const type = vnode.type;
  const instance = {
    uid: uid++,
    type,
    vnode,
    effect: null,
    render: null,
    update: null,
    subTree: null,

    // lifecycle hooks
    isMounted: false,
    isUnmounted: false,
    isDeactivated: false,
    bc: null,
    c: null,
    bm: null,
    m: null,
    bu: null,
    u: null,
    um: null,
    bum: null,
    da: null,
    a: null,
    rtg: null,
    rtc: null,
    ec: null,
    sp: null
  };
  return instance;
}

export function setupComponent(instance) {
  const isStateful = isStatefulComponent(instance);
  const setupResult = isStateful ? setupStatefulComponent(instance) : undefined;
  return setupResult;
}

export function isStatefulComponent(instance) {
  return instance.vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT;
}

export function setupStatefulComponent(instance) {
  const Component = instance.type;
  const { setup } = Component;
  if (setup) {
    const setupResult = setup();
    handleSetupResult(instance, setupResult);
  } else {
    finishComponentSetup(instance);
  }
}

export function handleSetupResult(instance, setupResult) {
  if (isFunction(setupResult)) {
    instance.render = setupResult;
  }

  finishComponentSetup(instance);
}

export function finishComponentSetup(instance) {
  const Component = instance.type;
  if (!instance.render) {
    if (compile && !Component.render) {
      if (Component.template) {
        const template = Component.template;
        Component.render = compile(template);
      }
    }
    instance.render = Component.render;
  }
  applyOptions(instance);
}

export function registerRuntimeCompiler(_compile) {
  compile = _compile;
}
