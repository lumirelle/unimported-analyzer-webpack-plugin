# Unimported Analyzer Webpack Plugin

这是一个用于分析项目中**未导入代码文件**的 Webpack 插件，支持 Webpack 4 和 5。

This is a Webpack plugin for analyzing **unimported files** in a project, supporting Webpack 4 and 5.

## 😎 功能特点 / Features

- 支持 Webpack 4 和 5 / Support Webpack 4 and 5
- 内置预设, 开箱即用 / Built-in presets, out of the box
- 灵活可配置 / Flexible and configurable

## 🔧 安装 / Installation

```bash
npm install unimported-analyzer-webpack-plugin@latest -D
# or
pnpm add unimported-analyzer-webpack-plugin@latest -D
```

## 🧠 使用方法 / Usage

### 指南 / Guide

> 在生产环境中，Webpack会积极地对未导入的文件进行树摇优化。
> 如果一个文件确实未导入，它可能会被完全排除在编译过程之外，所以插件会“看不到”它。
> 正因如此，插件只会在 `mode === development` 时生效。
>
> In production, Webpack aggressively tree-shakes and eliminates unimported files.
> If a file is truly unimported, it might be excluded from the compilation entirely, so the plugin won’t "see" it.
> That is why the plugin just take effect when `mode === development`

在你的 webpack 配置文件中：

In your webpack config file:

```javascript
const UnimportedAnalyzerWebpackPlugin = require('unimported-analyzer-webpack-plugin')

module.exports = {
  // ...

  plugins: [
    // ...
    new UnimportedAnalyzerWebpackPlugin({
      // 插件选项 ... / Plugin options ...
    }),
  ],

  // ...
}
```

### 示例 / Example

选项 / Options:

webpack.config.js

```js
// TODO: Need example
```

vue.config.js

```js
// TODO: Need example
```

nuxt.config.js

```js
import UnimportedAnalyzerWebpackPlugin from 'unimported-analyzer-webpack-plugin'

export default {
  // ...

  build: {
    plugins: [
      new UnimportedAnalyzerWebpackPlugin({
        preset: 'nuxt',
        ignores: [
          // 添加你需要忽略的文件... / Add files you need to ignore...
        ],
        important: [
          // 添加你不想忽略的文件... / Add files you don't want to ignore...
        ],
      })
    ]
  }

  // ...
}
```

输出 / Output:

```json
[
  "src/utils/unimported.js",
  "assets/styles/unimported.css",
  "assets/images/unimported.png"
]
```

## 👀 插件选项 / Plugin Options

```ts
/**
 * @description 插件选项接口定义 / Plugin Options Interface Definition
 */
export interface Options {
  /**
   * @description 选项预设，必须是以下选项之一：
   *
   * - `common`: 通用
   * - `webpack`: Webpack 项目
   * - `vue`: Vue 2 项目
   * - `nuxt`: Nuxt 2 项目
   *
   * @description Options preset, must be one of the following:
   *
   * - `common`: For commonly usage
   * - `webpack`: For Webpack project
   * - `vue`: For Vue 2 project
   * - `nuxt`: For Nuxt 2 project
   *
   * @default 'common'
   */
  preset: string

  /**
   * @description 源文件的位置
   *
   * @description Where are the source files located
   *
   * @default 取决于预设 / Depends on preset
   */
  src: string

  /**
   * @description 要忽略的文件，支持 glob 模式，会同预设提供的默认 ignores 合并
   *
   * @description Files to ignore, support glob pattern. These will merge with
   * the default ignores provided by preset
   *
   * @default 取决于预设 / Depends on preset
   */
  ignores: string[]

  /**
   * @description 不允许忽略的文件，支持 glob 模式
   *
   * @description Files that are not allowed to be ignored, support glob pattern
   *
   * @default undefined
   */
  important: string[]

  /**
   * @description 在哪里保存未导入文件的检测报告
   *
   * @description Where to save the detection report of unimported files
   *
   * @default '.unimported/unimported-files.json'
   */
  output: string

  /**
   * @description 是否显示控制台输出
   *
   * @description Whether to show console output
   *
   * @default false
   */
  debug: boolean
}
```

