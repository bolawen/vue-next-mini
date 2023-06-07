const product = {
  price: 10,
  quantity: 2
};

let total;
function effect() {
  total = product.price * product.quantity;
}

effect();
console.log(`总价为: ${total}`);

product.quantity = 10;
effect();
console.log(`总价为: ${total}`);

class Dep {
  deps: any[];
  constructor() {
    this.deps = [];
  }
  notify() {
    this.deps.forEach(fn => fn());
  }
}

function observer(object: { [key: string]: any }, dep: Dep) {
  Object.keys(object).forEach(key => {
    let value = object[key];
    Object.defineProperty(object, key, {
      get() {
        return value;
      },
      set(newValue) {
        dep.notify();
        value = newValue;
      }
    });
  });
}
