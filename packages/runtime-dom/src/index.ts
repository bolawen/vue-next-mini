import { nodeOps } from './nodeOps';
import { extend } from '@vue/shared';
import { patchProp } from './patchProp';
import { createRenderer } from 'packages/runtime-core/src/renderer';

let renderer;
const rendererOptions = extend({ patchProp }, nodeOps);

function ensureRenderer() {
  return renderer || (renderer = createRenderer(rendererOptions));
}

export const render = (...args) => {
  ensureRenderer().render(...args);
};
