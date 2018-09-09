/*
 * dimer-vue
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import utils from '../utils'

/**
 * Process a node recursively into Vue.js elements
 *
 * @method processNode
 *
 * @param  {Object}             node
 * @param  {Function}           createElement
 * @param  {Array[Function]}    renderers
 * @param  {Number}             renderersSize
 *
 * @return {Object}
 */
function processNode (node, createElement, renderers, renderersSize) {
  /**
   * Ignore dimertitle and dimerTitle
   */
  if (['dimertitle', 'dimerTitle'].indexOf(node.tag) > -1) {
    return
  }

  /**
   * Return raw value as it is
   */
  if (node.type === 'text') {
    return node.value
  }

  let output = null

  /**
   * Loop through all the renderers for this node and if anyone
   * matches, then simply return and break the loop.
   */
  for (let i = 0; i < renderersSize; i++) {
    if (output === false || output) {
      break
    }

    output = renderers[i](node, function (child) {
      return processNode(child, createElement, renderers, renderersSize)
    }, createElement)
  }

  /**
   * If a renderer has returned explicit false, then skip the node
   */
  if (output === false) {
    return
  }

  /**
   * If they return nothing, then we will render the node ourselves
   */
  if (!output) {
    return createElement(node.tag, { attrs: utils.propsToAttrs(node.props) }, node.children.map(function (child) {
      return processNode(child, createElement, renderers, renderersSize)
    }))
  }

  /**
   * Return output
   */
  return output
}

/**
 * Converts dimer nodes into VueJs virtual DOM.
 *
 * @method DimerTree
 *
 * @param  {Array}  renderers
 */
export function DimerTree (renderers) {
  renderers = (Array.isArray(renderers) ? renderers : []).filter((renderer) => typeof (renderer) === 'function')

  return {
    functional: true,

    props: {
      node: {
        required: true,
        validator (value) {
          return value && value.children && Array.isArray(value.children)
        }
      }
    },

    render (createElement, context) {
      return processNode({
        tag: 'div',
        props: {},
        children: context.props.node.children
      }, createElement, renderers, renderers.length)
    }
  }
}
