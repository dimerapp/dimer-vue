/*
 * dimer-vue
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import { Dimer } from './Dimer'
import utils from '../utils'

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
  vue.prototype.$dimer = dimerInstance

  /**
   * Access to the active dimer when using vue router and route
   * name matches
   */
  Object.defineProperty(vue.prototype, '$activeDimer', {
    get () {
      const activeDimer = utils.getActiveDimer(this.$dimer, this.$route)
      if (activeDimer) {
        return activeDimer
      }

      throw new Error('the $activeDimer property is only available when using vue router and your current route is same as the docRouteName')
    },

    set () {
      // Defining to get rid Nuxt `inject` errors. Nuxt actually tries to inject to all components, but we don't want that.
    }
  })
}
