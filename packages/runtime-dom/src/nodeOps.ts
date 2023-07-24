const doc = (typeof document !== 'undefined' ? document : null) as Document;

export const nodeOps = {
  insert: (child, parent, achor) => {
    parent.insertBefore(child, achor || null);
  },
  createElement: type => {
    const el = doc.createElement(type);
    return el;
  },
  setElementText: (el, text) => {
    el.textContent = text;
  },
  remove: child => {
    const parent = child.parentNode;
    if (parent) {
      parent.removeChild(child);
    }
  },
  createText: text => {
    return doc.createTextNode(text);
  },
  setText: (node, text) => {
    node.nodeValue = text;
  },
  createComment: text => {
    return doc.createComment(text);
  }
};
