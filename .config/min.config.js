import { terser } from "rollup-plugin-terser";
import copy from 'rollup-plugin-copy'

export default {
  input: 'src/wc-code.js',
  output: {
    file: 'build/index.min.js',
    format: 'esm'
  },
  plugins: [terser(), copy({
    targets: [{src: 'src/languages', dest: 'build'}]
  })]
};
