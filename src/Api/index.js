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
  vue.prototype.$dimer = dimerInstance

  /**
   * An object of dimer instances for each zone-version combination.
   * This is done to have cached API responses.
   */
  vue._dimers = {}

  /**
   * Access to the active dimer when using vue router and route
   * name matches
   */
  Object.defineProperty(vue.prototype, '$activeDimer', {
    get () {
      if (!this.$dimer.isDocRoute(this.$route)) {
        throw new Error('the $activeDimer property is only available when current route is same as the docRouteName')
      }

      const { zoneSlug, versionNo } = this.$dimer.getClosestZoneAndVersion(this.$route.params)
      const cachedName = `${zoneSlug}-${versionNo}`

      /**
       * Cach the zone and version instance to avoid unwanted API calls
       * and cache `makeUrl` calls.
       */
      if (!vue._dimers[cachedName]) {
        vue._dimers[cachedName] = this.$dimer.zone(zoneSlug).version(versionNo)
      }

      return vue._dimers[cachedName]
    },

    set () {
      // Defining to get rid Nuxt `inject` errors. Nuxt actually tries to inject to all components, but we don't want that.
    }
  })
}
