export const CREATE_VNODE = Symbol('createVNode');
export const TO_DISPLAY_STRING = Symbol('to_display_string');
export const CREATE_ELEMENT_VNODE = Symbol('createElementVNode');

export const helperNameMap = {
  [CREATE_VNODE]: 'createVNode',
  [TO_DISPLAY_STRING]: 'toDisplayString',
  [CREATE_ELEMENT_VNODE]: 'createElementVNode'
};
