const fs = require('fs')
const path = require('path')

const glob = require('glob')
const { minimatch } = require('minimatch')

const { getMergedOptions } = require('./presets')

class UselessAnalyzerWebpackPlugin {
  /**
   * Plugin constructor.
   *
   * @param {object} options
   */
  constructor(options = {}) {
    this.validateOptions(options)

    const mergedOptions = getMergedOptions(options)

    this.options = mergedOptions

    // debugLog required `this.options.debug`
    this.debugLog('🚀 ~ getMergedOptions ~ mergedOptions:', mergedOptions)
  }

  /**
   * Webpack plugin apply hook.
   *
   * @param {object} compiler
   */
  apply(compiler) {
    const hooks = compiler.hooks || compiler
    const doneHook = hooks.done || hooks.afterEmit

    doneHook.tap('UselessAnalyzerWebpackPlugin', (stats) => {
      const compilation = stats.compilation

      const srcPath = path.resolve(process.cwd(), this.options.src)
      this.debugLog('🚀 ~ UselessAnalyzerWebpackPlugin ~  srcPath:', srcPath)

      const allFiles = this.getAllFiles(srcPath)
      this.debugLog('🚀 ~ UselessAnalyzerWebpackPlugin ~  allFiles:', allFiles)

      const usedFiles = this.getUsedFiles(compilation)
      this.debugLog('🚀 ~ UselessAnalyzerWebpackPlugin ~  usedFiles:', usedFiles)

      const unusedFiles = allFiles.filter(file => !usedFiles.has(file))
      this.debugLog('🚀 ~ UselessAnalyzerWebpackPlugin ~  unusedFiles:', unusedFiles)

      this.saveResult(unusedFiles)
    })
  }

  /**
   * Validate the options provided to this plugin.
   *
   * @param {object} options
   * @private
   */
  validateOptions(options) {
    // Validate `options`
    if (!options || typeof options !== 'object') {
      throw new Error('Plugin options should be an object.')
    }

    // Validate `options.preset`
    if (options.preset && typeof options.preset !== 'string') {
      throw new Error('Option `preset` should be a string.')
    }

    // Validate `options.src`
    if (options.src) {
      if (typeof options.src !== 'string') {
        throw new TypeError('Option `src` should be a string.')
      }
      if (!fs.existsSync(options.src)) {
        throw new Error(`Option \`src\`: Path "${options.src}" does not exist.`)
      }
      if (!fs.statSync(options.src).isDirectory()) {
        throw new Error(`Option \`src\`: Path "${options.src}" should be a directory.`)
      }
    }

    // Validate `options.ignores`
    if (options.ignores && !Array.isArray(options.ignores)) {
      throw new Error('Option `ignores` should be an array.')
    }

    // Validate `options.important`
    if (options.important && !Array.isArray(options.important)) {
      throw new Error('Option `important` should be an array.')
    }

    // Validate `options.output`
    if (options.output && typeof options.src !== 'string') {
      throw new Error('Option `output` should be a string.')
    }

    // Validate `options.debug`
    if (options.debug && typeof options.debug !== 'boolean') {
      throw new Error('Option `debug` should be a boolean.')
    }
  }

  /**
   * Get all files in the srcPath, excluding ignored files and including important files.
   *
   * @param {string} srcPath
   * @returns {string[]} All files in the srcPath, excluding ignored files and including important files.
   * @private
   */
  getAllFiles(srcPath) {
    // Get all files in the srcPath, including dot files & directories
    const allFilesWithoutIgnores = glob.sync('**/*', {
      cwd: srcPath,
      nodir: true,
      absolute: true,
      dot: true,
    })
    // Process ignored files and important files
    return allFilesWithoutIgnores
      .filter((file) => {
        const relativePath = path.relative(srcPath, file)
        return this.isImportantFile(relativePath) || !this.isIgnoreFile(relativePath)
      })
      .map((file) => {
        return this.transformPath(file)
      })
  }

  /**
   * Get all used files from `state.compilation`.
   *
   * @param {object} compilation
   * @returns {Set<string>} Set of used files.
   * @private
   */
  getUsedFiles(compilation) {
    const usedFiles = new Set()
    compilation.modules.forEach((module) => {
      if (module.resource) {
        usedFiles.add(this.transformPath(module.resource))
      }
    })
    return usedFiles
  }

  /**
   * Save the result to a file.
   *
   * @param {string[]} unusedFiles
   * @private
   */
  saveResult(unusedFiles) {
    // Transform the unused files to relative paths
    const result = unusedFiles.map((file) => {
      return this.transformPath(path.relative(process.cwd(), file))
    })
    this.debugLog('🚀 ~ UselessAnalyzerWebpackPlugin ~  result:', result)

    // Save the result to a file
    const outputDir = path.dirname(this.options.output)
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    const outputPath = path.resolve(process.cwd(), this.options.output)
    fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8')
    this.debugLog('🚀 ~ UselessAnalyzerWebpackPlugin ~  Result saved to:', this.options.output)
  }

  /**
   * Check if the file is ignored.
   *
   * @param {string} filePath
   * @returns {boolean} If the file is ignored.
   * @private
   */
  isIgnoreFile(filePath) {
    const { ignores = [] } = this.options
    return ignores.length > 0 && ignores.some(pattern => minimatch(filePath, pattern, { dot: true }))
  }

  /**
   * Check if the file is important.
   *
   * @param {string} filePath
   * @returns {boolean} If the file is important.
   * @private
   */
  isImportantFile(filePath) {
    const { important = [] } = this.options
    return important.length > 0 && important.some(pattern => minimatch(filePath, pattern, { dot: true }))
  }

  /**
   * Transform the path to a consistent format.
   *
   * @param {string} str
   * @returns {string} Transformed path.
   * @private
   */
  transformPath(str) {
    return str.replace(/\\/g, '/').toLowerCase()
  }

  /**
   * Console log when debug is enabled.
   *
   * @param {...any} args
   * @private
   */
  debugLog(...args) {
    if (this.options?.debug) {
      console.log(...args)
    }
  }
}

module.exports = UselessAnalyzerWebpackPlugin
