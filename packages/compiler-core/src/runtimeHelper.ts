export const CREATE_VNODE = Symbol('createVNode');
export const CREATE_COMMENT = Symbol('createCommentVNode');
export const TO_DISPLAY_STRING = Symbol('to_display_string');
export const CREATE_ELEMENT_VNODE = Symbol('createElementVNode');

export const helperNameMap = {
  [CREATE_VNODE]: 'createVNode',
  [CREATE_COMMENT]: 'createCommentVNode',
  [TO_DISPLAY_STRING]: 'toDisplayString',
  [CREATE_ELEMENT_VNODE]: 'createElementVNode'
};
