/*
 * dimer-vue
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

/**
 * The dimer plugin to inject resuable functions and load the vuex
 * store with initial re-usable data
 */
export default async function dimer ({ store, $axios, $env }, inject) {
  const config = await $axios.get(`${$env.DIMER_BASE_URL}/config.json`)
  const zones = await $axios.get(`${$env.DIMER_BASE_URL}/zones.json`)

  /**
   * Register the dimer module with initial state
   */
  store.registerModule('dimer', {
    state: {
      websiteOptions: config.data.websiteOptions,
      zones: zones.data
    }
  })

  /**
   * Returns the existing zone
   */
  inject('getZone', function (slug) {
    return this.store.state.dimer.zones.find((zone) => zone.slug === slug)
  })

  /**
   * Returns the version for a given zone
   */
  inject('getVersion', function (slug, versionNo) {
    const zone = this.$getZone(slug)
    if (!zone) {
      return null
    }

    return zone.versions.find((version) => version.no === versionNo)
  })

  /**
   * Returns the version tree for a given version
   */
  inject('fetchTree', async function (slug, versionNo) {
    const url = `${$env.DIMER_BASE_URL}/${slug}/versions/${versionNo}.json`
    const response = await this.$axios.get(url)
    return response.data
  })

  /**
   * Fetches doc for a given permalink
   */
  inject('fetchDoc', async function (slug, versionNo, permalink) {
    const url = `${$env.DIMER_BASE_URL}/${slug}/versions/${versionNo}/${permalink}.json`
    const response = await this.$axios.get(url)
    return response.data
  })
}
