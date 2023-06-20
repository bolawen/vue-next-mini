const list = [false, '', 0, 2, 3, null, undefined];

console.log(list.filter(item => Boolean(item))); // [2,3]
