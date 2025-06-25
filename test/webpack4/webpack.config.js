const path = require('node:path')
const UnimportedAnalyzerWebpackPlugin = require('../../dist/index.js')

module.exports = (env, argv) => {
  const mode = argv.mode

  return {
    mode,
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle.js',
    },
    plugins: [
      new UnimportedAnalyzerWebpackPlugin({
        preset: 'webpack',
        debug: true,
      }),
    ],
  }
}
