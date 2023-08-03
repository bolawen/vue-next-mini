import { isArray, isString } from '@vue/shared';
import { NodeTypes, getVNodeHelper } from './ast';
import { helperNameMap } from './runtimeHelper';

const aliasHelper = s => `${helperNameMap[s]}: _${helperNameMap[s]}`;

function createCodegenContext(ast) {
  const context = {
    code: '',
    runtimeGlobalName: 'Vue',
    source: ast.loc.source,
    indentLevel: 0,
    isSSR: false,
    helper(key) {
      return `_${helperNameMap[key]}`;
    },
    push(code) {
      context.code += code;
    },
    newline() {
      newline(context.indentLevel);
    },
    indent() {
      newline(++context.indentLevel);
    },
    deindent() {
      newline(--context.indentLevel);
    }
  };

  function newline(n) {
    context.code += '\n' + ` `.repeat(n);
  }

  return context;
}

export function generate(ast, options?) {
  const context = createCodegenContext(ast) as any;

  const { push, newline, indent, deindent } = context;

  genFunctionPreamble(context);

  const functionName = `render`;
  const args = ['_ctx', '_cache'];
  const signature = args.join(', ');
  push(`function ${functionName}(${signature}) {`);
  indent();

  const hasHelpers = ast.helpers.length > 0;
  if (hasHelpers) {
    push(`const { ${ast.helpers.map(aliasHelper).join(', ')} } = _Vue`);
    push('\n');
    newline();
  }

  newline();
  push(`return `);
  if (ast.codegenNode) {
    genNode(ast.codegenNode, context);
  } else {
    push(`null`);
  }

  deindent();
  push('}');

  return {
    ast,
    code: context.code
  };
}

function genFunctionPreamble(context) {
  const { push, newline, runtimeGlobalName } = context;
  const VueBinding = runtimeGlobalName;
  push(`const _Vue = ${VueBinding} \n`);
  newline();
  push(`return `);
}

function genNode(node, context) {
  switch (node.type) {
    case NodeTypes.VNODE_CALL:
      genVNodeCall(node, context);
      break;
    case NodeTypes.TEXT:
      genText(node, context);
      break;
  }
}

function genVNodeCall(node, context) {
  const { push, helper } = context;
  const {
    tag,
    props,
    children,
    patchFlag,
    dynamicProps,
    direcctives,
    isBlock,
    disableTracking,
    isComponent
  } = node;

  const callHelper = getVNodeHelper(context.isSSR, isComponent);
  push(helper(callHelper) + `(`);
  const args = genNullableArgs([tag, props, children, patchFlag, dynamicProps]);
  genNodeList(args, context);
  push(')');
}

function genText(node, context) {
  context.push(JSON.stringify(node.content));
}

function genNullableArgs(args) {
  let i = args.length;
  while (i--) {
    if (args[i] != null) {
      break;
    }
  }

  return args.slice(0, i + 1).map(arg => arg || 'null');
}

function genNodeList(nodes, context) {
  const { push } = context;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    if (isString(node)) {
      push(node);
    } else if (isArray(node)) {
      genNodeListArray(node, context);
    } else {
      genNode(node, context);
    }

    if (i < nodes.length - 1) {
      push(`, `);
    }
  }
}

function genNodeListArray(nodes, context) {
  context.push('[');
  genNodeList(nodes, context);
  context.push(']');
}
