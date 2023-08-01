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
      // 插值
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

export function startsWith(source, searchStaring) {
  return source.startsWith(searchStaring);
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

  let isSelfClosing = startsWith(context.source, '/>');
  advanceBy(context, isSelfClosing ? 2 : 1);

  return {
    tag,
    props: [],
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
