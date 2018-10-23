/*
 * dimer-vue
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

/**
 * The version instance for a given version inside a given zone.
 *
 * You will never have to construct this class manually, and instead use
 * the `version` method on the Zone class.
 *
 * @class Version
 *
 * @param {String} zoneSlug
 * @param {Object} version
 * @param {Object} axios
 * @param {Object} options
 */

import axios from 'axios'

export class Version {
  constructor (zone, version, axios, options) {
    this.zone = zone
    this.version = version
    this.axios = axios
    this.options = options
    this.searchSource = null

    /**
     * The base API url for the dimer rest server
     */
    this.baseApiUrl = `${this.zone.slug}/versions/${this.version.no}`

    /**
     * Caching created URL's to avoid re-parsing
     *
     * @type {Object}
     */
    this.cachedUrls = {}

    /**
     * Cached copy of the tree. Helps is avoiding redundant calls
     * to the API server, when navigating through docs within the
     * same zone and verison.
     *
     * @type {Array}
     */
    this.cachedTree = []
  }

  /**
   * Returns the documentation tree
   *
   * @method getTree
   *
   * @param {Object} options
   *
   * @return {Array}
   */
  async getTree (options) {
    options = Object.assign({ reload: true, query: {} }, options)

    /**
     * Return the cache (if exists)
     */
    if (!options.reload && this.cachedTree.length) {
      return this.cachedTree
    }

    const response = await this.axios.get(`${this.baseApiUrl}.json`, {
      params: options.query
    })

    this.cachedTree = response.data
    return this.cachedTree
  }

  /**
   * Returns the doc contents
   *
   * @method getDoc
   *
   * @param  {String}  permalink
   * @param  {Boolean} [splitToc = false] Split toc to it's own property
   *
   * @return {Object}
   */
  async getDoc (permalink, options) {
    options = Object.assign({ query: {} }, options)

    const response = await this.axios.get(`${this.baseApiUrl}/${permalink}.json`, {
      params: options.query
    })

    return response.data
  }

  /**
   * Search documentation inside this version
   *
   * @method search
   *
   * @param  {String} query
   * @param  {Number} limit
   *
   * @return {Array}
   */
  async search (query, limit = 10) {
    if (!query) {
      return []
    }

    /**
     * Cancel old search request, when new has been made
     */
    if (this.searchSource) {
      this.searchSource.cancel()
    }

    this.searchSource = axios.CancelToken.source()

    try {
      const response = await this.axios.get(`${this.baseApiUrl}/search.json`, {
        params: { query, limit }
      }, {
        cancelToken: this.searchSource.token
      })

      this.searchSource = null

      return response.data
    } catch (error) {
      if (!axios.isCancel(error)) {
        throw error
      }
    }
  }
}
