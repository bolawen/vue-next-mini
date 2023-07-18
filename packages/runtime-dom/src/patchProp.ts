import { isOn } from '@vue/shared';
import { patchClass } from './modules/class';

export const patchProp = (el, key, prevValue, nextValue) => {
  console.log(key);
  if (key === 'class') {
    patchClass(el, nextValue);
  } else if (key === 'style') {
  } else if (isOn(key)) {
  } else if (key[0] === '.') {
  } else {
  }
};
