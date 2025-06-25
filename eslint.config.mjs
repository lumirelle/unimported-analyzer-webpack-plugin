import antfu from '@antfu/eslint-config'

export default antfu({
  formatters: true,
  pnpm: true,
  typescript: true,

  ignores: [
    'test/**/src/**/*',
  ],
})
  .override('antfu/yaml/pnpm-workspace', {
    rules: {
      'pnpm/yaml-no-duplicate-catalog-item': 'off',
    },
  })
