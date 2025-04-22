/**
 * @file Minimal ESLint Flat Config
 * @description This config is a minimal ESLint config, based on @antfu/eslint-config.
 * @author Lumirelle <https://github.com/Lumirelle>
 */

import antfu from '@antfu/eslint-config'

export default antfu(
  /**
   * Config Generation Options
   * @see https://github.com/antfu/eslint-config#vue-2
   */
  {
    typescript: true,

    // Enable formatters for html and markdown (requires `eslint-plugin-format`)
    formatters: {
      css: false, // Use stylelint for instead
      html: true,
      markdown: true,
    },

    // `.eslintignore` is no longer supported in Flat config, use `ignores` instead
    ignores: [
      // The configuration already includes ignore configurations for build output and node_modules
      // Other files
    ],
  },

  /**
   * ESLint User config, can be more than one
   * @see https://eslint.org/docs/latest/user-guide/configuring/configuration-files#using-flat-configuration-files
   */
  {
    // Add custom rules here
    rules: {
      // We need to use `console` in development environment, we can use terser-webpack-plugin to remove it in production environment
      'no-console': 'off',

      // This project doesn't support these rules
      // Use global variable `process` instead of `import process from 'process'`, because it's not supported in this project
      'node/prefer-global/process': 'off',
      // Use `path` instead of `node:path`, because it's not supported in this project
      'unicorn/prefer-node-protocol': 'off',

      // Use both `indexOf` and `includes`, because it's auto-fix behavior may cause some issues
      'unicorn/prefer-includes': 'off',
    },
  },
)
