// function is(x, y) {
//   if (x === y) {
//     return x !== 0 || 1 / x === 1 / y;
//   } else {
//     return x !== x && y !== y;
//   }
// }

// const a = NaN;
// const b = NaN;
// console.log(is(a, b));

// const c = +0;
// const d = -0;
// console.log(c === d);
// console.log(is(c, d));
// console.log(1 / c === 1 / d);

// function isNaNSelf(a, b) {
//   return a !== a && b !== b;
// }

// console.log(isNaNSelf(NaN, NaN));

function is(a, b) {
  return a === b;
}

console.log(is(+0, -0));
