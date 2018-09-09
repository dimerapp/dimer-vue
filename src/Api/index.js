/*
 * dimer-vue
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import { Dimer } from './Dimer'

/**
 * Here we install the Dimer plugin and attach the instance
 * to the Vue prototype
 *
 * @method
 *
 * @param  {Object} dimer
 * @param  {Object} vue
 * @param  {Object} options
 *
 * @return {void}
 */
export default function (dimer, vue, options) {
  const dimerInstance = new Dimer(options)
  vue.prototype.Dimer = dimerInstance
}
