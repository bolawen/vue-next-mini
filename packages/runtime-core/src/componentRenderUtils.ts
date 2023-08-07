import { ShapeFlags } from 'packages/shared/src/shapeFlags';
import { normalizeVNode } from './vnode';

export function renderComponentRoot(instance) {
  const { type, vnode, render, data = {} } = instance;
  let result;
  try {
    if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
      result = normalizeVNode(render.call(data, data));
    }
  } catch (error) {
    console.log(error);
  }
  return result;
}
