import { ElementTypes, NodeTypes } from './ast';

export enum TextModes {
  DATA,
  RCDATA,
  RAWTEXT,
  CDATA
}

export enum TagType {
  Start,
  End
}

function createParserContext(content, options?) {
  return {
    source: content
  };
}

export function baseParse(content, options?) {
  const context = createParserContext(content, options);
  return createRoot(parseChildren(context, TextModes.DATA, []));
}

export function createRoot(children) {
  return {
    children,
    loc: {},
    type: NodeTypes.ROOT
  };
}

export function parseChildren(context, mode, ancestors) {
  const nodes = [];
  while (!isEnd(context, mode, ancestors)) {
    const s = context.source;
    let node;
    if (startsWith(s, '{{')) {
      node = parseInterpolation(context);
    } else if (s[0] === '<') {
      if (/[a-z]/i.test(s[1])) {
        node = parseElement(context, ancestors);
      }
    }

    if (!node) {
      node = parseText(context);
    }
    pushNode(nodes, node);
  }
  return nodes;
}

export function isEnd(context, mode, ancestors) {
  const s = context.source;

  switch (mode) {
    case TextModes.DATA:
      if (startsWith(s, '</')) {
        for (let i = ancestors.length - 1; i >= 0; i--) {
          if (startsWithEndTagOpen(s, ancestors[i].tag)) {
            return true;
          }
        }
      }
      break;
  }

  return !s;
}

export function startsWith(source, searchString) {
  return source.startsWith(searchString);
}

export function startsWithEndTagOpen(source, tag) {
  return startsWith(source, '</');
}

export function parseElement(context, ancestors) {
  const element = parseTag(context, TagType.Start);

  ancestors.push(element);
  const children = parseChildren(context, TextModes.DATA, ancestors);
  ancestors.pop();
  element.children = children;

  if (startsWithEndTagOpen(context.source, element.tag)) {
    parseTag(context, TagType.End);
  }

  return element;
}

export function parseInterpolation(context) {
  const [open, close] = ['{{', '}}'];
  advanceBy(context, open.length);

  const closeIndex = context.source.indexOf(close, open.length);
  const preTrimContent = parseTextData(context, closeIndex);
  const content = preTrimContent.trim();
  advanceBy(context, close.length);

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      isStatic: false,
      content
    }
  };
}

export function pushNode(nodes, node) {
  nodes.push(node);
}

export function parseText(context) {
  const endTokens = ['<', '{{'];
  let endIndex = context.source.length;
  for (let i = 0; i < endTokens.length; i++) {
    const index = context.source.indexOf(endTokens[i], 1);
    if (index !== -1 && endIndex > index) {
      endIndex = index;
    }
  }
  const content = parseTextData(context, endIndex);
  return {
    content,
    type: NodeTypes.TEXT
  };
}

export function parseTag(context, type) {
  const match = /^<\/?([a-z][^\r\n\t\f />]*)/i.exec(context.source)!;
  const tag = match[1];

  advanceBy(context, match[0].length);

  // 属性和指令的处理
  advanceSpaces(context);
  let props = parseAttributes(context, type);

  let isSelfClosing = startsWith(context.source, '/>');
  advanceBy(context, isSelfClosing ? 2 : 1);

  return {
    tag,
    props,
    children: [],
    type: NodeTypes.ELEMENT,
    tagType: ElementTypes.ELEMENT
  };
}

export function advanceBy(context, numberOfCharacters) {
  const { source } = context;
  context.source = source.slice(numberOfCharacters);
}

export function parseTextData(context, length) {
  const rawText = context.source.slice(0, length);
  advanceBy(context, length);
  return rawText;
}

export function advanceSpaces(context) {
  const match = /^[\t\r\n\f\s]+/.exec(context.source);
  if (match) {
    advanceBy(context, match[0].length);
  }
}

export function parseAttributes(context, type) {
  const props: any[] = [];
  const attributeNames = new Set();

  while (
    context.source.length > 0 &&
    !startsWith(context.source, '>') &&
    !startsWith(context.source, '/>')
  ) {
    const attr = parseAttribute(context, attributeNames);
    if (type === TagType.Start) {
      props.push(attr);
    }
    advanceSpaces(context);
  }

  return props;
}

export function parseAttribute(context, nameSet) {
  const match = /^[^\t\r\n\f />][^\t\r\n\f />=]*/.exec(context.source)!;
  const name = match[0];
  nameSet.add(name);
  advanceBy(context, name.length);
  let value: any = undefined;
  if (/^[\t\r\n\f ]*=/.test(context.source)) {
    advanceSpaces(context);
    advanceBy(context, 1);
    advanceSpaces(context);
    value = parseAttributeValue(context);
  }
  // v- 指令
  if (/^(v-[A-Za-z0-9-]|:|\.|@|#)/.test(name)) {
    const match =
      /(?:^v-([a-z0-9-]+))?(?:(?::|^\.|^@|^#)(\[[^\]]+\]|[^\.]+))?(.+)?$/i.exec(
        name
      )!;
    let dirName = match[1];
    return {
      type: NodeTypes.DIRECTIVE,
      name: dirName,
      exp: value && {
        type: NodeTypes.SIMPLE_EXPRESSION,
        content: value.content,
        isStatic: false,
        loc: {}
      },
      art: undefined,
      modifiers: undefined
    };
  }

  return {
    type: NodeTypes.ATTRIBUTE,
    name,
    value: value && {
      type: NodeTypes.TEXT,
      content: value.content,
      loc: {}
    },
    loc: {}
  };
}

export function parseAttributeValue(context) {
  let content = '';

  const quote = context.source[0];
  const isQuoted = quote === `"` || quote === `'`;
  if (isQuoted) {
    advanceBy(context, 1);
    const endIndex = context.source.indexOf(quote);
    if (endIndex === -1) {
      content = parseTextData(context, context.source.length);
    } else {
      content = parseTextData(context, endIndex);
      advanceBy(context, 1);
    }
  }

  return {
    content,
    loc: {},
    isQuoted
  };
}
