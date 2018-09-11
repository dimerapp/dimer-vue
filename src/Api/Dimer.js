/*
 * dimer-vue
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import axios from 'axios'
import { Zone } from './Zone'

/**
 * The dimer instance is used to interact with the API without
 * manually constructing the API calls
 *
 * @param {Object} options
 */
export class Dimer {
  constructor (options) {
    this.options = Object.assign({
      route: {}
    }, options)

    if (typeof (this.options.apiUrl) !== 'string' || !this.options.apiUrl) {
      throw new Error('apiUrl is required to instantiate dimer instance')
    }

    if (!this.options.route.path) {
      throw new Error('Define the path for the route that will render the doc')
    }

    if (!this.options.route.name) {
      throw new Error('Define the name of the route that will render the doc. For nuxt apps, it will be page name')
    }

    this.axios = axios.create({ baseURL: this.options.apiUrl })
    this.config = null
    this.zones = null
  }

  /**
   * Returns a boolean telling if api instance has been
   * loaded or not
   *
   * @attribute isLoaded
   *
   * @return {Boolean}
   */
  get isLoaded () {
    return !!(this.config && this.zones)
  }

  /**
   * Do initial load of the app
   *
   * @method load
   *
   * @param  {Boolean} force
   *
   * @return {void}
   */
  async load (force = false) {
    if (!this.isLoaded || force) {
      const [ config, zones ] = await Promise.all([this.axios.get('config.json'), this.axios.get('zones.json')])
      this.config = config.data
      this.zones = zones.data
    }
  }

  /**
   * Returns the instance of a zone for a given slug. The zone slug
   * will be validated inside the initially loaded zones
   *
   * @method zone
   *
   * @param  {String} zoneSlug
   *
   * @return {Zone}
   */
  zone (zoneSlug) {
    if (!this.isLoaded) {
      throw new Error('Make sure to call Dimer.load first')
    }

    const zone = this.zones.find((zone) => zone.slug === zoneSlug)
    if (!zone) {
      throw new Error(`There isn't any zone with ${zoneSlug} slug`)
    }

    return new Zone(zone, this.axios, this.options)
  }

  /**
   * Returns the Zone instance for the default zone
   *
   * @method defaultZone
   *
   * @return {Zone}
   */
  defaultZone () {
    return this.zone('default')
  }

  /**
   * Returns the zone slug and version no for the given params. If
   * params doesn't define either of them, the defaults will be
   * searched.
   *
   * ```
   * // input { zone?, version? }
   * // output { zoneSlug, versionNo }
   * ```
   *
   * @method getClosestZoneAndVersion
   *
   * @param  {Object}   params { zone, version }
   *
   * @return {Object}       { zoneSlug, versionNo }
   *
   * @throws {Error}    If zone or version is misisng
   */
  getClosestZoneAndVersion (params) {
    const zoneSlug = params.zone || 'default'
    const zone = this.zones.find((z) => z.slug === zoneSlug)

    if (!zone) {
      throw new Error(`There isn't any zone with ${zoneSlug} slug`)
    }

    const version = params.version
      ? zone.versions.find((v) => v.no === params.version)
      : zone.versions.find((v) => v.default)

    if (!version) {
      throw new Error(`Unable to find ${params.version || 'default'} version in ${zoneSlug} slug. It is recommended to define default version`)
    }

    return {
      zoneSlug: zone.slug,
      versionNo: version.no
    }
  }

  /**
   * Returns a boolean telling if current route is meant to
   * render doc
   *
   * @method isDocRoute
   *
   * @param  {Object}   route
   *
   * @return {Boolean}
   */
  isDocRoute (route) {
    return route && route.name && this.options.route.name === route.name
  }
}
