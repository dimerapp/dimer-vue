/*
 * dimer-vue
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import { CancelToken, isCancel } from 'axios'

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

  /**
   * Perform docs search
   */
  inject('searchDocs', async function (slug, versionNo, query, limit = 0) {
    this._dimerAxiosTokens = this._dimerAxiosTokens || {}
    const uniquePathSegment = `${slug}/${versionNo}`

    /**
     * Cancel too many search requests for the same zone and version. It's possible
     * that someone may want to query multiple versions in parallel and hence
     * the cancellation tokens has to be for a given zone/version.
     */
    if (this._dimerAxiosTokens[uniquePathSegment]) {
      this._dimerAxiosTokens[uniquePathSegment].cancel()
    }

    /**
     * Creating a new token for the current slug and version
     */
    this._dimerAxiosTokens[uniquePathSegment] = CancelToken.source()

    const url = `${this.$env.DIMER_BASE_URL}/${slug}/versions/${versionNo}/search.json`

    try {
      const response = await this.$axios.get(url, {
        params: { query, limit },
        cancelToken: this._dimerAxiosTokens[uniquePathSegment].token
      })

      /**
       * Delete the cancel token
       */
      delete this._dimerAxiosTokens[uniquePathSegment]

      return response.data
    } catch (error) {
      if (!isCancel(error)) {
        throw error
      }
    }
  })
}
