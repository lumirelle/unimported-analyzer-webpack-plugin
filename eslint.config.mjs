import antfu from '@antfu/eslint-config'

export default antfu({
  pnpm: true,
  typescript: true,
  formatters: true,
}).append({
  ignores: [
    // CUSTOM: Add your custom ignored files here
  ],

  rules: {
    // We have to use `console` in development environment, we can use build plugin to remove it in production environment
    'no-console': 'off',

    // `webpack` compatible, because webpack doesn't support these rules
    // Use global variable `process` instead of `import process from 'process'`
    'node/prefer-global/process': 'off',
    // Use `path` instead of `node:path`
    'unicorn/prefer-node-protocol': 'off',

    // Use both `indexOf` and `includes`, because it's auto-fix behavior may cause some errors
    'unicorn/prefer-includes': 'off',

    // CUSTOM: Add your custom rules here
    'pnpm/yaml-no-duplicate-catalog-item': 'off',
  },
})
