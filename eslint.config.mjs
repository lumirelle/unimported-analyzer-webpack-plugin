import antfu from '@antfu/eslint-config'

export default antfu({
  formatters: true,
  pnpm: true,

  ignores: [
    'test/**/*',
  ],
})
  .override('antfu/yaml/pnpm-workspace', {
    rules: {
      'pnpm/yaml-no-duplicate-catalog-item': 'off',
    },
  })
