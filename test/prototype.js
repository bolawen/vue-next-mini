let a = [1, 2, 3];
let b = 1;

function foo(m, n) {
  m = [4, 5, 6];
  m[1] = 100;
  n = 2;
}

foo(a, b);

console.log(a); // [1,2,3]
console.log(b); // 1
