const fs = require("fs");
const glob = require("glob");
const path = require("path");
const shelljs = require("shelljs");

class CleanUnusedFilesPlugin {
  constructor(options) {
    this.opts = options;
  }
  apply(compiler) {
    let _this = this;
    compiler.plugin("after-emit", function (compilation, done) {
      _this.findUnusedFiles(compilation, _this.opts);
      done();
    });
  }

  /**
   * 获取依赖的文件
   */
  getDependFiles(compilation) {
    return new Promise((resolve, reject) => {
      const dependedFiles = [...compilation.fileDependencies].reduce(
        (acc, usedFilepath) => {
          if (!~usedFilepath.indexOf("node_modules")) {
            acc.push(usedFilepath);
          }
          return acc;
        },
        []
      );
      resolve(dependedFiles);
    });
  }

  /**
   * 获取项目目录所有的文件
   */
  getAllFiles(pattern) {
    return new Promise((resolve, reject) => {
      glob(
        pattern,
        {
          nodir: true,
        },
        (err, files) => {
          if (err) {
            throw err;
          }
          const out = files.map((item) => path.resolve(item));
          resolve(out);
        }
      );
    });
  }

  /**
   * 处理排除规则
   * @param {string[]} exclude - glob 模式数组
   * @param {string[]} unusedList - 未使用的文件列表
   * @returns {string[]} - 过滤后的未使用文件列表
   */
  dealExclude(exclude, unusedList) {
    if (!Array.isArray(exclude) || !exclude.length) {
      return unusedList;
    }

    // 将 glob 模式转换为正则表达式
    const excludePatterns = exclude.map((pattern) => {
      const regexStr = pattern
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&") // 转义特殊字符
        .replace(/\*/g, ".*") // 将 * 转换为 .*
        .replace(/\?/g, ".") // 将 ? 转换为 .
        .replace(/\/\*\*/g, "(/.*)?"); // 将 /** 转换为 (/.*)?
      return new RegExp(`^${regexStr}$`);
    });

    // 过滤掉匹配排除规则的文件
    return unusedList.filter((file) => {
      return !excludePatterns.some((pattern) => pattern.test(file));
    });
  }

  async findUnusedFiles(compilation, config = {}) {
    const {
      root = "./src",
      clean = false,
      output = "./unused-files.json",
      exclude = false,
    } = config;

    const pattern = root + "/**/*";

    try {
      const allChunks = await this.getDependFiles(compilation);
      const allFiles = await this.getAllFiles(pattern);
      let unUsed = allFiles.filter((item) => !~allChunks.indexOf(item));
      if (exclude && Array.isArray(exclude)) {
        unUsed = this.dealExclude(exclude, unUsed);
      }
      if (typeof output === "string") {
        fs.writeFileSync(output, JSON.stringify(unUsed, null, 4));
      } else if (typeof output === "function") {
        output(unUsed);
      }
      if (clean) {
        unUsed.forEach((file) => {
          shelljs.rm(file);
          console.log(`remove file: ${file}`);
        });
      }
      return unUsed;
    } catch (err) {
      console.log("🚀 ~ CleanUnusedFilesPlugin ~ findUnusedFiles ~ err:", err);
    }
  }
}

module.exports = CleanUnusedFilesPlugin;
