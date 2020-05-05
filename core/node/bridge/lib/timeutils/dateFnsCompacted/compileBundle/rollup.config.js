import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'index.js',
  output: {
    file: 'output/dateFnsCompactedBundle.js',
    format: 'es'
  },
  plugins: [resolve(), terser()]
};
