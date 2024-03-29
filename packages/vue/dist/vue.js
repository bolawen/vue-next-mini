var toDisplayString = function (val) {
    return String(val);
};

var EMPTY_OBJ = {};
var EMPTY_ARR = [];
function isArray(data) {
    return Array.isArray(data);
}
function isObject(value) {
    return value !== null && typeof value === 'object';
}
function hashChanged(value, oldValue) {
    return !Object.is(value, oldValue);
}
function isFunction(value) {
    return typeof value === 'function';
}
var extend = Object.assign;
var isString = function (value) {
    return typeof value === 'string';
};
var onReg = /^on[^a-z]/;
var isOn = function (key) { return onReg.test(key); };

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */


function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}

var TextModes;
(function (TextModes) {
    TextModes[TextModes["DATA"] = 0] = "DATA";
    TextModes[TextModes["RCDATA"] = 1] = "RCDATA";
    TextModes[TextModes["RAWTEXT"] = 2] = "RAWTEXT";
    TextModes[TextModes["CDATA"] = 3] = "CDATA";
})(TextModes || (TextModes = {}));
var TagType;
(function (TagType) {
    TagType[TagType["Start"] = 0] = "Start";
    TagType[TagType["End"] = 1] = "End";
})(TagType || (TagType = {}));
function createParserContext(content, options) {
    return {
        source: content
    };
}
function baseParse(content, options) {
    var context = createParserContext(content);
    return createRoot(parseChildren(context, TextModes.DATA, []));
}
function createRoot(children) {
    return {
        children: children,
        loc: {},
        type: 0 /* NodeTypes.ROOT */
    };
}
function parseChildren(context, mode, ancestors) {
    var nodes = [];
    while (!isEnd(context, mode, ancestors)) {
        var s = context.source;
        var node = void 0;
        if (startsWith(s, '{{')) {
            node = parseInterpolation(context);
        }
        else if (s[0] === '<') {
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
function isEnd(context, mode, ancestors) {
    var s = context.source;
    switch (mode) {
        case TextModes.DATA:
            if (startsWith(s, '</')) {
                for (var i = ancestors.length - 1; i >= 0; i--) {
                    if (startsWithEndTagOpen(s, ancestors[i].tag)) {
                        return true;
                    }
                }
            }
            break;
    }
    return !s;
}
function startsWith(source, searchString) {
    return source.startsWith(searchString);
}
function startsWithEndTagOpen(source, tag) {
    return startsWith(source, '</');
}
function parseElement(context, ancestors) {
    var element = parseTag(context, TagType.Start);
    ancestors.push(element);
    var children = parseChildren(context, TextModes.DATA, ancestors);
    ancestors.pop();
    element.children = children;
    if (startsWithEndTagOpen(context.source, element.tag)) {
        parseTag(context, TagType.End);
    }
    return element;
}
function parseInterpolation(context) {
    var _a = __read(['{{', '}}'], 2), open = _a[0], close = _a[1];
    advanceBy(context, open.length);
    var closeIndex = context.source.indexOf(close, open.length);
    var preTrimContent = parseTextData(context, closeIndex);
    var content = preTrimContent.trim();
    advanceBy(context, close.length);
    return {
        type: 5 /* NodeTypes.INTERPOLATION */,
        content: {
            type: 4 /* NodeTypes.SIMPLE_EXPRESSION */,
            isStatic: false,
            content: content
        }
    };
}
function pushNode(nodes, node) {
    nodes.push(node);
}
function parseText(context) {
    var endTokens = ['<', '{{'];
    var endIndex = context.source.length;
    for (var i = 0; i < endTokens.length; i++) {
        var index = context.source.indexOf(endTokens[i], 1);
        if (index !== -1 && endIndex > index) {
            endIndex = index;
        }
    }
    var content = parseTextData(context, endIndex);
    return {
        content: content,
        type: 2 /* NodeTypes.TEXT */
    };
}
function parseTag(context, type) {
    var match = /^<\/?([a-z][^\r\n\t\f />]*)/i.exec(context.source);
    var tag = match[1];
    advanceBy(context, match[0].length);
    // 属性和指令的处理
    advanceSpaces(context);
    var props = parseAttributes(context, type);
    var isSelfClosing = startsWith(context.source, '/>');
    advanceBy(context, isSelfClosing ? 2 : 1);
    return {
        tag: tag,
        props: props,
        children: [],
        type: 1 /* NodeTypes.ELEMENT */,
        tagType: 0 /* ElementTypes.ELEMENT */
    };
}
function advanceBy(context, numberOfCharacters) {
    var source = context.source;
    context.source = source.slice(numberOfCharacters);
}
function parseTextData(context, length) {
    var rawText = context.source.slice(0, length);
    advanceBy(context, length);
    return rawText;
}
function advanceSpaces(context) {
    var match = /^[\t\r\n\f\s]+/.exec(context.source);
    if (match) {
        advanceBy(context, match[0].length);
    }
}
function parseAttributes(context, type) {
    var props = [];
    var attributeNames = new Set();
    while (context.source.length > 0 &&
        !startsWith(context.source, '>') &&
        !startsWith(context.source, '/>')) {
        var attr = parseAttribute(context, attributeNames);
        if (type === TagType.Start) {
            props.push(attr);
        }
        advanceSpaces(context);
    }
    return props;
}
function parseAttribute(context, nameSet) {
    var match = /^[^\t\r\n\f />][^\t\r\n\f />=]*/.exec(context.source);
    var name = match[0];
    nameSet.add(name);
    advanceBy(context, name.length);
    var value = undefined;
    if (/^[\t\r\n\f ]*=/.test(context.source)) {
        advanceSpaces(context);
        advanceBy(context, 1);
        advanceSpaces(context);
        value = parseAttributeValue(context);
    }
    // v- 指令
    if (/^(v-[A-Za-z0-9-]|:|\.|@|#)/.test(name)) {
        var match_1 = /(?:^v-([a-z0-9-]+))?(?:(?::|^\.|^@|^#)(\[[^\]]+\]|[^\.]+))?(.+)?$/i.exec(name);
        var dirName = match_1[1];
        return {
            type: 7 /* NodeTypes.DIRECTIVE */,
            name: dirName,
            exp: value && {
                type: 4 /* NodeTypes.SIMPLE_EXPRESSION */,
                content: value.content,
                isStatic: false,
                loc: {}
            },
            art: undefined,
            modifiers: undefined
        };
    }
    return {
        type: 6 /* NodeTypes.ATTRIBUTE */,
        name: name,
        value: value && {
            type: 2 /* NodeTypes.TEXT */,
            content: value.content,
            loc: {}
        },
        loc: {}
    };
}
function parseAttributeValue(context) {
    var content = '';
    var quote = context.source[0];
    var isQuoted = quote === "\"" || quote === "'";
    if (isQuoted) {
        advanceBy(context, 1);
        var endIndex = context.source.indexOf(quote);
        if (endIndex === -1) {
            content = parseTextData(context, context.source.length);
        }
        else {
            content = parseTextData(context, endIndex);
            advanceBy(context, 1);
        }
    }
    return {
        content: content,
        loc: {},
        isQuoted: isQuoted
    };
}

var _a;
var CREATE_VNODE = Symbol('createVNode');
var CREATE_COMMENT = Symbol('createCommentVNode');
var TO_DISPLAY_STRING = Symbol('to_display_string');
var CREATE_ELEMENT_VNODE = Symbol('createElementVNode');
var helperNameMap = (_a = {},
    _a[CREATE_VNODE] = 'createVNode',
    _a[CREATE_COMMENT] = 'createCommentVNode',
    _a[TO_DISPLAY_STRING] = 'toDisplayString',
    _a[CREATE_ELEMENT_VNODE] = 'createElementVNode',
    _a);

function isSingleElementRoot(root, child) {
    var children = root.children;
    return children.length === 1 && child.type === 1 /* NodeTypes.ELEMENT */;
}

function transform(root, options) {
    var context = createTransformContext(root, options);
    traverseNode(root, context);
    createRootCodegen(root);
    root.helpers = __spreadArray([], __read(context.helpers.keys()), false);
    root.components = [];
    root.directives = [];
    root.imports = [];
    root.hoists = [];
    root.temps = [];
    root.cached = [];
}
function createTransformContext(root, _a) {
    var nodeTransforms = _a.nodeTransforms;
    var context = {
        nodeTransforms: nodeTransforms,
        root: root,
        helpers: new Map(),
        currentNode: root,
        parent: null,
        childIndex: 0,
        helper: function (name) {
            var count = context.helpers.get(name) || 0;
            context.helpers.set(name, count + 1);
            return name;
        },
        replaceNode: function (node) {
            context.parent.children[context.childIndex] = context.currentNode = node;
        }
    };
    return context;
}
function traverseNode(node, context) {
    context.currentNode = node;
    var nodeTransforms = context.nodeTransforms;
    var exitFns = [];
    for (var i_1 = 0; i_1 < nodeTransforms.length; i_1++) {
        var onExit = nodeTransforms[i_1](node, context);
        if (onExit) {
            if (isArray(onExit)) {
                exitFns.push.apply(exitFns, __spreadArray([], __read(onExit), false));
            }
            else {
                exitFns.push(onExit);
            }
        }
        if (!context.currentNode) {
            return;
        }
        else {
            node = context.currentNode;
        }
    }
    switch (node.type) {
        case 10 /* NodeTypes.IF_BRANCH */:
        case 1 /* NodeTypes.ELEMENT */:
        case 0 /* NodeTypes.ROOT */:
            traverseChildren(node, context);
            break;
        case 5 /* NodeTypes.INTERPOLATION */:
            context.helper(TO_DISPLAY_STRING);
            break;
        case 9 /* NodeTypes.IF */:
            for (var i_2 = 0; i_2 < node.branches.length; i_2++) {
                traverseNode(node.branches[i_2], context);
            }
            break;
    }
    context.currentNode = node;
    var i = exitFns.length;
    while (i--) {
        exitFns[i]();
    }
}
function traverseChildren(parent, context) {
    parent.children.forEach(function (node, index) {
        context.parent = parent;
        context.childIndex = index;
        traverseNode(node, context);
    });
}
function createRootCodegen(root) {
    var children = root.children;
    if (children.length === 1) {
        var child = children[0];
        if (isSingleElementRoot(root, child)) {
            root.codegenNode = child.codegenNode;
        }
    }
}
function createStructuralDirectiveTransform(name, fn) {
    var matches = isString(name) ? function (n) { return n === name; } : function (n) { return name.test(n); };
    return function (node, context) {
        if (node.type === 1 /* NodeTypes.ELEMENT */) {
            var props = node.props;
            var exitFns = [];
            for (var i = 0; i < props.length; i++) {
                var prop = props[i];
                if (prop.type === 7 /* NodeTypes.DIRECTIVE */ && matches(prop.name)) {
                    props.splice(i, 1);
                    i--;
                    var onExit = fn(node, prop, context);
                    if (onExit) {
                        exitFns.push(onExit);
                    }
                }
            }
            return exitFns;
        }
    };
}

function createVNodeCall(context, tag, props, children) {
    if (context) {
        context.helper(CREATE_ELEMENT_VNODE);
    }
    return {
        type: 13 /* NodeTypes.VNODE_CALL */,
        tag: tag,
        props: props,
        children: children
    };
}
function getVNodeHelper(ssr, isComponent) {
    return ssr || isComponent ? CREATE_VNODE : CREATE_ELEMENT_VNODE;
}
function createCompoundExpression(children, loc) {
    return {
        type: 8 /* NodeTypes.COMPOUND_EXPRESSION */,
        loc: loc,
        children: children
    };
}
function createConditionalExpression(test, consequent, alternate, newline) {
    return {
        type: 19 /* NodeTypes.JS_CONDITIONAL_EXPRESSION */,
        test: test,
        consequent: consequent,
        alternate: alternate,
        newline: newline,
        loc: {}
    };
}
function createObjectProperty(key, value) {
    return {
        type: 16 /* NodeTypes.JS_PROPERTY */,
        loc: {},
        key: isString(key) ? createSimpleExpression(key, true) : key,
        value: value
    };
}
function createObjectExpression(properties) {
    return {
        type: 15 /* NodeTypes.JS_OBJECT_EXPRESSION */,
        loc: {},
        properties: properties
    };
}
function createSimpleExpression(content, isStatic) {
    return {
        type: 4 /* NodeTypes.SIMPLE_EXPRESSION */,
        loc: {},
        content: content,
        isStatic: isStatic
    };
}
function createCallExpression(callee, args) {
    return {
        type: 14 /* NodeTypes.JS_CALL_EXPRESSION */,
        loc: {},
        callee: callee,
        arguments: args
    };
}

function isText(node) {
    return node.type === 5 /* NodeTypes.INTERPOLATION */ || node.type === 2 /* NodeTypes.TEXT */;
}
function injectProp(node, prop) {
    var propsWithInjection;
    var props = node.type === 13 /* NodeTypes.VNODE_CALL */ ? node.props : node.arguments[2];
    if (props === null || isString(props)) {
        propsWithInjection = createObjectExpression([prop]);
    }
    node.props = propsWithInjection;
}
function getMemoedVNodeCall(node) {
    return node;
}

var transformText = function (node, context) {
    if (node.type === 0 /* NodeTypes.ROOT */ ||
        node.type === 1 /* NodeTypes.ELEMENT */ ||
        node.type === 11 /* NodeTypes.FOR */ ||
        node.type === 10 /* NodeTypes.IF_BRANCH */) {
        return function () {
            var children = node.children;
            var currentContainer;
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                if (isText(child)) {
                    for (var j = i + 1; j < children.length; j++) {
                        var next = children[j];
                        if (isText(next)) {
                            if (!currentContainer) {
                                currentContainer = children[i] = createCompoundExpression([child], child.loc);
                            }
                            currentContainer.children.push(" + ", next);
                            children.splice(j, 1);
                            j--;
                        }
                        else {
                            currentContainer = undefined;
                            break;
                        }
                    }
                }
            }
        };
    }
};

var transformElement = function (node, context) {
    return function postTransformElement() {
        node = context.currentNode;
        if (node.type !== 1 /* NodeTypes.ELEMENT */) {
            return;
        }
        var tag = node.tag;
        var vnodeTag = "\"".concat(tag, "\"");
        var vnodeProps = [];
        var vnodeChildren = node.children;
        node.codegenNode = createVNodeCall(context, vnodeTag, vnodeProps, vnodeChildren);
    };
};

var aliasHelper = function (s) { return "".concat(helperNameMap[s], ": _").concat(helperNameMap[s]); };
function createCodegenContext(ast) {
    var context = {
        code: '',
        runtimeGlobalName: 'Vue',
        source: ast.loc.source,
        indentLevel: 0,
        isSSR: false,
        helper: function (key) {
            return "_".concat(helperNameMap[key]);
        },
        push: function (code) {
            context.code += code;
        },
        newline: function () {
            newline(context.indentLevel);
        },
        indent: function () {
            newline(++context.indentLevel);
        },
        deindent: function () {
            newline(--context.indentLevel);
        }
    };
    function newline(n) {
        context.code += '\n' + " ".repeat(n);
    }
    return context;
}
function generate(ast, options) {
    var context = createCodegenContext(ast);
    var push = context.push, newline = context.newline, indent = context.indent, deindent = context.deindent;
    genFunctionPreamble(context);
    var functionName = "render";
    var args = ['_ctx', '_cache'];
    var signature = args.join(', ');
    push("function ".concat(functionName, "(").concat(signature, ") {"));
    indent();
    push("with (_ctx) {");
    indent();
    var hasHelpers = ast.helpers.length > 0;
    if (hasHelpers) {
        push("const { ".concat(ast.helpers.map(aliasHelper).join(', '), " } = _Vue"));
        push('\n');
        newline();
    }
    newline();
    push("return ");
    if (ast.codegenNode) {
        genNode(ast.codegenNode, context);
    }
    else {
        push("null");
    }
    deindent();
    push('}');
    deindent();
    push('}');
    return {
        ast: ast,
        code: context.code
    };
}
function genFunctionPreamble(context) {
    var push = context.push, newline = context.newline, runtimeGlobalName = context.runtimeGlobalName;
    var VueBinding = runtimeGlobalName;
    push("const _Vue = ".concat(VueBinding, " \n"));
    newline();
    push("return ");
}
function genNode(node, context) {
    switch (node.type) {
        case 9 /* NodeTypes.IF */:
        case 1 /* NodeTypes.ELEMENT */:
            genNode(node.codegenNode, context);
            break;
        case 13 /* NodeTypes.VNODE_CALL */:
            genVNodeCall(node, context);
            break;
        case 2 /* NodeTypes.TEXT */:
            genText(node, context);
            break;
        case 4 /* NodeTypes.SIMPLE_EXPRESSION */:
            genExpression(node, context);
            break;
        case 5 /* NodeTypes.INTERPOLATION */:
            genInterpolation(node, context);
            break;
        case 8 /* NodeTypes.COMPOUND_EXPRESSION */:
            genCompundExpression(node, context);
            break;
        case 1 /* NodeTypes.ELEMENT */:
            genNode(node.codegenNode, context);
            break;
        case 14 /* NodeTypes.JS_CALL_EXPRESSION */:
            genCallExpression(node, context);
            break;
        case 19 /* NodeTypes.JS_CONDITIONAL_EXPRESSION */:
            genConditionalExpression(node, context);
            break;
    }
}
function genVNodeCall(node, context) {
    var push = context.push, helper = context.helper;
    var tag = node.tag, props = node.props, children = node.children, patchFlag = node.patchFlag, dynamicProps = node.dynamicProps; node.direcctives; node.isBlock; node.disableTracking; var isComponent = node.isComponent;
    var callHelper = getVNodeHelper(context.isSSR, isComponent);
    push(helper(callHelper) + "(");
    var args = genNullableArgs([tag, props, children, patchFlag, dynamicProps]);
    genNodeList(args, context);
    push(')');
}
function genText(node, context) {
    context.push(JSON.stringify(node.content));
}
function genExpression(node, context) {
    var content = node.content, isStatic = node.isStatic;
    context.push(isStatic ? JSON.stringify(content) : content);
}
function genInterpolation(node, context) {
    var push = context.push, helper = context.helper;
    push("".concat(helper(TO_DISPLAY_STRING), "("));
    genNode(node.content, context);
    push(')');
}
function genNullableArgs(args) {
    var i = args.length;
    while (i--) {
        if (args[i] != null) {
            break;
        }
    }
    return args.slice(0, i + 1).map(function (arg) { return arg || 'null'; });
}
function genNodeList(nodes, context) {
    var push = context.push;
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        if (isString(node)) {
            push(node);
        }
        else if (isArray(node)) {
            genNodeListArray(node, context);
        }
        else {
            genNode(node, context);
        }
        if (i < nodes.length - 1) {
            push(", ");
        }
    }
}
function genNodeListArray(nodes, context) {
    context.push('[');
    genNodeList(nodes, context);
    context.push(']');
}
function genCompundExpression(node, context) {
    for (var i = 0; i < node.children.length; i++) {
        var child = node.children[i];
        if (isString(child)) {
            context.push(child);
        }
        else {
            genNode(child, context);
        }
    }
}
function genConditionalExpression(node, context) {
    var test = node.test, alternate = node.alternate, consequent = node.consequent, needNewLine = node.newline;
    var push = context.push, indent = context.indent, deindent = context.deindent, newline = context.newline;
    if (test.type === 4 /* NodeTypes.SIMPLE_EXPRESSION */) {
        genExpression(test, context);
    }
    needNewLine && indent();
    context.indentLevel++;
    needNewLine || push(" ");
    push("?");
    genNode(consequent, context);
    context.indentLevel--;
    needNewLine && newline();
    needNewLine || push(" ");
    push(": ");
    var isNested = alternate.type === 19 /* NodeTypes.JS_CONDITIONAL_EXPRESSION */;
    if (!isNested) {
        context.indentLevel++;
    }
    genNode(alternate, context);
    if (!isNested) {
        context.indentLevel--;
    }
    needNewLine && deindent(true);
}
function genCallExpression(node, context) {
    var push = context.push, helper = context.helper;
    var callee = isString(node.callee) ? node.callee : helper(node.callee);
    push(callee + "(");
    genNodeList(node.arguments, context);
    push(")");
}

var transformIf = createStructuralDirectiveTransform(/^(if|else|else-if)$/, function (node, dir, context) {
    return processIf(node, dir, context, function (ifNode, branch, isRoot) {
        var key = 0;
        return function () {
            if (isRoot) {
                ifNode.codegenNode = createCodegenNodeForBranch(branch, key, context);
            }
        };
    });
});
function processIf(node, dir, context, processCodegen) {
    if (dir.name === 'if') {
        var branch = createIfBranch(node, dir);
        var ifNode = {
            type: 9 /* NodeTypes.IF */,
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
        type: 10 /* NodeTypes.IF_BRANCH */,
        loc: {},
        condition: dir.exp,
        children: [node]
    };
}
function createCodegenNodeForBranch(branch, keyIndex, context) {
    if (branch.condition) {
        return createConditionalExpression(branch.condition, createChildrenCodegenNode(branch, keyIndex), createCallExpression(context.helper(CREATE_COMMENT), ['"v-if"', 'true']));
    }
    else {
        return createChildrenCodegenNode(branch, keyIndex);
    }
}
function createChildrenCodegenNode(branch, keyIndex) {
    var keyProperty = createObjectProperty("key", createSimpleExpression("".concat(keyIndex), false));
    var children = branch.children;
    var firstChild = children[0];
    var ret = firstChild.codegenNode;
    var vnodeCall = getMemoedVNodeCall(ret);
    injectProp(vnodeCall, keyProperty);
    return ret;
}

function baseCompile(template, options) {
    if (options === void 0) { options = {}; }
    var ast = baseParse(template);
    transform(ast, extend(options, {
        nodeTransforms: [transformElement, transformText, transformIf]
    }));
    return generate(ast);
}

function compile$1(template, options) {
    return baseCompile(template, options);
}

function injectHook(type, hook, target) {
    if (target) {
        target[type] = hook;
        return hook;
    }
}
var createHook = function (lifecycle) {
    return function (hook, target) { return injectHook(lifecycle, hook, target); };
};
var onBeforeMount = createHook("bm" /* LifecycleHooks.BEFORE_MOUNT */);
var onMounted = createHook("m" /* LifecycleHooks.MOUNTED */);

function callHook(hook, proxy) {
    hook.bind(proxy)();
}
function applyOptions(instance) {
    var _a = instance.type, dataOptions = _a.data, beforeCreate = _a.beforeCreate, created = _a.created, beforeMount = _a.beforeMount, mounted = _a.mounted;
    if (beforeCreate) {
        callHook(beforeCreate, instance.data);
    }
    if (dataOptions) {
        var data = dataOptions();
        if (isObject(data)) {
            instance.data = reactive(data);
        }
    }
    if (created) {
        callHook(created, instance.data);
    }
    function registerLifecycleHook(register, hook) {
        if (isArray(hook)) {
            hook.forEach(function (_hook) { return register(_hook.bind(instance.data), instance); });
        }
        else if (hook) {
            register(hook.bind(instance.data), instance);
        }
    }
    registerLifecycleHook(onBeforeMount, beforeMount);
    registerLifecycleHook(onMounted, mounted);
}

var uid = 0;
var compile;
function createComponentInstance(vnode) {
    var type = vnode.type;
    var instance = {
        uid: uid++,
        type: type,
        vnode: vnode,
        effect: null,
        render: null,
        update: null,
        subTree: null,
        // lifecycle hooks
        isMounted: false,
        isUnmounted: false,
        isDeactivated: false,
        bc: null,
        c: null,
        bm: null,
        m: null,
        bu: null,
        u: null,
        um: null,
        bum: null,
        da: null,
        a: null,
        rtg: null,
        rtc: null,
        ec: null,
        sp: null
    };
    return instance;
}
function setupComponent(instance) {
    var isStateful = isStatefulComponent(instance);
    var setupResult = isStateful ? setupStatefulComponent(instance) : undefined;
    return setupResult;
}
function isStatefulComponent(instance) {
    return instance.vnode.shapeFlag & 4 /* ShapeFlags.STATEFUL_COMPONENT */;
}
function setupStatefulComponent(instance) {
    var Component = instance.type;
    var setup = Component.setup;
    if (setup) {
        var setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
    else {
        finishComponentSetup(instance);
    }
}
function handleSetupResult(instance, setupResult) {
    if (isFunction(setupResult)) {
        instance.render = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    var Component = instance.type;
    if (!instance.render) {
        if (compile && !Component.render) {
            if (Component.template) {
                var template = Component.template;
                Component.render = compile(template);
            }
        }
        instance.render = Component.render;
    }
    applyOptions(instance);
}
function registerRuntimeCompiler(_compile) {
    compile = _compile;
}

function compileToFunction(template, options) {
    var code = compile$1(template, options).code;
    var render = new Function(code)();
    return render;
}
registerRuntimeCompiler(compileToFunction);

var createDep = function (effects) {
    var dep = new Set(effects);
    return dep;
};

var targetMap = new WeakMap();
var activeEffect;
var ReactiveEffect = /** @class */ (function () {
    function ReactiveEffect(fn, scheduler) {
        if (scheduler === void 0) { scheduler = null; }
        this.fn = fn;
        this.scheduler = scheduler;
        this.fn = fn;
    }
    ReactiveEffect.prototype.run = function () {
        activeEffect = this;
        return this.fn();
    };
    ReactiveEffect.prototype.stop = function () { };
    return ReactiveEffect;
}());
function trackEffects(dep) {
    dep.add(activeEffect);
}
function track(target, key) {
    if (!activeEffect) {
        return;
    }
    var depsMap = targetMap.get(target);
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map()));
    }
    var dep = depsMap.get(key);
    if (!dep) {
        depsMap.set(key, (dep = createDep()));
    }
    trackEffects(dep);
}
function triggerEffect(effect) {
    if (effect.scheduler) {
        effect.scheduler();
    }
    else {
        effect.run();
    }
}
function triggerEffects(deps) {
    var e_1, _a, e_2, _b;
    var effects = Array.isArray(deps) ? deps : __spreadArray([], __read(deps), false);
    try {
        for (var effects_1 = __values(effects), effects_1_1 = effects_1.next(); !effects_1_1.done; effects_1_1 = effects_1.next()) {
            var effect_1 = effects_1_1.value;
            if (effect_1.computed) {
                triggerEffect(effect_1);
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (effects_1_1 && !effects_1_1.done && (_a = effects_1.return)) _a.call(effects_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    try {
        for (var effects_2 = __values(effects), effects_2_1 = effects_2.next(); !effects_2_1.done; effects_2_1 = effects_2.next()) {
            var effect_2 = effects_2_1.value;
            if (!effect_2.computed) {
                triggerEffect(effect_2);
            }
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (effects_2_1 && !effects_2_1.done && (_b = effects_2.return)) _b.call(effects_2);
        }
        finally { if (e_2) throw e_2.error; }
    }
}
function trigger(target, key, value) {
    var depsMap = targetMap.get(target);
    if (!depsMap) {
        return;
    }
    var deps = depsMap.get(key);
    if (!deps) {
        return;
    }
    triggerEffects(deps);
}
function effect(fn, options) {
    var _effect = new ReactiveEffect(fn);
    if (options) {
        extend(_effect, options);
    }
    if (!options || !options.lazy) {
        _effect.run();
    }
}

function createGetter() {
    return function get(target, key, reaceiver) {
        var result = Reflect.get(target, key, reaceiver);
        track(target, key);
        return result;
    };
}
function createSetter() {
    return function set(target, key, value, receiver) {
        var result = Reflect.set(target, key, value, receiver);
        trigger(target, key);
        return result;
    };
}
var get = createGetter();
var set = createSetter();
var mutableHandlers = {
    get: get,
    set: set
};

var reactiveMap = new WeakMap();
function reactive(target) {
    return createReacttiveObject(target, mutableHandlers, reactiveMap);
}
function createReacttiveObject(target, baseHandlers, proxyMap) {
    var existingProxy = proxyMap.get(target);
    if (existingProxy) {
        return existingProxy;
    }
    var proxy = new Proxy(target, baseHandlers);
    proxy["__v_isReactive" /* ReactiveFlags.IS_REACTIVE */] = true;
    proxyMap.set(target, proxy);
    return proxy;
}
var toReactive = function (value) {
    return isObject(value) ? reactive(value) : value;
};
function isReactive(value) {
    return !!(value && value["__v_isReactive" /* ReactiveFlags.IS_REACTIVE */]);
}

function ref(value) {
    return createRef(value, false);
}
function isRef(r) {
    return !!(r && r.__v_isRef === true);
}
function createRef(rawValue, shallow) {
    if (isRef(rawValue)) {
        return rawValue;
    }
    return new RefImpl(rawValue, shallow);
}
function trackRefValue(ref) {
    if (activeEffect) {
        trackEffects(ref.dep || (ref.dep = createDep()));
    }
}
function triggerRefValue(ref) {
    if (ref.dep) {
        triggerEffects(ref.dep);
    }
}
var RefImpl = /** @class */ (function () {
    function RefImpl(value, __v_isShallow) {
        this.__v_isShallow = __v_isShallow;
        this.dep = undefined;
        this.__v_isRef = true;
        this._rawValue = value;
        this._value = __v_isShallow ? value : toReactive(value);
    }
    Object.defineProperty(RefImpl.prototype, "value", {
        get: function () {
            trackRefValue(this);
            return this._value;
        },
        set: function (newValue) {
            if (hashChanged(newValue, this._rawValue)) {
                this._rawValue = newValue;
                this._value = toReactive(newValue);
                triggerRefValue(this);
            }
        },
        enumerable: false,
        configurable: true
    });
    return RefImpl;
}());

var ComputeRefImpl = /** @class */ (function () {
    function ComputeRefImpl(getter) {
        var _this = this;
        this._dirty = true;
        this.dep = undefined;
        this.__v_isRef = true;
        this.effect = new ReactiveEffect(getter, function () {
            if (!_this._dirty) {
                _this._dirty = true;
                triggerRefValue(_this);
            }
        });
        this.effect.computed = this;
    }
    Object.defineProperty(ComputeRefImpl.prototype, "value", {
        get: function () {
            trackRefValue(this);
            if (this._dirty) {
                this._dirty = false;
                this._value = this.effect.run();
            }
            return this._value;
        },
        set: function (newValue) { },
        enumerable: false,
        configurable: true
    });
    return ComputeRefImpl;
}());
function computed(getterOrOptions) {
    var getter;
    var onlyGetter = isFunction(getterOrOptions);
    if (onlyGetter) {
        getter = getterOrOptions;
    }
    var cRef = new ComputeRefImpl(getter);
    return cRef;
}

var doc = (typeof document !== 'undefined' ? document : null);
var nodeOps = {
    insert: function (child, parent, achor) {
        parent.insertBefore(child, achor || null);
    },
    createElement: function (type) {
        var el = doc.createElement(type);
        return el;
    },
    setElementText: function (el, text) {
        el.textContent = text;
    },
    remove: function (child) {
        var parent = child.parentNode;
        if (parent) {
            parent.removeChild(child);
        }
    },
    createText: function (text) {
        return doc.createTextNode(text);
    },
    setText: function (node, text) {
        node.nodeValue = text;
    },
    createComment: function (text) {
        return doc.createComment(text);
    }
};

function patchClass(el, value) {
    if (value === null) {
        el.removeAttribute('class');
    }
    else {
        el.className = value;
    }
}

function patchDOMProp(el, key, value) {
    el[key] = value == null ? '' : value;
    return;
}

function patchAttr(el, key, value) {
    if (value == null) {
        el.removeAttribute(key);
    }
    else {
        el.setAttribute(key, value);
    }
}

function patchStyle(el, prev, next) {
    var style = el.style;
    var isCssString = isString(next);
    if (next && !isCssString) {
        for (var key in next) {
            setStyle(style, key, next[key]);
        }
        if (prev && !isString(prev)) {
            for (var key in prev) {
                if (next[key] == null) {
                    setStyle(style, key, '');
                }
            }
        }
    }
}
function setStyle(style, name, value) {
    style[name] = value;
}

function patchEvent(el, rawName, prevValue, nextValue) {
    var invokers = el._vei || (el._vei = {});
    var existingInvoker = invokers[rawName];
    if (nextValue && existingInvoker) {
        existingInvoker.value = nextValue;
    }
    else {
        var name_1 = parseName(rawName);
        if (nextValue) {
            var invoker = (invokers[rawName] = createInvoker(nextValue));
            el.addEventListener(name_1, invoker);
        }
        else if (existingInvoker) {
            el.removeEventListener(name_1, existingInvoker);
            invokers[rawName] = undefined;
        }
    }
}
function parseName(name) {
    return name.slice(2).toLowerCase();
}
function createInvoker(initialValue) {
    var invoker = function (e) {
        invoker.value && invoker.value();
    };
    invoker.value = initialValue;
    return invoker;
}

var patchProp = function (el, key, prevValue, nextValue) {
    if (key === 'class') {
        patchClass(el, nextValue);
    }
    else if (key === 'style') {
        patchStyle(el, prevValue, nextValue);
    }
    else if (isOn(key)) {
        patchEvent(el, key, prevValue, nextValue);
    }
    else if (shouldSetAsProp(el, key)) {
        patchDOMProp(el, key, nextValue);
    }
    else {
        patchAttr(el, key, nextValue);
    }
};
function shouldSetAsProp(el, key) {
    if (key === 'innerHTML' || key === 'textContent') {
        return true;
    }
    if (key === 'form') {
        return false;
    }
    if (key === 'list' && el.tagName === 'INPUT') {
        return false;
    }
    if (key === 'type' && el.tagName === 'TEXTAREA') {
        return false;
    }
    return key in el;
}

function normalizeClass(value) {
    var res = '';
    if (isString(value)) {
        res = value;
    }
    else if (isArray(value)) {
        for (var i = 0; i < value.length; i++) {
            var normalized = normalizeClass(value[i]);
            if (normalized) {
                res += normalized + ' ';
            }
        }
    }
    else if (isObject(value)) {
        for (var name_1 in value) {
            if (value[name_1]) {
                res += name_1 + ' ';
            }
        }
    }
    return res.trim();
}

var Text = Symbol.for('v-text');
var Comment = Symbol.for('v-cmt');
var Fragment = Symbol.for('v-fgt');
function isVNode(value) {
    return value ? value.__v_isVNode === true : false;
}
function isSameVNodeType(n1, n2) {
    return n1.key === n2.key && n1.type === n2.type;
}
function createVNode(type, props, children) {
    if (props) {
        var klass = props.class; props.style;
        if (klass && !isString(klass)) {
            props.class = normalizeClass(klass);
        }
    }
    var shapeFlag = isString(type)
        ? 1 /* ShapeFlags.ELEMENT */
        : isObject(type)
            ? 4 /* ShapeFlags.STATEFUL_COMPONENT */
            : 0;
    return createBaseVNode(type, props, children, shapeFlag);
}
function createBaseVNode(type, props, children, shapeFlag) {
    var vnode = {
        __v_isVNode: true,
        type: type,
        props: props,
        children: children,
        shapeFlag: shapeFlag,
        key: (props === null || props === void 0 ? void 0 : props.key) || null
    };
    normalizeChildren(vnode, children);
    return vnode;
}
function normalizeVNode(child) {
    if (child == null || typeof child === 'boolean') {
        return createVNode(Comment);
    }
    else if (isArray(child)) {
        return createVNode(Fragment, null, child.slice());
    }
    else if (typeof child === 'object') {
        return cloneIfMounted(child);
    }
    else {
        return createVNode(Text, null, String(child));
    }
}
function cloneIfMounted(child) {
    return child;
}
function normalizeChildren(vnode, children) {
    var type = 0;
    if (children == null) {
        children = null;
    }
    else if (isArray(children)) {
        type = 16 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    else if (typeof children === 'object') ;
    else if (isFunction(children)) ;
    else {
        children = String(children);
        type = 8 /* ShapeFlags.TEXT_CHILDREN */;
    }
    vnode.children = children;
    vnode.shapeFlag |= type;
}
function createCommentVNode(text) {
    return createVNode(Comment, null, text);
}

var flushIndex = 0;
var postFlushIndex = 0;
var isFlushPending = false;
var queue = [];
var pendingPostFlushCbs = [];
var activePostFlushCbs = null;
var resolvePromise = Promise.resolve();
function flushPostFlushCbs() {
    if (pendingPostFlushCbs.length) {
        var deduped = __spreadArray([], __read(new Set(pendingPostFlushCbs)), false);
        pendingPostFlushCbs.length = 0;
        if (activePostFlushCbs) {
            activePostFlushCbs.push.apply(activePostFlushCbs, __spreadArray([], __read(deduped), false));
            return;
        }
        activePostFlushCbs = __spreadArray([], __read(deduped), false);
        for (postFlushIndex = 0; postFlushIndex < activePostFlushCbs.length; postFlushIndex++) {
            activePostFlushCbs[postFlushIndex]();
        }
        activePostFlushCbs = null;
        postFlushIndex = 0;
    }
}
function flushJobs() {
    isFlushPending = false;
    try {
        for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
            var job = queue[flushIndex];
            job();
        }
    }
    finally {
        flushIndex = 0;
        queue.length = 0;
        flushPostFlushCbs();
    }
}
function queueFlush() {
    if (!isFlushPending) {
        isFlushPending = true;
        resolvePromise.then(flushJobs);
    }
}
function queuePostFlushCb(cb) {
    if (Array.isArray(cb)) ;
    else {
        pendingPostFlushCbs.push(cb);
    }
    queueFlush();
}
function queueJob(job) {
    queue.push(job);
    queueFlush();
}

function renderComponentRoot(instance) {
    instance.type; var vnode = instance.vnode, render = instance.render, _a = instance.data, data = _a === void 0 ? {} : _a;
    var result;
    try {
        if (vnode.shapeFlag & 4 /* ShapeFlags.STATEFUL_COMPONENT */) {
            result = normalizeVNode(render.call(data, data));
        }
    }
    catch (error) {
        console.log(error);
    }
    return result;
}

function createAppAPI(render) {
    return function createApp(rootComponent, rootProps) {
        if (rootProps === void 0) { rootProps = null; }
        var app = {
            _component: rootComponent,
            _container: null,
            mount: function (rootContainer) {
                var vnode = createVNode(rootComponent, rootProps, null);
                render(vnode, rootContainer);
            }
        };
        return app;
    };
}

function createRenderer(options) {
    return baseCreateRenderer(options);
}
function baseCreateRenderer(options) {
    var hostInsert = options.insert, hostRemove = options.remove, hostSetText = options.setText, hostPatchProp = options.patchProp, hostCreateText = options.createText, hostCreateComment = options.createComment, hostCreateElement = options.createElement, hostSetElementText = options.setElementText;
    var patch = function (n1, n2, container, anchor) {
        if (anchor === void 0) { anchor = null; }
        if (n1 === n2) {
            return;
        }
        if (n1 && !isSameVNodeType(n1, n2)) {
            unmount(n1);
            n1 = null;
        }
        var type = n2.type, shapeFlag = n2.shapeFlag;
        switch (type) {
            case Text:
                processText(n1, n2, container, anchor);
                break;
            case Comment:
                processCommentNode(n1, n2, container, anchor);
                break;
            case Fragment:
                processFragment(n1, n2, container, anchor);
                break;
            default:
                if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                    processElement(n1, n2, container, anchor);
                }
                else if (shapeFlag & 6 /* ShapeFlags.COMPONENT */) {
                    processComponent(n1, n2, container, anchor);
                }
        }
    };
    var processText = function (n1, n2, container, anchor) {
        if (n1 == null) {
            n2.el = hostCreateText(n2.children);
            hostInsert(n2.el, container, anchor);
        }
        else {
            var el = (n2.el = n1.el);
            if (n2.children !== n1.children) {
                hostSetText(el, n2.children);
            }
        }
    };
    var processCommentNode = function (n1, n2, container, anchor) {
        if (n1 == null) {
            n2.el = hostCreateComment(n2.children);
            hostInsert(n2.el, container, anchor);
        }
        else {
            n2.el = n1.el;
        }
    };
    var processFragment = function (n1, n2, container, anchor) {
        if (n1 == null) {
            mountChildren(n2.children, container, anchor);
        }
        else {
            patchChildren(n1, n2, container, anchor);
        }
    };
    var processElement = function (n1, n2, container, anchor) {
        if (n1 == null) {
            mountElement(n2, container, anchor);
        }
        else {
            patchElement(n1, n2);
        }
    };
    var processComponent = function (n1, n2, container, anchor) {
        if (n1 == null) {
            if (n2.shapeFlag & 512 /* ShapeFlags.COMPONENT_KEPT_ALIVE */) ;
            else {
                mountComponent(n2, container, anchor);
            }
        }
    };
    var mountComponent = function (initialVNode, container, anchor) {
        var componentMountInstance = initialVNode.component;
        var instance = componentMountInstance ||
            (initialVNode.component = createComponentInstance(initialVNode));
        setupComponent(instance);
        setupRenderEffect(instance, initialVNode, container, anchor);
    };
    var setupRenderEffect = function (instance, initialValue, container, anchor) {
        var componentUpdateFn = function () {
            if (!instance.isMounted) {
                var bm = instance.bm, m = instance.m;
                if (bm) {
                    bm();
                }
                var subTree = (instance.subTree = renderComponentRoot(instance));
                patch(null, subTree, container, anchor);
                initialValue.el = subTree.el;
                if (m) {
                    m();
                }
                instance.isMounted = true;
            }
            else {
                var next = instance.next, vnode = instance.vnode;
                if (!next) {
                    next = vnode;
                }
                var nextTree = renderComponentRoot(instance);
                var prevTree = instance.subTree;
                instance.subTree = nextTree;
                patch(prevTree, nextTree, container, anchor);
                next.el = nextTree.el;
            }
        };
        var effect = (instance.effect = new ReactiveEffect(componentUpdateFn, function () {
            queueJob(update);
        }));
        var update = (instance.update = function () { return effect.run(); });
        update();
    };
    var mountElement = function (vnode, container, anchor) {
        var el;
        var type = vnode.type, props = vnode.props, shapeFlag = vnode.shapeFlag;
        // 1. 创建 Element
        el = vnode.el = hostCreateElement(type);
        if (shapeFlag & 8 /* ShapeFlags.TEXT_CHILDREN */) {
            // 2. 设置 Text
            hostSetElementText(el, vnode.children);
        }
        else if (shapeFlag & 16 /* ShapeFlags.ARRAY_CHILDREN */) {
            mountChildren(vnode.children, el, anchor);
        }
        if (props) {
            // 3. 设置 Props
            for (var key in props) {
                hostPatchProp(el, key, null, props[key]);
            }
        }
        // 4. 插入
        hostInsert(el, container, anchor);
    };
    var patchElement = function (n1, n2) {
        var el = (n2.el = n1.el);
        var oldProps = n1.props || EMPTY_OBJ;
        var newProps = n2.props || EMPTY_OBJ;
        patchChildren(n1, n2, el, null);
        patchProps(el, n2, oldProps, newProps);
    };
    var mountChildren = function (children, container, anchor) {
        if (isString(children)) {
            children = children.split('');
        }
        for (var i = 0; i < children.length; i++) {
            var child = (children[i] = normalizeVNode(children[i]));
            patch(null, child, container, anchor);
        }
    };
    var patchChildren = function (n1, n2, container, anchor) {
        var c1 = n1 && n1.children;
        var prevShapFlag = n1 ? n1.shapeFlag : 0;
        var c2 = n2 && n2.children;
        var shapeFlag = n2.shapeFlag;
        if (shapeFlag & 8 /* ShapeFlags.TEXT_CHILDREN */) {
            if (c2 !== c1) {
                // 挂载新子节点文本
                hostSetElementText(container, c2);
            }
        }
        else {
            // 新节点不为文本节点
            if (prevShapFlag & 16 /* ShapeFlags.ARRAY_CHILDREN */) {
                // 新节点不为文本节点 && 旧节点为数组节点
                if (shapeFlag & 16 /* ShapeFlags.ARRAY_CHILDREN */) {
                    // 新节点为数组节点 && 旧节点为数组节点 则 Diff 运算
                    patchKeyedChildren(c1, c2, container, anchor);
                }
            }
            else {
                if (prevShapFlag & 8 /* ShapeFlags.TEXT_CHILDREN */) {
                    // 新节点不为文本节点 && 旧节点为文本节点 则下载旧子节点
                    hostSetElementText(container, '');
                }
            }
        }
    };
    var patchKeyedChildren = function (c1, c2, container, parentAnchor) {
        var i = 0;
        var l2 = c2.length;
        var e1 = c1.length - 1;
        var e2 = l2 - 1;
        // 1. 从左往右遍历 [a,b,c] => [a,b,d,e]
        while (i <= e1 && i <= e2) {
            var n1 = c1[i];
            var n2 = (c2[i] = normalizeVNode(c2[i]));
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, null);
            }
            else {
                break;
            }
            i++;
        }
        // 2. 从右往左遍历
        while (i <= e1 && i <= e2) {
            var n1 = c1[e1];
            var n2 = (c2[e2] = normalizeVNode(c2[e2]));
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, null);
            }
            else {
                break;
            }
            e1--;
            e2--;
        }
        // 3. 新节点多于旧节点时, 挂载新节点
        if (i > e1) {
            if (i <= e2) {
                var nextPos = e2 + 1;
                var anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor;
                while (i <= e2) {
                    patch(null, (c2[i] = normalizeVNode(c2[i])), container, anchor);
                    i++;
                }
            }
        }
        // 4. 旧节点多语新节点时, 卸载旧节点
        else if (i > e2) {
            while (i <= e1) {
                unmount(c1[i]);
                i++;
            }
        }
        // 5. 乱序
        else {
            var s1 = i;
            var s2 = i;
            // 5.1 为**剩余新节点**构建`key (新节点的 key):index (新节点的索引)`的`Map` => `keyToNewIndexMap`
            var keyToNewIndexMap = new Map();
            for (i = s2; i <= e2; i++) {
                var nextChild = (c2[i] = normalizeVNode(c2[i]));
                if (nextChild.key != null) {
                    keyToNewIndexMap.set(nextChild.key, i);
                }
            }
            // 5.2 循环遍历剩下的旧节点,尝试修补匹配节点并删除不存在的节点, 记录需要匹配的节点数和已匹配的节点数, 创建一个需要匹配节点数长度的数组 `newIndexToOldIndexMap`, 初始化每个数组的下标的默认值为 `0`
            var j = void 0;
            var patched = 0;
            var toBePatched = e2 - s2 + 1;
            var moved = false;
            var maxNewIndexSoFar = 0;
            var newIndexToOldIndexMap = new Array(toBePatched);
            for (i = 0; i < toBePatched; i++)
                newIndexToOldIndexMap[i] = 0;
            for (i = s1; i <= e1; i++) {
                var prevChild = c1[i];
                if (patched >= toBePatched) {
                    unmount(prevChild);
                    continue;
                }
                var newIndex = void 0;
                if (prevChild.key != null) {
                    newIndex = keyToNewIndexMap.get(prevChild.key);
                }
                else {
                    for (j = s2; j <= e2; j++) {
                        if (newIndexToOldIndexMap[j - s2] === 0 &&
                            isSameVNodeType(prevChild, c2[j])) {
                            newIndex = j;
                            break;
                        }
                    }
                }
                if (newIndex === undefined) {
                    unmount(prevChild);
                }
                else {
                    newIndexToOldIndexMap[newIndex - s2] = i + 1;
                    if (newIndex >= maxNewIndexSoFar) {
                        maxNewIndexSoFar = newIndex;
                    }
                    else {
                        moved = true;
                    }
                    patch(prevChild, c2[newIndex], container, null);
                    patched++;
                }
            }
            // 5.3 剩余旧节点遍历完毕后, 移动和挂载新节点
            var increasingNewIndexSequence = moved
                ? getSequence(newIndexToOldIndexMap)
                : [];
            j = increasingNewIndexSequence.length - 1;
            for (i = toBePatched - 1; i >= 0; i--) {
                var nextIndex = s2 + i;
                var nextChild = c2[nextIndex];
                var anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : parentAnchor;
                if (newIndexToOldIndexMap[i] === 0) {
                    patch(null, nextChild, container, anchor);
                }
                else if (moved) {
                    if (j < 0 || i !== increasingNewIndexSequence[j]) {
                        move(nextChild, container, anchor);
                    }
                    else {
                        j--;
                    }
                }
            }
        }
    };
    var patchProps = function (el, vnode, oldProps, newProps) {
        if (oldProps !== newProps) {
            if (oldProps !== EMPTY_OBJ) {
                for (var key in oldProps) {
                    if (!(key in newProps)) {
                        hostPatchProp(el, key, oldProps[key], null);
                    }
                }
            }
            for (var key in newProps) {
                var next = newProps[key];
                var prev = oldProps[key];
                if (next !== prev) {
                    hostPatchProp(el, key, prev, next);
                }
            }
        }
    };
    var move = function (vnode, container, anchor) {
        var el = vnode.el;
        hostInsert(el, container, anchor);
    };
    var unmount = function (vnode) {
        hostRemove(vnode.el);
    };
    var render = function (vnode, container) {
        if (vnode == null) {
            if (container._vnode) {
                unmount(container._vnode);
            }
        }
        else {
            patch(container._vnode || null, vnode, container);
        }
        container._vnode = vnode;
    };
    return {
        render: render,
        createApp: createAppAPI(render)
    };
}
function getSequence(nums) {
    var len = 1;
    var length = nums.length;
    var d = new Array(nums.length + 1);
    d[len] = 0;
    for (var i = 1; i < length; i++) {
        var num = nums[i];
        if (nums[d[len]] < num) {
            d[++len] = i;
        }
        else {
            var left = 1;
            var right = len;
            var pos = 0;
            while (left <= right) {
                var middle = (left + right) >> 1;
                if (nums[d[middle]] < num) {
                    pos = middle;
                    left = middle + 1;
                }
                else {
                    right = middle - 1;
                }
            }
            d[pos + 1] = i;
        }
    }
    return d.filter(function (i) { return i != null; });
}

var renderer;
var rendererOptions = extend({ patchProp: patchProp }, nodeOps);
function ensureRenderer() {
    return renderer || (renderer = createRenderer(rendererOptions));
}
var render = function () {
    var _a;
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    (_a = ensureRenderer()).render.apply(_a, __spreadArray([], __read(args), false));
};
var createApp = function () {
    var _a;
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var app = (_a = ensureRenderer()).createApp.apply(_a, __spreadArray([], __read(args), false));
    var mount = app.mount;
    app.mount = function (containerOrSelector) {
        var container = normalizeContainer(containerOrSelector);
        if (!container) {
            console.log('容器必须存在');
            return;
        }
        mount(container);
    };
    return app;
};
function normalizeContainer(container) {
    if (isString(container)) {
        var res = document.querySelector(container);
        return res;
    }
    return container;
}

function h(type, propsOrChildren, children) {
    var l = arguments.length;
    if (l === 2) {
        if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
            if (isVNode(propsOrChildren)) {
                return createVNode(type, null, [propsOrChildren]);
            }
            return createVNode(type, propsOrChildren);
        }
        else {
            return createVNode(type, null, propsOrChildren);
        }
    }
    else {
        if (l > 3) {
            children = Array.prototype.slice.call(arguments, 2);
        }
        else if (l === 3 && isVNode(children)) {
            children = [children];
        }
        return createVNode(type, propsOrChildren, children);
    }
}

function watch(source, cb, options) {
    return doWatch(source, cb, options);
}
function doWatch(source, cb, _a) {
    var _b = _a === void 0 ? {} : _a, deep = _b.deep, flush = _b.flush, immediate = _b.immediate;
    var getter;
    if (isReactive(source)) {
        getter = function () { return source; };
        deep = true;
    }
    else if (isFunction(source)) {
        getter = function () { return source(); };
    }
    else {
        getter = function () { };
    }
    if (cb && deep) {
        var baseGetter_1 = getter;
        getter = function () { return traverse(baseGetter_1()); };
    }
    var oldValue = {};
    var job = function () {
        if (cb) {
            var newValue = effect.run();
            if (deep || hashChanged(newValue, oldValue)) {
                cb(newValue, oldValue);
                oldValue = newValue;
            }
        }
    };
    var scheduler;
    if (flush === 'sync') {
        scheduler = job;
    }
    else if (flush === 'post') {
        scheduler = job;
    }
    else {
        scheduler = function () { return queueJob(job); };
    }
    var effect = new ReactiveEffect(getter, scheduler);
    if (cb) {
        if (immediate) {
            job();
        }
        else {
            oldValue = effect.run();
        }
    }
    else {
        effect.run();
    }
    var unWatch = function () {
        effect.stop();
    };
    return unWatch;
}
function traverse(value, seen) {
    if (!isObject(value)) {
        return value;
    }
    seen = seen || new Set();
    if (seen.has(value)) {
        return value;
    }
    seen.add(value);
    if (isRef(value)) {
        traverse(value.value, seen);
    }
    else if (Array.isArray(value)) {
        for (var i = 0; i < value.length; i++) {
            traverse(value[i], seen);
        }
    }
    for (var key in value) {
        traverse(value[key], seen);
    }
    return value;
}

export { Comment, EMPTY_ARR, EMPTY_OBJ, Fragment, Text, baseCreateRenderer, cloneIfMounted, compileToFunction as compile, computed, createApp, createCommentVNode, createVNode as createElementVNode, createRenderer, createVNode, effect, extend, flushJobs, flushPostFlushCbs, h, hashChanged, isArray, isFunction, isObject, isOn, isSameVNodeType, isString, isVNode, normalizeChildren, normalizeVNode, queueFlush, queueJob, queuePostFlushCb, reactive, ref, render, toDisplayString, traverse, watch };
//# sourceMappingURL=vue.js.map
