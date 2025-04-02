# API

```js
const UselessThingsWebpackPlugin = require('useless-things-webpack-plugin')

plugins: [
  new UselessThingsWebpackPlugin({
    root: './src', // 项目目录
    output?: './unused-files.json', // 输出文件列表
    output?: (files) => deal(files), // 或者回调处理
    clean?: false // 删除文件,
    exclude?: [ // 排除文件列表, 格式为文件路径数组
      '.git/**/*',
      '.husky/**/*'
      // ...
    ]
  })
]

```
