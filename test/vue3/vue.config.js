const UnimportedAnalyzerWebpackPlugin = require('../../dist/index.js')

module.exports = {
  configureWebpack: {
    plugins: [
      new UnimportedAnalyzerWebpackPlugin({
        preset: 'vue',
        debug: true,
      }),
    ],
  },
}