### 预设 / Presets

```js
/**
 * 默认选项。 / Default options.
 */
const DEFAULT_OPTIONS = {
  preset: 'common',
  /**
   * 默认忽略项，会合并到预设忽略项中。 / Default ignores, will be merged with any other preset ignores.
   */
  ignores: [
    // node_modules & 构建输出 / node_modules & build output
    'node_modules/**/*',
    'dist/**/*',
    'build/**/*',
    'bin/**/*',
    // 配置文件 / config files
    '*.config.*',
    // 配置 / profiles
    '*.properties',
    '*.json',
    '*.yaml',
    '*.yml',
    '*.toml',
    // 包管理器文件 / package manager files
    'package.json',
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    'pnpm-workspace.yaml',
    'bun.lockb',
    // 点文件夹和文件 / dot dirs & dot files
    '.*/**/*',
    '**/.*',
    // 文档文件 / documentation files
    '**/*.md',
    '**/*.txt',
    '**/LICENSE',
    // 脚本 / scripts
    '**/*.sh',
    '**/*.bat',
    '**/*.ps1',
    'sudo',
    // 非源码文件 / non-source files
    '**/*.d.ts',
    '**/*.map',
    '**/*.min.*',
  ],
  important: [],
  output: '.unimported/unimported-files.json',
  debug: false,
}

/**
 * 预设选项。 / Preset options.
 */
const PRESET_OPTIONS = {
  /**
   * 通用预设 —— 默认 / Common preset -- Default
   */
  common: {
    src: './',
    ignores: [
      ...DEFAULT_OPTIONS.ignores
    ],
    important: DEFAULT_OPTIONS.important,
    output: DEFAULT_OPTIONS.output,
    debug: DEFAULT_OPTIONS.debug,
  },

  /**
   * Webpack 预设 / Webpack preset
   */
  webpack: {
    src: './src',
    ignores: [
      ...DEFAULT_OPTIONS.ignores
    ],
    important: DEFAULT_OPTIONS.important,
    output: DEFAULT_OPTIONS.output,
    debug: DEFAULT_OPTIONS.debug,
  },

  /**
   * Vue 预设 / Vue preset
   */
  vue: {
    src: './src',
    ignores: [
      ...DEFAULT_OPTIONS.ignores
    ],
    important: DEFAULT_OPTIONS.important,
    output: DEFAULT_OPTIONS.output,
    debug: DEFAULT_OPTIONS.debug,
  },

  /**
   * Nuxt 预设 / Nuxt preset
   */
  nuxt: {
    src: './',
    ignores: [
      ...DEFAULT_OPTIONS.ignores,
      'app/**/*',
      'modules/**/*',
      'router/**/*',
      'app.html',
    ],
    important: DEFAULT_OPTIONS.important,
    output: DEFAULT_OPTIONS.output,
    debug: DEFAULT_OPTIONS.debug,
  },
}
```

## 🔞 注意事项 / Attention

- 插件会在 webpack 构建完成后执行 / The plugin will be executed after the webpack build is complete
- 输出文件中的路径是相对于你设置给 `src` 选项的路径 / The path in the output file is relative to the path you set for the 'src' option

## 📝 发布日志 / Release Note

### v0.0.0

#### v0.0.x

- v0.0.1: Based on the old package [useless-analyzer-webpack-plugin](https://www.npmjs.com/package/useless-analyzer-webpack-plugin), support the detection of resources and rename to `unimported-analyzer` for better semantics.

## 🚫 已知问题 / Known Issues

- [ ] Nuxt 项目中的 `.scss` 检测 / `.scss` files detection in Nuxt project

  描述 / Description：

  Nuxt 项目中，`.vue` 文件导入的 `.scss` 文件误识别为未使用文件 / In the Nuxt project, the `.scss` file imported from the `.vue` file was incorrectly identified as an unused file

  临时方案 / Temporary Solution：

  暂时将 `.scss` 文件添加至排除项 / Temporarily add the `.scss` file to ignores
