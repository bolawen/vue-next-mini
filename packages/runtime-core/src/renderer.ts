import { ShapeFlags } from 'packages/shared/src/shapeFlags';
import { Fragment, VNode } from './vnode';

export interface RendererNode {
  [key: string]: any;
}

export interface RendererElement extends RendererNode {}

export type RootRenderFunction<HostElement = RendererElement> = (
  vnode: VNode | null,
  container: HostElement
) => void;

export type PatchFunction = (
  n1: VNode | null,
  n2: VNode,
  container: RendererElement,
  anchor?: RendererNode | null
) => void;

export interface RendererOptions<
  HostNode = RendererNode,
  HostElement = RendererElement
> {
  patchProp(
    el: HostElement,
    key: string,
    prevValue: string,
    nextValue: string
  ): void;
  createElement(type: string): HostElement;
  setElementText(node: HostNode, text: string): void;
  insert(el: HostNode, parent: HostElement, anchor?: HostNode | null);
}

export function createRenderer<HostNode, HostElement>(
  options: RendererOptions<HostNode, HostElement>
) {
  return baseCreateRenderer<HostNode, HostElement>(options);
}

export function baseCreateRenderer<HostNode, HostElement>(
  options: RendererOptions<HostNode, HostElement>
) {
  const {
    insert: hostInsert,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    setElementText: hostSetElementText
  } = options;

  const patch: PatchFunction = (n1, n2, container, anchor = null) => {
    if (n1 === n2) {
      return;
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

  const processElement = (
    n1: VNode | null,
    n2: VNode,
    container: RendererElement,
    anchor: RendererNode | null
  ) => {
    if (n1 == null) {
      mountElement(n2, container, anchor);
    } else {
    }
  };

  const mountElement = (
    vnode: VNode,
    container: RendererElement,
    anchor: RendererNode | null
  ) => {
    let el: any;
    const { type, props, shapeFlag } = vnode;
    // 1. 创建 Element
    el = vnode.el = hostCreateElement(type);
    // 2. 设置 Text
    // 3. 设置 Props
    // 4. 插入
  };

  const render: RootRenderFunction = (vnode, container) => {
    if (vnode == null) {
      // 卸载
    } else {
      patch(container.vnode || null, vnode, container);
    }
    container._vnode = vnode;
  };
  return {
    render
  };
}
