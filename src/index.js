const fs = require("fs");
const path = require("path");
const glob = require("glob");

const DEFAULT_OPTIONS = {
  src: "src",
  // NOTE：dot files & dot folders 默认被 glob 忽略
  basicIgnores: [
    // 忽略常见的构建和依赖目录
    "**/node_modules/**/*",
    "**/dist/**/*",
    "**/build/**/*",
    // 忽略常见的配置文件
    "**/*.config.js",
    "**/*.config.ts",
    "**/*.config.json",
    "**/*.config.yaml",
    "**/*.config.yml",
    // 忽略常见的工具配置文件
    "**/sonar-project.properties",
    "**/jsconfig.json",
    // 忽略常见的包管理文件
    "**/package.json",
    "**/package-lock.json",
    "**/yarn.lock",
    "**/pnpm-lock.yaml",
    // 忽略常见的测试文件
    "**/*.test.*",
    "**/*.spec.*",
    "**/__tests__/**/*",
    "**/__mocks__/**/*",
    // 忽略常见的文档文件
    "**/*.md",
    "**/*.txt",
    "**/LICENSE",
    "**/README.*",
    // 忽略常见的资源文件
    "**/assets/**/*",
    "**/public/**/*",
    "**/static/**/*",
    // 忽略常见的脚本文件
    "**/*.sh",
    "**/*.bat",
    "**/*.ps1",
    "**/sudo",
    // 忽略常见的非源代码文件
    "**/src/**/*.d.ts",
    "**/src/**/*.map",
    "**/src/**/*.min.*",
  ],
  output: ".useless/unused-files.json",
  debug: false,
};

class UselessAnalyzerWebpackPlugin {
  constructor(options = {}) {
    this.options = {
      src: options.src || DEFAULT_OPTIONS.src,
      ignores: [
        ...DEFAULT_OPTIONS.basicIgnores,
        ...(options.additionIgnores || []),
      ],
      output: options.output || DEFAULT_OPTIONS.output,
      debug: options.debug || DEFAULT_OPTIONS.debug,
    };
  }

  apply(compiler) {
    const hooks = compiler.hooks || compiler;
    const doneHook = hooks.done || hooks.afterEmit;

    doneHook.tap("UselessAnalyzerWebpackPlugin", (stats) => {
      const compilation = stats.compilation;
      const usedFiles = new Set();

      const srcPath = path.resolve(process.cwd(), this.options.src);
      this.debugLog("🚀 ~ UselessAnalyzerWebpackPlugin ~  srcPath:", srcPath);

      // 获取所有源文件
      const allFiles = glob.sync("**/*", {
        cwd: srcPath,
        ignore: this.options.ignores,
        nodir: true,
        absolute: true,
      });
      this.debugLog("🚀 ~ UselessAnalyzerWebpackPlugin ~  allFiles:", allFiles);

      // 收集所有被使用的文件
      compilation.modules.forEach((module) => {
        if (module.resource) {
          usedFiles.add(this.transformSlash(module.resource));
        }
      });
      this.debugLog(
        "🚀 ~ UselessAnalyzerWebpackPlugin ~  usedFiles:",
        usedFiles
      );

      // 找出未使用的文件
      const unusedFiles = allFiles.filter((file) => !usedFiles.has(file));
      this.debugLog(
        "🚀 ~ UselessAnalyzerWebpackPlugin ~  unusedFiles:",
        unusedFiles
      );

      // 将文件路径转换为相对于项目根目录的路径
      const result = unusedFiles.map((file) => {
        return this.transformSlash(path.relative(process.cwd(), file));
      });
      this.debugLog("🚀 ~ UselessAnalyzerWebpackPlugin ~  result:", result);

      // 写入结果到文件
      const outputDir = path.dirname(this.options.output);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      const outputPath = path.resolve(process.cwd(), this.options.output);
      fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), "utf8");
      this.debugLog(
        "🚀 ~ UselessAnalyzerWebpackPlugin ~  Result saved to:",
        this.options.output
      );
    });
  }

  transformSlash(str) {
    return str.replace(/\\/g, "/");
  }

  debugLog(...args) {
    if (this.options.debug) {
      console.log(...args);
    }
  }
}

module.exports = UselessAnalyzerWebpackPlugin;
