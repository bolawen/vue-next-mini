import RollupPluginCommonjs from '@rollup/plugin-commonjs';
import RollupPluginResolve from '@rollup/plugin-node-resolve';
import RollupPluginTypescript from '@rollup/plugin-typescript';

export default [
  {
    input: 'packages/vue/src/index.ts',
    output: [
      {
        name: 'Vue',
        format: 'es',
        sourcemap: true,
        file: './packages/vue/dist/vue.js'
      }
    ],
    plugins: [
      RollupPluginResolve(),
      RollupPluginCommonjs(),
      RollupPluginTypescript({
        sourceMap: true
      })
    ]
  }
];
