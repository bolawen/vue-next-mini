import { isOn } from '@vue/shared';
import { RendererOptions } from 'vue';
import { patchClass } from './modules/class';

type DomRendererOptions = RendererOptions<Node, Element>;

export const patchProp: DomRendererOptions['patchProp'] = (
  el,
  key,
  prevValue,
  nextValue
) => {
  if (key === 'class') {
    patchClass(el, nextValue);
  } else if (key === 'style') {
  } else if (isOn(key)) {
  } else {
  }
};
