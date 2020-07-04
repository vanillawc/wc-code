import { terser } from "rollup-plugin-terser";
import copy from 'rollup-plugin-copy';
import urlResolve from 'rollup-plugin-url-resolve';

export default {
  input: 'src/wc-code.js',
  output: {
    file: 'build/index.min.js',
    format: 'esm'
  },
  plugins: [terser(), copy({
    targets: [{src: 'src/languages/python', dest: 'build/languages'},
              {src: 'src/wc-code.css', dest: 'build'}],
  }), urlResolve()]
};
