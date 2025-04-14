const path = require('path')

module.exports = (env, argv) => {
  const mode = argv.mode

  return {
    mode,
    entry: './src/index.js',
    target: 'node',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'index.js',
      libraryTarget: 'commonjs2',
      clean: true,
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [['@babel/preset-env', { targets: { node: '14' } }]],
            },
          },
        },
      ],
    },
    externals: [/^[a-z\-0-9]+$/],
    resolve: {
      extensions: ['.js'],
    },
    optimization: {
      minimize: true,
    },
  }
}
