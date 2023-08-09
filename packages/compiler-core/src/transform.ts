import { isString } from '@vue/shared';
import { NodeTypes } from './ast';
import { TO_DISPLAY_STRING } from './runtimeHelper';
import { isSingleElementRoot } from './transforms/hoistStatic';

export function transform(root, options) {
  const context = createTransformContext(root, options);
  traverseNode(root, context);

  createRootCodegen(root);

  root.helpers = [...context.helpers.keys()];
  root.components = [];
  root.directives = [];
  root.imports = [];
  root.hoists = [];
  root.temps = [];
  root.cached = [];
}

export function createTransformContext(root, { nodeTransforms }) {
  const context: { [key: string]: any } = {
    nodeTransforms,
    root,
    helpers: new Map(),
    currentNode: root,
    parent: null,
    childIndex: 0,
    helper(name) {
      const count = context.helpers.get(name) || 0;
      context.helpers.set(name, count + 1);
      return name;
    },
    replaceNode(node) {
      context.parent.children[context.childIndex] = context.currentNode = node;
    }
  };

  return context;
}

export function traverseNode(node, context) {
  context.currentNode = node;
  const { nodeTransforms } = context;
  const exitFns: any[] = [];

  for (let i = 0; i < nodeTransforms.length; i++) {
    const onExit = nodeTransforms[i](node, context);
    if (onExit) {
      exitFns.push(onExit);
    }
  }

  switch (node.type) {
    case NodeTypes.ELEMENT:
    case NodeTypes.ROOT:
      traverseChildren(node, context);
      break;
    case NodeTypes.INTERPOLATION:
      context.helper(TO_DISPLAY_STRING);
      break;
  }

  context.currentNode = node;

  let i = exitFns.length;
  while (i--) {
    exitFns[i]();
  }
}

export function traverseChildren(parent, context) {
  parent.children.forEach((node, index) => {
    context.parent = parent;
    context.childIndex = index;
    traverseNode(node, context);
  });
}

export function createRootCodegen(root) {
  const { children } = root;

  if (children.length === 1) {
    const child = children[0];
    if (isSingleElementRoot(root, child)) {
      root.codegenNode = child.codegenNode;
    }
  }
}

export function createStructuralDirectiveTransform(name, fn) {
  const matches = isString(name) ? n => n === name : n => name.test(n);
  return (node, context) => {
    if (node.type === NodeTypes.ELEMENT) {
      const { props } = node;
      const exitFns: any[] = [];
      for (let i = 0; i < props.length; i++) {
        const prop = props[i];
        if (prop.type === NodeTypes.DIRECTIVE && matches(prop.name)) {
          props.splice(i, 1);
          i--;
          const onExit = fn(node, prop, context);
          if (onExit) {
            exitFns.push(onExit);
          }
        }
      }
      return exitFns;
    }
  };
}
