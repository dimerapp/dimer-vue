/** @type {import('bili').Config} */
module.exports = {
  input: 'src/main.js',
  output: {
    dir: 'dist',
    fileName: 'dimer-vue[min].[format].js',
    format: ['cjs', 'umd', 'umd-min'],
    moduleName: 'dimerVue'
  }
}
