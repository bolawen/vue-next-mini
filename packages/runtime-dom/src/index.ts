import { nodeOps } from './nodeOps';
import { extend, isString } from '@vue/shared';
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

export const createApp = (...args) => {
  const app = ensureRenderer().createApp(...args);

  const { mount } = app;

  app.mount = containerOrSelector => {
    const container = normalizeContainer(containerOrSelector);

    if (!container) {
      console.log('容器必须存在');
      return;
    }

    mount(container);
  };

  return app;
};

function normalizeContainer(container) {
  if (isString(container)) {
    const res = document.querySelector(container);
    return res;
  }

  return container;
}
