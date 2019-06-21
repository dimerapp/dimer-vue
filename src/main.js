/*
 * dimer-vue
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import { Dimer } from './Dimer'
const dimerInstance = new Dimer()

export { default as DimerTree } from './DimerTree'
export { default as DimerSearch } from './DimerSearch'
export { default as DimerTabs } from './DimerTabs'
export { default as DimerCollapse } from './DimerCollapse'
export { dimerInstance as Dimer }
export { default as utils } from './utils'
export { default as routes } from './Nuxt/routes'
