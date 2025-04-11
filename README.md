# Useless Analyzer Webpack Plugin

这是一个用于分析项目中**未导入代码文件**的 Webpack 插件，支持 Webpack 4 和 5。

This is a Webpack plugin for analyzing **unimported code files** in a project, supporting Webpack 4 and 5.

## 功能特点 / Features

- 支持 Webpack 4 和 5 / Support Webpack 4 and 5
- 内置预设, 开箱即用 / Built-in presets, out of the box
- 灵活可配置 / Flexible and configurable

## 安装 / Installation

```bash
npm install useless-analyzer-webpack-plugin -D
```

## 使用方法 / Usage

> 插件功能仅在 Webpack 非构建场景下下有效！
>
> Plugin functionality only works in Webpack non-build scenarios!

在你的 webpack 配置文件中：

In your webpack config file:

```javascript
const UselessAnalyzerWebpackPlugin = require('useless-analyzer-webpack-plugin')

module.exports = {
  // 其他 webpack 配置 ... / Other webpack configs ...

  plugins: [
    // 其他 webpack 插件 ... / Other webpack plugins ...
    new UselessAnalyzerWebpackPlugin({
      // 插件选项 ... / Plugin options ...
    }),
  ],

  // 其他 webpack 配置 ... / Other webpack configs ...
}
```

## 插件选项 / Plugin Options

### 定义 / Definition

```ts
/**
 * @description 插件选项 / Plugin Options
 */
interface Options {
  /**
   * @description 选项预设，必须是以下选项之一 / Options preset, must be one of the following:
   *
   * - `common`: 通用 / For commonly usage
   * - `vue`: Vue 项目 / For Vue project
   * - `nuxt`: Nuxt 项目 / For Nuxt project
   *
   * @default 'common'
   */
  preset: string

  /**
   * @description 源文件的位置 / Where are the source files located
   *
   * @default './' 如果你选择 `common` 预设 / If you choose `common` preset
   * @default 'src' 如果你选择 `vue` 预设 / If you choose `vue` preset
   * @default './' 如果你选择 `nuxt` 预设 / If you choose `nuxt` preset
   */
  src: string

  /**
   * @description 要忽略的文件，支持 glob 模式，会同预设提供的默认 ignores 合并 / Files to ignore, support glob pattern. These will merge with the default ignores provided by default
   */
  ignores: string[]

  /**
   * @description 在哪里保存无用的文件报告 / Where to save the useless files report
   * @default './useless/useless.json'
   */
  output: string

  /**
   * @description 是否显示控制台输出 / Whether to show console output
   */
  debug: boolean
}
```

### 示例 / Example

选项 / Options:

```js
new UselessAnalyzerWebpackPlugin({
  preset: 'nuxt',
  ignores: ['app.html', 'app/**/*', 'modules/**/*', 'router/**/*'],
  debug: false,
})
```

输出 / Output:

<!-- prettier-ignore -->
```json
[
  "src/components/UnusedComponent.js", 
  "src/utils/helper.js",
  "src/styles/old.css"
]
```

<!-- prettier-ignore-end -->

## 注意事项 / Attention

- 插件会在 webpack 构建完成后执行 / The plugin will be executed after the webpack build is complete
- 输出文件中的路径都是相对于你设置的 src 路径 / The paths in the output file are relative to the src path you set

## 发布日志 / Release Note

### v1.x.x

#### v1.0.x

- v1.0.0: Refactor
- v1.0.1: Add ignores
- v1.0.2: Update github repo url
- v1.0.3: Add release note
- v1.0.4: Add preset option

## 已知问题 / Known Issues

- [ ] Nuxt 项目中，.vue 文件导入的 .scss 文件误识别为未使用文件 / In the Nuxt project, the.scss file imported from the.vue file was incorrectly identified as an unused file
