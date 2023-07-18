import { ShapeFlags } from 'packages/shared/src/shapeFlags';
import { Fragment, isSameVNodeType } from './vnode';
import { EMPTY_OBJ } from '@vue/shared';

export function createRenderer(options) {
  return baseCreateRenderer(options);
}

export function baseCreateRenderer(options) {
  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    setElementText: hostSetElementText
  } = options;

  const patch = (n1, n2, container, anchor = null) => {
    if (n1 === n2) {
      return;
    }

    if (n1 && !isSameVNodeType(n1, n2)) {
      unmount(n1);
      n1 = null;
    }

    const { type, shapeFlag } = n2;

    switch (type) {
      case Text:
        break;
      case Comment:
        break;
      case Fragment:
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, anchor);
        } else if (shapeFlag & ShapeFlags.COMPONENT) {
        }
    }
  };

  const processElement = (n1, n2, container, anchor) => {
    if (n1 == null) {
      mountElement(n2, container, anchor);
    } else {
      patchElement(n1, n2);
    }
  };

  const mountElement = (vnode, container, anchor) => {
    let el;
    const { type, props, shapeFlag } = vnode;
    // 1. 创建 Element
    el = vnode.el = hostCreateElement(type);
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 2. 设置 Text
      hostSetElementText(el, vnode.children);
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    }
    if (props) {
      // 3. 设置 Props
      for (const key in props) {
        hostPatchProp(el, key, null, props[key]);
      }
    }
    // 4. 插入
    hostInsert(el, container, anchor);
  };

  const patchElement = (n1, n2) => {
    const el = (n2.el = n1.el!);
    const oldProps = n1.props || EMPTY_OBJ;
    const newProps = n2.props || EMPTY_OBJ;
    patchChildren(n1, n2, el, null);
    patchProps(el, n2, oldProps, newProps);
  };

  const patchChildren = (n1, n2, container, anchor) => {
    const c1 = n1 && n1.children;
    const prevShapFlag = n1 ? n1.shapeFlag : 0;
    const c2 = n2 && n2.children;
    const { shapeFlag } = n2;

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 新节点为文本节点
      if (prevShapFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 新节点为文本节点 && 旧节点为数组  则卸载旧子节点
      }

      if (c2 !== c1) {
        // 挂载新子节点文本
        hostSetElementText(container, c2);
      }
    } else {
      // 新节点不为文本节点
      if (prevShapFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 新节点不为文本节点 && 旧节点为数组节点
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // 新节点为数组节点 && 旧节点为数组节点 则 Diff 运算
        } else {
          // 新节点为数组节点 & 旧节点不为数组节点 则卸载旧子节点
        }
      } else {
        if (prevShapFlag & ShapeFlags.TEXT_CHILDREN) {
          // 新节点不为文本节点 && 旧节点为文本节点 则下载旧子节点
          hostSetElementText(container, '');
        }
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        }
      }
    }
  };

  const patchProps = (el, vnode, oldProps, newProps) => {
    if (oldProps !== newProps) {
      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          if (!(key in newProps)) {
            hostPatchProp(el, key, oldProps[key], null);
          }
        }
      }
      for (const key in newProps) {
        const next = newProps[key];
        const prev = oldProps[key];
        if (next !== prev) {
          hostPatchProp(el, key, prev, next);
        }
      }
    }
  };

  const unmount = vnode => {
    hostRemove(vnode.el as Node);
  };

  const render = (vnode, container) => {
    if (vnode == null) {
      if (container._vnode) {
        unmount(container._vnode);
      }
    } else {
      patch(container._vnode || null, vnode, container);
    }
    container._vnode = vnode;
  };
  return {
    render
  };
}
