// If the file is imported, it will be considered as used, regardless of whether it is used in the code or not
import { ImportedButUnusedComponent } from './components/importedButUnused'

import { importedUtil } from './utils/imported'
import importedCss from './assets/styles/imported.css'
import importedImage from './assets/images/imported.png'

console.log(importedUtil())
console.log(importedCss)
console.log(importedImage)