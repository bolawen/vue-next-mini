import { RendererOptions } from 'vue';

const doc = (typeof document !== 'undefined' ? document : null) as Document;

export const nodeOps: Omit<RendererOptions<Node, Element>, 'patchProp'> = {
  insert: (child, parent, achor) => {
    parent.insertBefore(child, achor || null);
  },
  createElement: type => {
    const el = doc.createElement(type);
    return el;
  },
  setElementText: (el, text) => {
    el.textContent = text;
  }
};
