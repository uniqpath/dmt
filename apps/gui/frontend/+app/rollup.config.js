import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import replace from 'rollup-plugin-replace';

import image from '@rollup/plugin-image';

const production = !process.env.ROLLUP_WATCH;

console.log(`Production: ${production}`);

export default {
  input: 'src/main.js',
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'app',
    file: 'public/bundle.js'
  },
  plugins: [
    svelte({
      // opt in to v3 behaviour today
      skipIntroByDefault: true,
      nestedTransitions: true,

      // enable run-time checks when not in production
      dev: !production,
      // we'll extract any component CSS out into
      // a separate file  better for performance
      css: css => {
        css.write('public/bundle.css');
      }
    }),

    replace({
      'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development')
    }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration 
    // consult the documentation for details:
    // https://github.com/rollup/rollup-plugin-commonjs
    resolve(),
    commonjs(),

    // additional things: https://github.com/rollup/plugins/tree/master/packages/image
    // import images as Base64
    image(),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser()
  ]
};
