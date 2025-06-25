const fs = require('node:fs')
const path = require('node:path')
const process = require('node:process')

const glob = require('glob')
const { minimatch } = require('minimatch')

const { getMergedOptions } = require('./presets')

class UnimportedAnalyzerWebpackPlugin {
  /**
   * Plugin constructor.
   *
   * @param {object} options
   */
  constructor(options = {}) {
    this.validateOptions(options)

    const mergedOptions = getMergedOptions(options)

    this.options = mergedOptions

    // debugLog required `this.options.debug` to be true
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

    doneHook.tap('UnimportedAnalyzerWebpackPlugin', (stats) => {
      const compilation = stats.compilation

      const srcPath = path.resolve(process.cwd(), this.options.src)
      this.debugLog('🚀 ~ UnimportedAnalyzerWebpackPlugin ~  srcPath:', srcPath)

      const allFiles = this.getAllFiles(srcPath)
      this.debugLog('🚀 ~ UnimportedAnalyzerWebpackPlugin ~  allFiles:', allFiles)

      const importedFiles = this.getImportedFiles(compilation.modules)
      this.debugLog('🚀 ~ UnimportedAnalyzerWebpackPlugin ~  importedFiles:', importedFiles)

      const unimportedFiles = allFiles.filter(file => !importedFiles.has(file))
      this.debugLog('🚀 ~ UnimportedAnalyzerWebpackPlugin ~  unimportedFiles:', unimportedFiles)

      this.saveResult(unimportedFiles)
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
   * Get all files under the srcPath, excluding ignored files and including important files.
   *
   * @param {string} srcPath
   * @returns {string[]} All files under the srcPath, excluding ignored files and including important files.
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
        return this.normalizePath(file)
      })
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
   * Get all imported files from `modules`.
   *
   * @param {object[]} modules
   * @returns {Set<string>} Set of imported files, in order to avoid duplicates.
   * @private
   */
  getImportedFiles(modules) {
    const importedFiles = new Set()

    modules.forEach((module) => {
      // Process all modules with resource, except node_modules
      if (module.resource && !module.resource.includes('node_modules')) {
        // Process common module: add resource to imported files directly
        importedFiles.add(this.normalizePath(module.resource))

        // Process module processed by `sass-loader` or `scss-loader`: manually add dependency to imported files
        // `sass-loader` & `scss-loader` does not notify webpack that the scss files targeted by `@import`, `@use` and `@forward` are dependencies
        // So we need to manually add them to imported files
        if (module.loaders && module.loaders.some(loader =>
          loader.loader.includes('sass-loader') || loader.loader.includes('scss-loader'))
        ) {
          // If there is a virtual module created by `vue-loader`, the path will be like `xxx.vue?vue&type=style`
          // We should read the vue sfc file directly, so we need to remove the query parameters by using function `normalizePath`
          this.readModuleAndExtractSassDependencies(this.normalizePath(module.resource))
            .forEach(dep => importedFiles.add(this.normalizePath(dep)))
        }
      }
    })

    return importedFiles
  }

  /**
   * Read a sass/scss module and extract its dependencies.
   *
   * @param {string} modulePath
   * @returns {string[]} Array of dependent sass/scss file paths.
   * @private
   */
  readModuleAndExtractSassDependencies(modulePath) {
    try {
      if (!fs.existsSync(modulePath)) {
        return []
      }

      const content = fs.readFileSync(modulePath, 'utf8')
      const imports = this.extractSassImports(content)

      const dependencies = []
      imports.forEach((importPath) => {
        const dependency = this.resolveSassPath(modulePath, importPath)
        if (dependency && fs.existsSync(dependency)) {
          // recursively collect nested dependencies
          dependencies.push(...this.readModuleAndExtractSassDependencies(dependency))
          // add the dependency to the dependencies
          dependencies.push(this.normalizePath(dependency))
        }
      })

      return dependencies
    }
    // eslint-disable-next-line unused-imports/no-unused-vars
    catch (error) {
      return []
    }
  }

  /**
   * Extract `@import`, `@use` and `@forward` file paths from sass/scss module content.
   *
   * @param {string} content
   * @returns {string[]} Array of import paths.
   * @private
   */
  extractSassImports(content) {
    const imports = []

    // match `@import`, `@use`, `@forward` statements
    const regex = /@(?:import|use|forward)\s+['"]([^'"]+)['"]/g
    let match = regex.exec(content)
    while (match !== null) {
      imports.push(match[1])
      match = regex.exec(content)
    }

    return imports
  }

  /**
   * Resolve sass/scss import path to relative path.
   *
   * @param {string} modulePath
   * @param {string} importPath
   * @returns {string|null} Resolved relative path or `null` if not found.
   * @private
   */
  resolveSassPath(modulePath, importPath) {
    const moduleDir = path.dirname(modulePath)

    // All possible paths
    const possiblePaths = []

    // Handle non-partial files
    if (!importPath.endsWith('.scss') && !importPath.endsWith('.sass')) {
      possiblePaths.push(path.resolve(moduleDir, `${importPath}.scss`))
      possiblePaths.push(path.resolve(moduleDir, `${importPath}.sass`))
    }
    else {
      possiblePaths.push(path.resolve(moduleDir, importPath))
    }

    // Handle partial files (add underscore prefix)
    const fileName = path.basename(importPath)
    const dir = path.dirname(importPath)

    if (!fileName.startsWith('_')) {
      const partialPath = path.join(dir, `_${fileName}`)

      if (!partialPath.endsWith('.scss') && !partialPath.endsWith('.sass')) {
        possiblePaths.push(path.resolve(moduleDir, `${partialPath}.scss`))
        possiblePaths.push(path.resolve(moduleDir, `${partialPath}.sass`))
      }
      else {
        possiblePaths.push(path.resolve(moduleDir, partialPath))
      }
    }

    // Find the first existing file, and return the relative path to the srcPath
    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        return this.normalizePath(possiblePath)
      }
    }

    return null
  }

  /**
   * Save the result to a file.
   *
   * @param {string[]} unimportedFiles
   * @private
   */
  saveResult(unimportedFiles) {
    // Transform the unimported files to relative paths
    const result = unimportedFiles.map((file) => {
      return this.normalizePath(path.relative(process.cwd(), file))
    })
    this.debugLog('🚀 ~ UnimportedAnalyzerWebpackPlugin ~  result (relative to srcPath):', result)

    // Save the result to a file
    const outputDir = path.dirname(this.options.output)
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    const outputPath = path.resolve(process.cwd(), this.options.output)
    fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8')
    this.debugLog('🚀 ~ UnimportedAnalyzerWebpackPlugin ~  Result saved to:', this.options.output)
  }

  /**
   * Normalize the path to a consistent format (Also remove query parameters like `?vue&type=style`).
   *
   * @param {string} str
   * @returns {string} Normalized path.
   * @private
   */
  normalizePath(str) {
    return str.replace(/\\/g, '/').replace(/\?.*$/, '').toLowerCase()
  }

  /**
   * Console log when debug is enabled.
   *
   * @param {...any} args
   * @private
   */
  debugLog(...args) {
    if (this.options?.debug) {
      // eslint-disable-next-line no-console
      console.log(...args)
    }
  }
}

module.exports = UnimportedAnalyzerWebpackPlugin
