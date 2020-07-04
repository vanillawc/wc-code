import urlResolve from 'rollup-plugin-url-resolve';

export default {
  input: 'src/wc-code.js',
  output: {
    file: 'build/index.js',
    format: 'esm'
  },
  plugins: [urlResolve()]
};
