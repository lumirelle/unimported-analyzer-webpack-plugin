const path = require('node:path')

module.exports = (env, argv) => {
  const mode = argv.mode

  return {
    mode,
    entry: './src/index.js',
    target: 'node18',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'index.js',
      libraryTarget: 'commonjs2',
      clean: true,
    },
  }
}
