import { babel } from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';

export default {
  input: './src/index.js',
  output: {
    file: './stickie.js',
    name: 'Stickie',
    format: 'umd',
  },
  plugins: [babel({ babelHelpers: 'bundled' }), terser()],
}
