class RefImpl {
  constructor(value) {
    this._value = value;
  }
  get value() {
    console.log('访问');
    return this._value;
  }
  set value(newValue) {
    console.log('设置');
    this._value = newValue;
  }
}

// const ref = new RefImpl(5);
// console.log(ref.value);
// ref.value = 4;
// console.log(typeof ref);

const ref1 = new RefImpl({ a: 1 });
console.log(ref1.value.a);
ref1.value.a = 2;
console.log(typeof ref);
