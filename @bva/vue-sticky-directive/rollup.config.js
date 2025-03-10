import { babel } from '@rollup/plugin-babel';

export default {
  input: './src/index.js',
  output: {
    file: './vue-sticky-directive.js',
    name: 'VueStickyDirective',
    format: 'umd',
  },
  plugins: [babel({ babelHelpers: 'bundled' })],
}
