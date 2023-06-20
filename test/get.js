function get(obj, path, defaultValue = undefined) {
  const travel = regExp => {
    const pathKeyList = String.prototype.split
      .call(path, regExp)
      .filter(Boolean);
    return pathKeyList.reduce((prev, curr) => {
      return curr !== null && prev !== undefined ? prev[curr] : prev;
    }, obj);
  };
  const result = travel(/[,[\].]+?/);
  return result === undefined || result === obj ? defaultValue : result;
}

const obj = {
  a: 1,
  b: {
    c: {
      d: [1, 2, 3]
    }
  }
};

console.log('obj 数组', get(obj, ['b', 'c', 'd[1]']));
console.log('obj 字符串', get(obj, 'b.c.d[1]'));

const obj1 = { a: [{ b: { c: 3 } }] };
console.log('obj1 数组', get(obj1, ['a', '0', 'b', 'c'], 1));
console.log('obj1 数组', get(obj1, ['a[0]', 'b', 'c'], 1));
console.log('obj1 字符串', get(obj1, 'a[0].b.c', 1));
