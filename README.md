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

> 插件功能仅在 Webpack Build `mode === development` 场景下有效！
>
> Plugin function only works in Webpack Build `mode === development` scenario!

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
   * @default 取决于预设
   *
   * @description Where are the source files located
   *
   * @default Depends on preset
   */
  src: string

  /**
   * @description 要忽略的文件，支持 glob 模式，会同预设提供的默认 ignores 合并
   *
   * @default 取决于预设
   *
   * @description Files to ignore, support glob pattern. These will merge with
   * the default ignores provided by preset
   *
   * @default Depends on preset
   */
  ignores: string[]

  /**
   * @description 不允许忽略的文件，支持 glob 模式
   *
   *
   * @description Files that are not allowed to be ignored, support glob pattern
   *
   * @default undefined
   */
  important: string[]

  /**
   * @description 在哪里保存无用的文件报告
   *
   * @description Where to save the useless files report
   *
   * @default './useless/useless.json'
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
 * Default options.
 */
const DEFAULT_OPTIONS = {
  preset: 'common',
  /**
   * Default ignores, will be merged with any other preset ignores.
   */
  ignores: [
    // node_modules & build output
    'node_modules/**/*',
    'dist/**/*',
    'build/**/*',
    // config files
    '*.config.js',
    '*.config.ts',
    '*.config.json',
    '*.config.yaml',
    '*.config.yml',
    '*.config.toml',
    // tool profiles
    'sonar-project.properties',
    'jsconfig.json',
    // package manager files
    'package.json',
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    // dot files & dot dirs
    '**/.*',
    // documentation files
    '**/*.md',
    '**/*.txt',
    '**/LICENSE',
    // resources
    'assets/**/*',
    'public/**/*',
    'static/**/*',
    // scripts
    '**/*.sh',
    '**/*.bat',
    '**/*.ps1',
    'sudo',
    // non-source files
    '**/*.d.ts',
    '**/*.map',
    '**/*.min.*',
  ],
  output: '.useless/unused-files.json',
  debug: false,
}

/**
 * Preset options.
 */
const PRESET_OPTIONS = {
  /**
   * Common preset -- Default
   */
  common: {
    src: './',
    ignores: [...DEFAULT_OPTIONS.ignores],
    output: DEFAULT_OPTIONS.output,
    debug: DEFAULT_OPTIONS.debug,
  },

  /**
   * Webpack preset
   */
  webpack: {
    src: './src',
    ignores: [...DEFAULT_OPTIONS.ignores],
    output: DEFAULT_OPTIONS.output,
    debug: DEFAULT_OPTIONS.debug,
  },

  /**
   * Vue preset
   */
  vue: {
    src: './src',
    ignores: [...DEFAULT_OPTIONS.ignores],
    output: DEFAULT_OPTIONS.output,
    debug: DEFAULT_OPTIONS.debug,
  },

  /**
   * Nuxt preset
   */
  nuxt: {
    src: './',
    ignores: [...DEFAULT_OPTIONS.ignores, '.nuxt/**/*', 'app/**/*', 'modules/**/*', 'router/**/*'],
    output: DEFAULT_OPTIONS.output,
    debug: DEFAULT_OPTIONS.debug,
  },
}
```

### 示例 / Example

选项 / Options:

```js
// Webpack project
new UselessAnalyzerWebpackPlugin({
  preset: 'webpack',
  ignores: [
    // 添加你需要忽略的文件... / Add files you need to ignore...
  ],
  important: [
    // 添加你不想忽略的文件... / Add files you don't want to ignore...
  ],
})

// Vue project
new UselessAnalyzerWebpackPlugin({
  preset: 'vue',
  ignores: [
    // 添加你需要忽略的文件... / Add files you need to ignore...
  ],
  important: [
    // 添加你不想忽略的文件... / Add files you don't want to ignore...
  ],
})

// Nuxt 2 project
new UselessAnalyzerWebpackPlugin({
  preset: 'nuxt',
  ignores: [
    // 添加你需要忽略的文件... / Add files you need to ignore...
  ],
  important: [
    // 添加你不想忽略的文件... / Add files you don't want to ignore...
  ],
})
```

输出 / Output:

<!-- prettier-ignore -->
```json
[
  "assets/styles/old.css"
  "src/components/UnusedComponent.vue", 
  "src/api/deprecated.js",
  "src/utils/useless.js",
]
```

<!-- prettier-ignore-end -->

## 注意事项 / Attention

- 插件会在 webpack 构建完成后执行 / The plugin will be executed after the webpack build is complete
- 输出文件中的路径是相对于你设置的 src 路径的 / The paths in the output file are relative to the src path you set

## 发布日志 / Release Note

### v1.x.x

#### v1.0.x

- v1.0.0: Refactor
- v1.0.1: Add ignores
- v1.0.2: Update github repo url
- v1.0.3: Add release note
- v1.0.4 ~ v1.0.5: Add preset option
- v1.0.6: Improving document
- v1.0.7: Add important option & other improvements

## 已知问题 / Known Issues

- [ ] Nuxt 项目中，.vue 文件导入的 .scss 文件误识别为未使用文件 / In the Nuxt project, the.scss file imported from the.vue file was incorrectly identified as an unused file
