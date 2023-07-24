export function patchEvent(el, rawName, prevValue, nextValue) {
  const invokers = el._vei || (el._vei = {});
  const existingInvoker = invokers[rawName];
  if (nextValue && existingInvoker) {
    existingInvoker.value = nextValue;
  } else {
    const name = parseName(rawName);
    if (nextValue) {
      const invoker = (invokers[rawName] = createInvoker(nextValue));
      el.addEventListener(name, invoker);
    } else if (existingInvoker) {
      el.removeEventListener(name, existingInvoker);
      invokers[rawName] = undefined;
    }
  }
}

function parseName(name) {
  return name.slice(2).toLowerCase();
}

function createInvoker(initialValue) {
  const invoker = e => {
    invoker.value && invoker.value();
  };

  invoker.value = initialValue;
  return invoker;
}
