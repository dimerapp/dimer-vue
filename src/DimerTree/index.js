/*
 * dimer-vue
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import { DimerTree } from './component'

/**
 * Dimer plugin to attach a new component
 *
 * @param  {Object} dimer
 * @param  {Object} vue
 *
 * @return {void}
 */
export default function (dimer, vue) {
  vue.component('dimerTree', DimerTree(dimer.getRenderers()))
}
