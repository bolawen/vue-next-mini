import { NodeTypes } from '../ast';
import { isText } from '../utils';

export const transformText = (node, context) => {
  if (
    node.type === NodeTypes.ROOT ||
    node.type === NodeTypes.ELEMENT ||
    node.type === NodeTypes.FOR ||
    node.type === NodeTypes.IF_BRANCH
  ) {
    return () => {
      const children = node.children;
      let currentContainer;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (isText(child)) {
          for (let j = i + 1; j < children.length; j++) {
            const next = children[j];

            if (isText(next)) {
              if (!currentContainer) {
                currentContainer = children[i] = createCompundExpression(
                  [child],
                  child.loc
                );
              }

              currentContainer.children.push(` + `, next);
              children.splice(j, 1);
              j--;
            } else {
              currentContainer = undefined;
              break;
            }
          }
        }
      }
    };
  }
};

function createCompundExpression(arg0: any[], loc: any): any {
  throw new Error('Function not implemented.');
}
