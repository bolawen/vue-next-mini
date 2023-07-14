import { isArray, isFunction, isObject, isString } from '@vue/shared';
import { normalizeClass } from 'packages/shared/src/normalizeProp';
import { ShapeFlags } from 'packages/shared/src/shapeFlags';
import { RendererElement, RendererNode } from './renderer';

export const Text = Symbol.for('v-text');
export const Comment = Symbol.for('v-cmt');
export const Fragment = Symbol.for('v-fgt');

export interface VNode<HostNode = RendererNode, HostElement = RendererElement> {
  __v_isVNode: boolean;
  type: any;
  props: any;
  children: any;
  shapeFlag: number;
  el: HostNode | null;
  target: HostElement | null;
}

export function isVNode(value: any): value is VNode {
  return value ? value.__v_isVNode === true : false;
}

export function createVNode(type: any, props?: any, children?: any): VNode {
  if (props) {
    let { class: klass, style } = props;
    if (klass && !isString(klass)) {
      props.class = normalizeClass(klass);
    }
  }

  const shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    : isObject(type)
    ? ShapeFlags.STATEFUL_COMPONENT
    : 0;
  return createBaseVNode(type, props, children, shapeFlag);
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
  if (children == null) {
    children = null;
  } else if (isArray(children)) {
    type = ShapeFlags.ARRAY_CHILDREN;
  } else if (typeof children === 'object') {
  } else if (isFunction(children)) {
  } else {
    children = String(children);
    type = ShapeFlags.TEXT_CHILDREN;
  }

  vnode.children = children;
  vnode.shapeFlag |= type;
}
