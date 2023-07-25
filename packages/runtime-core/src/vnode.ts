import { isArray, isFunction, isObject, isString } from '@vue/shared';
import { normalizeClass } from 'packages/shared/src/normalizeProp';
import { ShapeFlags } from 'packages/shared/src/shapeFlags';

export const Text = Symbol.for('v-text');
export const Comment = Symbol.for('v-cmt');
export const Fragment = Symbol.for('v-fgt');

export function isVNode(value: any) {
  return value ? value.__v_isVNode === true : false;
}

export function isSameVNodeType(n1, n2) {
  return n1.key === n2.key && n1.type === n2.type;
}

export function createVNode(type, props?, children?) {
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

function createBaseVNode(type, props, children, shapeFlag) {
  const vnode = {
    __v_isVNode: true,
    type,
    props,
    children,
    shapeFlag,
    key: props?.key || null
  };
  normalizeChildren(vnode, children);
  return vnode;
}

export function normalizeVNode(child) {
  if (child == null || typeof child === 'boolean') {
    return createVNode(Comment);
  } else if (isArray(child)) {
    return createVNode(Fragment, null, child.slice());
  } else if (typeof child === 'object') {
    return cloneIfMounted(child);
  } else {
    return createVNode(Text, null, String(child));
  }
}

export function cloneIfMounted(child) {
  return child;
}

export function normalizeChildren(vnode, children) {
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
