import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import builtinModules from 'builtin-modules';

export default [
  {
    input: 'src/client/index.js',
    plugins: [nodeResolve({ preferBuiltins: false, browser: true }), commonjs()],
    output: [
      {
        format: 'esm',
        file: 'dist/index.mjs'
      },
      {
        format: 'cjs',
        file: 'dist/index.js'
      }
    ],
    onwarn: (warning, defaultHandler) => {
      if (warning.code === 'THIS_IS_UNDEFINED') return;
      defaultHandler(warning);
    }
  },
  {
    input: 'src/server/index.js',
    external: builtinModules,
    plugins: [nodeResolve({ preferBuiltins: true }), commonjs()],
    output: [
      {
        format: 'esm',
        file: 'server/index.mjs'
      },
      {
        format: 'cjs',
        file: 'server/index.js'
      }
    ]
  }
];
