/*
 * dimer-vue
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import nuxtPlugin from '../Nuxt/plugin'

/**
 * The Dimer interface is used to accept Dimer plugins, initialize
 * them and wire them up with Vue.js
 *
 * Dimer plugins can be Vue plugins or can also define renderers for
 * dimer tree component.
 */
export class Dimer {
  constructor () {
    this.renderers = []
    this.plugins = []
  }

  /**
   * Add a new renderer function
   *
   * @method addRenderer
   *
   * @param  {Function}  fn
   */
  addRenderer (fn) {
    this.renderers.push(fn)
  }

  /**
   * Returns an array of renderers
   *
   * @method getRenderers
   *
   * @return {Array}
   */
  getRenderers () {
    return this.renderers
  }

  /**
   * Add a new plugin
   *
   * @method use
   *
   * @param  {Function} pluginFn
   * @param  {Object}   options
   *
   * @return {void}
   */
  use (pluginFn, options) {
    this.plugins.push({ pluginFn, options })
  }

  /**
   * Method to be hooked to Vue.js to install Dimer
   * as a plugin
   *
   * @method install
   *
   * @return {Object}
   */
  install (Vue) {
    this.plugins.forEach(({ pluginFn, options }) => {
      pluginFn(this, Vue, options)
    })
  }

  /**
   * Calls the nuxt plugin to load the dimer store and inject
   * some helpful methods to the context
   */
  async loadStore (ctx, inject) {
    await nuxtPlugin(ctx, inject)
  }
}
