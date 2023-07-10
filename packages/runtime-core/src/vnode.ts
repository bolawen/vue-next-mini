import { isArray, isFunction, isString } from '@vue/shared';
import { ShapeFlags } from 'packages/shared/src/shapeFlags';

export interface VNode {
  __v_isVNode: boolean;
  type: any;
  children: any;
  shapeFlag: number;
}

export function isVNode(value: any): value is VNode {
  return value ? value.__v_isVNode === true : false;
}

export function createVNode(
  type: any,
  propsOrChildren?: any,
  children?: any
): VNode {
  const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0;
  return createBaseVNode(type, propsOrChildren, children, shapeFlag);
}

function createBaseVNode(type, props, children, shapeFlag): VNode {
  const vnode = {
    __v_isVNode: true,
    type,
    props,
    children,
    shapeFlag
  } as VNode;
  normalizeChildren(vnode, children);
  return vnode;
}

export function normalizeChildren(vnode: VNode, children: any) {
  let type = 0;
  if (children === null) {
    children = null;
  } else if (isArray(children)) {
  } else if (typeof children === 'object') {
  } else if (isFunction(children)) {
  } else {
    children = String(children);
    type = ShapeFlags.TEXT_CHILDREN;
  }

  vnode.children = children;
  vnode.shapeFlag |= type;
}
