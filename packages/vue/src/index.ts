let quantity = 2;
const product = {
  price: 10,
  quantity: quantity
};

function computed() {
  return product.price * product.quantity;
}

Object.defineProperty(product, 'quantity', {
  get() {
    return quantity;
  },
  set(value) {
    quantity = value;
    computed();
  }
});

product.quantity = 2;
console.log(`总价为: ${computed()}`);
product.quantity = 10;
console.log(`总价为: ${computed()}`);
