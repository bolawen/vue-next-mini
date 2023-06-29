(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Vue = {}));
})(this, (function (exports) { 'use strict';

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

    exports.computed = computed;
    exports.effect = effect;
    exports.flushJobs = flushJobs;
    exports.flushPostFlushCbs = flushPostFlushCbs;
    exports.queueFlush = queueFlush;
    exports.queueJob = queueJob;
    exports.queuePostFlushCb = queuePostFlushCb;
    exports.reactive = reactive;
    exports.ref = ref;
    exports.traverse = traverse;
    exports.watch = watch;

}));
//# sourceMappingURL=vue.js.map
