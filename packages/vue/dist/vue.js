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

var EMPTY_OBJ = {};
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

var patchProp = function (el, key, prevValue, nextValue) {
    if (key === 'class') {
        patchClass(el, nextValue);
    }
};

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

var Text$1 = Symbol.for('v-text');
var Comment$1 = Symbol.for('v-cmt');
var Fragment = Symbol.for('v-fgt');
function isVNode(value) {
    return value ? value.__v_isVNode === true : false;
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
        shapeFlag: shapeFlag
    };
    normalizeChildren(vnode, children);
    return vnode;
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

function createRenderer(options) {
    return baseCreateRenderer(options);
}
function baseCreateRenderer(options) {
    var hostInsert = options.insert, hostPatchProp = options.patchProp, hostCreateElement = options.createElement, hostSetElementText = options.setElementText;
    var patch = function (n1, n2, container, anchor) {
        if (anchor === void 0) { anchor = null; }
        if (n1 === n2) {
            return;
        }
        var type = n2.type, shapeFlag = n2.shapeFlag;
        switch (type) {
            case Text:
                break;
            case Comment:
                break;
            case Fragment:
                break;
            default:
                if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                    processElement(n1, n2, container, anchor);
                }
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
    var mountElement = function (vnode, container, anchor) {
        var el;
        var type = vnode.type, props = vnode.props, shapeFlag = vnode.shapeFlag;
        // 1. 创建 Element
        el = vnode.el = hostCreateElement(type);
        if (shapeFlag & 8 /* ShapeFlags.TEXT_CHILDREN */) {
            // 2. 设置 Text
            hostSetElementText(el, vnode.children);
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
        var el = (n1.el = n2.el);
        var oldProps = n1.props || EMPTY_OBJ;
        var newProps = n2.props || EMPTY_OBJ;
        patchChildren(n1, n2, el);
        patchProps(el, n2, oldProps, newProps);
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
            if (prevShapFlag & 16 /* ShapeFlags.ARRAY_CHILDREN */) ;
            else {
                if (prevShapFlag & 8 /* ShapeFlags.TEXT_CHILDREN */) {
                    // 新节点不为文本节点 && 旧节点为文本节点 则下载旧子节点
                    hostSetElementText(container, '');
                }
            }
        }
    };
    var patchProps = function (el, vnode, oldProps, newProps) {
        if (oldProps !== newProps) {
            for (var key in newProps) {
                var next = newProps[key];
                var prev = oldProps[key];
                if (next !== prev) {
                    hostPatchProp(el, key, prev, next);
                }
            }
            if (oldProps !== EMPTY_OBJ) {
                for (var key in oldProps) {
                    if (!(key in newProps)) {
                        hostPatchProp(el, key, oldProps[key], null);
                    }
                }
            }
        }
    };
    var render = function (vnode, container) {
        if (vnode == null) ;
        else {
            patch(container.vnode || null, vnode, container);
        }
        container._vnode = vnode;
    };
    return {
        render: render
    };
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

function h(type, propsOrChildren, children) {
    var l = arguments.length;
    if (l === 2) {
        if (isObject(propsOrChildren) && !Array.isArray(propsOrChildren)) {
            if (isVNode(propsOrChildren)) {
                return createVNode(type, null, [propsOrChildren]);
            }
            return createVNode(type, propsOrChildren);
        }
        else {
            return createVNode(type, propsOrChildren);
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

export { Comment$1 as Comment, Fragment, Text$1 as Text, baseCreateRenderer, computed, createRenderer, createVNode, effect, flushJobs, flushPostFlushCbs, h, isVNode, normalizeChildren, queueFlush, queueJob, queuePostFlushCb, reactive, ref, render, traverse, watch };
//# sourceMappingURL=vue.js.map
