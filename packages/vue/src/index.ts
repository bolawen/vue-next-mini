let quantity = 2;
const product = {
  price: 10,
  quantity: quantity,
  a() {
    console.log(this);
  }
};

const proxyProduct = new Proxy(product, {
  get(target, property, receiver) {
    return Reflect.get(target, property, receiver);
  },
  set(target, property, value, receiver) {
    const result = Reflect.set(target, property, value, receiver);
    computed();
    return result;
  }
});

function computed() {
  return proxyProduct.price * proxyProduct.quantity;
}

proxyProduct.a();
proxyProduct.quantity = 2;
console.log(`总价为: ${computed()}`);
proxyProduct.quantity = 10;
console.log(`总价为: ${computed()}`);
