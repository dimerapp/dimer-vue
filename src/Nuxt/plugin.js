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
export default async function dimer ({ store, app }, inject) {
  if (!app.$env) {
    throw new Error('Register nuxt-env as a module to nuxt.config.js file')
  }

  if (!app.$axios) {
    throw new Error('Register @nuxtjs/axios as a module to nuxt.config.js file')
  }

  if (!app.store) {
    throw new Error('Enable vuex store by creating empty store/index.js file')
  }

  if (!app.$env.DIMER_BASE_URL) {
    throw new Error('Define DIMER_BASE_URL inside nuxt-env keys')
  }

  const config = await app.$axios.get(`${app.$env.DIMER_BASE_URL}/config.json`)
  const zones = await app.$axios.get(`${app.$env.DIMER_BASE_URL}/zones.json`)

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
    const url = `${this.$env.DIMER_BASE_URL}/${slug}/versions/${versionNo}.json`
    const response = await this.$axios.get(url)
    return response.data
  })

  /**
   * Fetches doc for a given permalink
   */
  inject('fetchDoc', async function (slug, versionNo, permalink) {
    const url = `${this.$env.DIMER_BASE_URL}/${slug}/versions/${versionNo}/${permalink}.json`
    const response = await this.$axios.get(url)
    return response.data
  })
}
