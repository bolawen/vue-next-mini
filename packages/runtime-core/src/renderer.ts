import { ShapeFlags } from 'packages/shared/src/shapeFlags';
import { Fragment, isSameVNodeType, normalizeVNode } from './vnode';
import { EMPTY_OBJ, isString } from '@vue/shared';
import { Text, Comment } from './vnode';
import { createComponentInstance, setupComponent } from './component';
import { ReactiveEffect } from 'packages/reactivity/src/effect';
import { queueJob } from './scheduler';
import { renderComponentRoot } from './componentRenderUtils';

export function createRenderer(options) {
  return baseCreateRenderer(options);
}

export function baseCreateRenderer(options) {
  const {
    insert: hostInsert,
    remove: hostRemove,
    setText: hostSetText,
    patchProp: hostPatchProp,
    createText: hostCreateText,
    createComment: hostCreateComment,
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
        processText(n1, n2, container, anchor);
        break;
      case Comment:
        processCommentNode(n1, n2, container, anchor);
        break;
      case Fragment:
        processFragment(n1, n2, container, anchor);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, anchor);
        } else if (shapeFlag & ShapeFlags.COMPONENT) {
          processComponent(n1, n2, container, anchor);
        }
    }
  };

  const processText = (n1, n2, container, anchor) => {
    if (n1 == null) {
      n2.el = hostCreateText(n2.children);
      hostInsert(n2.el, container, anchor);
    } else {
      const el = (n2.el = n1.el);
      if (n2.children !== n1.children) {
        hostSetText(el, n2.children);
      }
    }
  };

  const processCommentNode = (n1, n2, container, anchor) => {
    if (n1 == null) {
      n2.el = hostCreateComment(n2.children);
      hostInsert(n2.el, container, anchor);
    } else {
      n2.el = n1.el;
    }
  };

  const processFragment = (n1, n2, container, anchor) => {
    if (n1 == null) {
      mountChildren(n2.children, container, anchor);
    } else {
      patchChildren(n1, n2, container, anchor);
    }
  };

  const processElement = (n1, n2, container, anchor) => {
    if (n1 == null) {
      mountElement(n2, container, anchor);
    } else {
      patchElement(n1, n2);
    }
  };

  const processComponent = (n1, n2, container, anchor) => {
    if (n1 == null) {
      if (n2.shapeFlag & ShapeFlags.COMPONENT_KEPT_ALIVE) {
      } else {
        mountComponent(n2, container, anchor);
      }
    } else {
      updateComponent(n1, n2);
    }
  };

  const mountComponent = (initialVNode, container, anchor) => {
    const componentMountInstance = initialVNode.component;
    const instance =
      componentMountInstance ||
      (initialVNode.component = createComponentInstance(initialVNode));

    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container, anchor);
  };

  const updateComponent = (n1, n2) => {};

  const setupRenderEffect = (instance, initialValue, container, anchor) => {
    const componentUpdateFn = () => {
      if (!instance.isMounted) {
        const { bm, m } = instance;
        if (bm) {
          bm();
        }
        const subTree = (instance.subTree = renderComponentRoot(instance));
        patch(null, subTree, container, anchor);
        initialValue.el = subTree.el;
        if (m) {
          m();
        }
        instance.isMounted = true;
      } else {
        let { next, vnode } = instance;
        if (!next) {
          next = vnode;
        }
        const nextTree = renderComponentRoot(instance);
        const prevTree = instance.subTree;
        instance.subTree = nextTree;
        patch(prevTree, nextTree, container, anchor);
        next.el = nextTree.el;
      }
    };

    const effect = (instance.effect = new ReactiveEffect(
      componentUpdateFn,
      () => {
        queueJob(update);
      }
    ));

    const update = (instance.update = () => effect.run());

    update();
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
      mountChildren(vnode.children, el, anchor);
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

  const mountChildren = (children, container, anchor) => {
    if (isString(children)) {
      children = children.split('');
    }
    for (let i = 0; i < children.length; i++) {
      const child = (children[i] = normalizeVNode(children[i]));
      patch(null, child, container, anchor);
    }
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
          patchKeyedChildren(c1, c2, container, anchor);
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

  const patchKeyedChildren = (c1, c2, container, parentAnchor) => {
    let i = 0;
    let l2 = c2.length;
    let e1 = c1.length - 1;
    let e2 = l2 - 1;
    // 1. 从左往右遍历 [a,b,c] => [a,b,d,e]
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = (c2[i] = normalizeVNode(c2[i]));
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, null);
      } else {
        break;
      }
      i++;
    }
    // 2. 从右往左遍历
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = (c2[e2] = normalizeVNode(c2[e2]));
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, null);
      } else {
        break;
      }
      e1--;
      e2--;
    }
    // 3. 新节点多于旧节点时, 挂载新节点
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor;
        while (i <= e2) {
          patch(null, (c2[i] = normalizeVNode(c2[i])), container, anchor);
          i++;
        }
      }
    }
    // 4. 旧节点多语新节点时, 卸载旧节点
    else if (i > e2) {
      while (i <= e1) {
        unmount(c1[i]);
        i++;
      }
    }
    // 5. 乱序
    else {
      const s1 = i;
      const s2 = i;

      // 5.1 为**剩余新节点**构建`key (新节点的 key):index (新节点的索引)`的`Map` => `keyToNewIndexMap`
      const keyToNewIndexMap: Map<string | number | symbol, number> = new Map();
      for (i = s2; i <= e2; i++) {
        const nextChild = (c2[i] = normalizeVNode(c2[i]));
        if (nextChild.key != null) {
          keyToNewIndexMap.set(nextChild.key, i);
        }
      }

      // 5.2 循环遍历剩下的旧节点,尝试修补匹配节点并删除不存在的节点, 记录需要匹配的节点数和已匹配的节点数, 创建一个需要匹配节点数长度的数组 `newIndexToOldIndexMap`, 初始化每个数组的下标的默认值为 `0`
      let j;
      let patched = 0;
      const toBePatched = e2 - s2 + 1;
      let moved = false;
      let maxNewIndexSoFar = 0;
      const newIndexToOldIndexMap = new Array(toBePatched);
      for (i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0;

      for (i = s1; i <= e1; i++) {
        const prevChild = c1[i];
        if (patched >= toBePatched) {
          unmount(prevChild);
          continue;
        }
        let newIndex;
        if (prevChild.key != null) {
          newIndex = keyToNewIndexMap.get(prevChild.key);
        } else {
          for (j = s2; j <= e2; j++) {
            if (
              newIndexToOldIndexMap[j - s2] === 0 &&
              isSameVNodeType(prevChild, c2[j])
            ) {
              newIndex = j;
              break;
            }
          }
        }
        if (newIndex === undefined) {
          unmount(prevChild);
        } else {
          newIndexToOldIndexMap[newIndex - s2] = i + 1;
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex;
          } else {
            moved = true;
          }
          patch(prevChild, c2[newIndex], container, null);
          patched++;
        }
      }

      // 5.3 剩余旧节点遍历完毕后, 移动和挂载新节点
      const increasingNewIndexSequence = moved
        ? getSequence(newIndexToOldIndexMap)
        : [];
      j = increasingNewIndexSequence.length - 1;
      for (i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = s2 + i;
        const nextChild = c2[nextIndex];
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : parentAnchor;
        if (newIndexToOldIndexMap[i] === 0) {
          patch(null, nextChild, container, anchor);
        } else if (moved) {
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            move(nextChild, container, anchor);
          } else {
            j--;
          }
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

  const move = (vnode, container, anchor) => {
    const { el } = vnode;
    hostInsert(el, container, anchor);
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

function getSequence(nums) {
  let len = 1;
  const { length } = nums;
  const d = new Array(nums.length + 1);
  d[len] = 0;
  for (let i = 1; i < length; i++) {
    const num = nums[i];
    if (nums[d[len]] < num) {
      d[++len] = i;
    } else {
      let left = 1;
      let right = len;
      let pos = 0;
      while (left <= right) {
        let middle = (left + right) >> 1;
        if (nums[d[middle]] < num) {
          pos = middle;
          left = middle + 1;
        } else {
          right = middle - 1;
        }
      }
      d[pos + 1] = i;
    }
  }
  return d.filter(i => i != null);
}
