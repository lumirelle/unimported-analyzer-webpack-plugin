const fs = require('fs')
const path = require('path')
const glob = require('glob')

/**
 * Default options.
 */
const DEFAULT_OPTIONS = {
  preset: 'common',

  output: '.useless/unused-files.json',
  debug: false,
}

/**
 * Preset options.
 */
const PRESET_OPTIONS = {
  /**
   * Common preset
   */
  common: {
    src: './',
    /**
     * Common ignores, will be merged with any other preset ignores.
     */
    ignores: [
      // 忽略常见的构建和依赖目录
      'node_modules/**/*',
      'dist/**/*',
      'build/**/*',
      // 忽略常见的配置文件
      '*.config.js',
      '*.config.ts',
      '*.config.json',
      '*.config.yaml',
      '*.config.yml',
      '*.config.toml',
      // 忽略常见的工具配置文件
      'sonar-project.properties',
      'jsconfig.json',
      // 忽略常见的包管理文件
      'package.json',
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml',
      // 忽略常见的文档文件
      '**/*.md',
      '**/*.txt',
      '**/LICENSE',
      // 忽略常见的资源文件
      'assets/**/*',
      'public/**/*',
      'static/**/*',
      // 忽略常见的脚本文件
      '**/*.sh',
      '**/*.bat',
      '**/*.ps1',
      'sudo',
      // 忽略常见的非代码源文件
      '**/*.d.ts',
      '**/*.map',
      '**/*.min.*',
    ],
  },

  /**
   * Vue preset
   */
  vue: {
    src: './src',
    ignores: [...PRESET_OPTIONS.common.ignores],
  },

  /**
   * Nuxt preset
   */
  nuxt: {
    src: './',
    ignores: [...PRESET_OPTIONS.common.ignores, '.nuxt/**/*', 'app/**/*', 'modules/**/*', 'router/**/*'],
  },
}

class UselessAnalyzerWebpackPlugin {
  constructor(options = {}) {
    if (typeof options !== 'object') {
      throw new Error('Options should be an object.')
    }

    const preset = options.preset || DEFAULT_OPTIONS.preset

    if (!PRESET_OPTIONS[preset]) {
      throw new Error(`Preset "${preset}" is not supported.`)
    }

    const presetOptions = PRESET_OPTIONS[preset]

    const src = options.src || presetOptions.src

    if (!fs.existsSync(src)) {
      throw new Error(`src "${src}" does not exist.`)
    }
    if (!fs.statSync(src).isDirectory()) {
      throw new Error(`src "${src}" should be a directory.`)
    }

    // NOTE：dot files & dot folders 默认被 glob 忽略
    const ignores = [...presetOptions.ignores, ...(options.ignores || [])]

    if (!Array.isArray(ignores)) {
      throw new Error(`ignores should be an array.`)
    }

    const output = options.output || presetOptions.output

    const debug = options.debug || presetOptions.debug

    this.options = { preset, src, ignores, output, debug }
  }

  apply(compiler) {
    const hooks = compiler.hooks || compiler
    const doneHook = hooks.done || hooks.afterEmit

    doneHook.tap('UselessAnalyzerWebpackPlugin', (stats) => {
      const compilation = stats.compilation
      const usedFiles = new Set()

      const srcPath = path.resolve(process.cwd(), this.options.src)
      this.debugLog('🚀 ~ UselessAnalyzerWebpackPlugin ~  srcPath:', srcPath)

      // 获取所有源文件
      const allFiles = glob.sync('**/*', {
        cwd: srcPath,
        ignore: this.options.ignores,
        nodir: true,
        absolute: true,
      })
      this.debugLog('🚀 ~ UselessAnalyzerWebpackPlugin ~  allFiles:', allFiles)

      // 收集所有被使用的文件
      compilation.modules.forEach((module) => {
        if (module.resource) {
          usedFiles.add(this.transformSlash(module.resource))
        }
      })
      this.debugLog('🚀 ~ UselessAnalyzerWebpackPlugin ~  usedFiles:', usedFiles)

      // 找出未使用的文件
      const unusedFiles = allFiles.filter((file) => !usedFiles.has(file))
      this.debugLog('🚀 ~ UselessAnalyzerWebpackPlugin ~  unusedFiles:', unusedFiles)

      // 将文件路径转换为相对于项目根目录的路径
      const result = unusedFiles.map((file) => {
        return this.transformSlash(path.relative(process.cwd(), file))
      })
      this.debugLog('🚀 ~ UselessAnalyzerWebpackPlugin ~  result:', result)

      // 写入结果到文件
      const outputDir = path.dirname(this.options.output)
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }
      const outputPath = path.resolve(process.cwd(), this.options.output)
      fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8')
      this.debugLog('🚀 ~ UselessAnalyzerWebpackPlugin ~  Result saved to:', this.options.output)
    })
  }

  transformSlash(str) {
    return str.replace(/\\/g, '/')
  }

  debugLog(...args) {
    if (this.options.debug) {
      console.log(...args)
    }
  }
}

module.exports = UselessAnalyzerWebpackPlugin
