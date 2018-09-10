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
    this.options = Object.assign({}, options)

    if (typeof (this.options.baseUrl) !== 'string' || !this.options.baseUrl) {
      throw new Error('baseUrl is required to instantiate dimer instance')
    }

    this.axios = axios.create({ baseURL: this.options.baseUrl })
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
}
