const path = require('path');
const UselessAnalyzerWebpackPlugin = require('../dist/index.min.js');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  plugins: [
    new UselessAnalyzerWebpackPlugin({
      src: './',
      debug: true,
    }),
  ],
};
