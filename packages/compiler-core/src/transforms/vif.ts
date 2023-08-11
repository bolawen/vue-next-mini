import { isString } from '@vue/shared';
import {
  NodeTypes,
  createCallExpression,
  createConditionalExpression,
  createObjectExpression,
  createObjectProperty,
  createSimpleExpression
} from '../ast';
import { createStructuralDirectiveTransform } from '../transform';
import { getMemoedVNodeCall, injectProp } from '../utils';
import { CREATE_COMMENT } from '../runtimeHelper';

export const transformIf = createStructuralDirectiveTransform(
  /^(if|else|else-if)$/,
  (node, dir, context) => {
    return processIf(node, dir, context, (ifNode, branch, isRoot) => {
      let key = 0;

      return () => {
        if (isRoot) {
          ifNode.codegenNode = createCodegenNodeForBranch(branch, key, context);
        }
      };
    });
  }
);

export function processIf(node, dir, context, processCodegen) {
  if (dir.name === 'if') {
    const branch = createIfBranch(node, dir);
    const ifNode = {
      type: NodeTypes.IF,
      loc: {},
      branches: [branch]
    };

    context.replaceNode(ifNode);

    if (processCodegen) {
      return processCodegen(ifNode, branch, true);
    }
  }
}

function createIfBranch(node, dir) {
  return {
    type: NodeTypes.IF_BRANCH,
    loc: {},
    condition: dir.exp,
    children: [node]
  };
}

export function createCodegenNodeForBranch(branch, keyIndex, context) {
  if (branch.condition) {
    return createConditionalExpression(
      branch.condition,
      createChildrenCodegenNode(branch, keyIndex),
      createCallExpression(context.helper(CREATE_COMMENT), ['"v-if"', 'true'])
    );
  } else {
    return createChildrenCodegenNode(branch, keyIndex);
  }
}

function createChildrenCodegenNode(branch, keyIndex) {
  const keyProperty = createObjectProperty(
    `key`,
    createSimpleExpression(`${keyIndex}`, false)
  );

  const { children } = branch;
  const firstChild = children[0];
  const ret = firstChild.codegenNode;
  const vnodeCall = getMemoedVNodeCall(ret);

  injectProp(vnodeCall, keyProperty);
  return ret;
}
