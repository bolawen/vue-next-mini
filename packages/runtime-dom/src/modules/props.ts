export function patchDOMProp(el, key, value) {
  el[key] = value == null ? '' : value;
  return;
}
