import { isString } from '@vue/shared';
import { NodeTypes, createObjectExpression } from './ast';

export function isText(node) {
  return node.type === NodeTypes.INTERPOLATION || node.type === NodeTypes.TEXT;
}

export function injectProp(node, prop) {
  let propsWithInjection;
  let props =
    node.type === NodeTypes.VNODE_CALL ? node.props : node.arguments[2];
  if (props === null || isString(props)) {
    propsWithInjection = createObjectExpression([prop]);
  }
  node.props = propsWithInjection;
}

export function getMemoedVNodeCall(node) {
  return node;
}
