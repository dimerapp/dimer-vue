/*
 * dimer-vue
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

export default {
  /**
   * Returns a boolean telling if response body indicates a redirect
   *
   * @method isARedirect
   *
   * @param  {String}   body
   *
   * @return {Boolean}
   */
  isARedirect (body) {
    return !!body.redirect
  },

  /**
   * Extracts a node by mutating the original
   * array.
   *
   * Return true for the node you want to extract
   * from the callback function.
   *
   * @method extractNode
   *
   * @param  {Object}     node
   * @param  {Function}   fn
   *
   * @return {Null|Object}
   */
  extractNode (node, callback) {
    if (typeof (callback) !== 'function') {
      throw new Error('extractNode needs a callback as 2nd argument')
    }

    if (!node || !Array.isArray(node.children)) {
      throw new Error('extractNode needs a json node with children array as 1st argument')
    }

    const children = node.children
    const nodesSize = node.children.length

    for (let i = 0; i < nodesSize; i++) {
      const node = children[i]

      if (callback(node)) {
        children.splice(i, 1)
        return node
      }
    }

    return null
  },

  /**
   * Convrts node props to vue component attributes
   *
   * @method propsToAttrs
   *
   * @param  {Object}     props
   *
   * @return {Object}
   */
  propsToAttrs (props) {
    return Object.keys(props).reduce(function (result, key) {
      if (key === 'className') {
        result.class = props.className.join(' ')
      } else if (key.indexOf('data') === 0) {
        result[key.replace(/[A-Z]/g, (g) => `-${g.toLowerCase()}`)] = props[key]
      } else {
        result[key] = props[key]
      }
      return result
    }, {})
  }
}
