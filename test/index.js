const o = (function () {
  const obj = {
    a: 1,
    b: 2
  };
  Object.setPrototypeOf(obj, null);
  return {
    get(key) {
      return obj[key];
    }
  };
})();

console.log(o.get('a'));

// 问题一、如何在不修改 o 代码的情况下,修改 obj 对象
// 解决思路: 需要在访问 o.get() 的时候拿到 obj 对象

Object.defineProperty(Object.prototype, 'self', {
  get() {
    return this;
  }
});

const obj = o.get('self');
console.log(obj);
obj.c = 3;
console.log(o.get('c'));

// 那么，如何避免这种情况呢？

// 方案一、验证 key 是否为对象自身属性

// 方案二、设置 obj 的原型为空
