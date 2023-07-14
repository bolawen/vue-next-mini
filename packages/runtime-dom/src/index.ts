import { nodeOps } from './nodeOps';
import { extend } from '@vue/shared';
import { patchProp } from './patchProp';
import {
  Renderer,
  RootRenderFunction,
  createRenderer
} from 'packages/runtime-core/src/renderer';

let renderer: Renderer<Element | ShadowRoot>;
const rendererOptions = extend({ patchProp }, nodeOps);

function ensureRenderer() {
  return renderer || (renderer = createRenderer(rendererOptions));
}

export const render: RootRenderFunction<Element | ShadowRoot> = (...args) => {
  ensureRenderer().render(...args);
};
