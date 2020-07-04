import urlResolve from 'rollup-plugin-url-resolve';

export default {
  input: 'src/languages/javascript.js',
  output: {
    file: 'build/languages/javascript.js',
    format: 'esm'
  },
  plugins: [urlResolve()]
};
