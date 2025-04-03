# Useless Analyzer Webpack Plugin

这是一个用于分析项目中**未导入**文件的 webpack 插件，支持 webpack 4 和 5。

This is a webpack plugin for analyzing **unimported** files in projects and supports webpack 4 and 5.

## 功能特点 Features

- 支持 webpack 4 和 5
- 可配置源文件目录
- 内置基础排除目录，可配置额外排除目录
- 可配置输出文件路径
- 输出结果使用 JSON 格式
- 开箱即用

- Support webpack 4 and 5
- Configurable source file directory
- Built-in basic exclusion directory, additional exclusion directories can be configured
- Configurable output file path
- The output results are in JSON format
- Out of the box

## 安装 Installation

```bash
npm install useless-analyzer-webpack-plugin -D
```

## 使用方法 Usage

> 插件功能仅在开发环境下有效！

在你的 webpack 配置文件中：

```javascript
const UselessAnalyzerWebpackPlugin = require('useless-analyzer-webpack-plugin')

module.exports = {
  // ... 其他 webpack 配置
  plugins: [
    new UselessAnalyzerWebpackPlugin({
      src: 'src', // 源文件目录，默认为 'src'
      additionIgnores: [
        // 插件已内置基础排除列表，这里可以设置额外排除的目录或文件，使用 glob 模式
        '**/targets/**/*', // 例如：排除所有 targets 文件夹下的所有文件
        'app.html', // 例如：排除 app.html
      ],
      output: '.useless/unused-files.json', // 输出文件路径，默认为 '.useless/unused-files.json'
      debug: false, // 是否显示调试输出，默认为 'false'
    }),
  ],
}
```

> Plugin function only works in development environment!

In your webpack config file:

```javascript
const UselessAnalyzerWebpackPlugin = require('useless-analyzer-webpack-plugin')

module.exports = {
  // ... Other webpack configs
  plugins: [
    new UselessAnalyzerWebpackPlugin({
      src: 'src', // Source dir, default: 'src'
      additionIgnores: [
        // Plugin has a built-in base exclusion list, where you can set additional excluded directories or files, using glob mode
        '**/targets/**/*', // For example, exclude all files in the targets folder
        'app.html', // For example, exclude app.html
      ],
      output: '.useless/unused-files.json', // Output file path, default: '.useless/unused-files.json'
      debug: false, // Whether to show debug log, default: 'false'
    }),
  ],
}
```

## 配置示例（Nuxt.js 2） Configuration Example (Nuxt.js 2)

nuxt.config.js

```js
export default {
  // ...
  build: {
    // ...
    plugins: [
      new UselessAnalyzerWebpackPlugin({
        src: './',
        additionIgnores: ['app.html', 'app/**/*', 'modules/**/*', 'router/**/*'],
        debug: false,
      }),
    ],
  },
}
```

## 输出示例 Output Example

```json
["src/components/UnusedComponent.js", "src/utils/helper.js", "src/styles/old.css"]
```

## 注意事项 Note

- 插件会在 webpack 构建完成后执行
- 输出文件中的路径都是相对于你设置的 src 路径

- The plugin will be executed after the webpack build is complete
- The paths in the output file are relative to the src path you set
