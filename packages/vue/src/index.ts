let quantity = 2;
const product = {
  price: 10,
  quantity: quantity
};

let total;
function effect() {
  total = product.price * product.quantity;
}

Object.defineProperty(product, 'quantity', {
  get() {
    return quantity;
  },
  set(value) {
    quantity = value;
    effect();
  }
});

console.log(`总价为: ${total}`);
product.quantity = 10;
console.log(`总价为: ${total}`);
