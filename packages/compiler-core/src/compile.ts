import { extend } from '@vue/shared';
import { baseParse } from './parse';
import { transform } from './transform';
import { transformText } from './transforms/transformText';
import { transformElement } from './transforms/transformElement';
import { generate } from './codegen';

export function baseCompile(template, options = {}) {
  const ast = baseParse(template);

  transform(
    ast,
    extend(options, {
      nodeTransforms: [transformElement, transformText]
    })
  );

  return generate(ast);
}
