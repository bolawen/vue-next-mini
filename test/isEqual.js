function isObject(value) {
  return typeof value === 'object' && value !== null;
}

function isEqual(value, other) {
  if (!isObject(value) || !isObject(other)) {
    return value === other;
  }
  const valueKeys = Object.keys(value);
  const otherKeys = Object.keys(other);
  if (valueKeys.length !== otherKeys.length) {
    return false;
  }
  for (let key in value) {
    if (!isEqual(value[key], other[key])) {
      return false;
    }
  }
  return true;
}

const object = { a: 1 };
const other = { a: 1 };
console.log(isEqual(object, other));
