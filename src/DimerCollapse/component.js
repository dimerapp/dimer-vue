/*
 * dimer-vue
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

export const DimerCollapse = {
  functional: true,

  props: {
    node: {
      required: true,
      validator (value) {
        if (!value) {
          return false
        }

        return Array.isArray(value.children)
      }
    },

    wrapperClass: {
      type: String,
      default () {
        return 'dimer-collapse-wrapper'
      }
    }
  },

  render (createElement, context) {
    /**
     * We make sure that tabs have 2 top-level divs
     */
    if (context.props.node.children.length !== 2) {
      throw new Error('Invalid collapse node. It must have title and body as top level nodes')
    }

    /**
     * The first div must have a children text node
     */
    if (context.props.node.children[0].children.length !== 1) {
      throw new Error('Invalid collapse node. It must have a title')
    }

    /**
     * Getting the collapse title
     */
    const title = context.props.node.children[0].children[0].value

    /**
     * Here we get all the corresponding collpase body
     */
    const body = context.props.node.children[1]

    const child = context.data.scopedSlots.default ? context.data.scopedSlots.default({
      title, body
    }) : context.slots.default || ''

    return createElement('div', { attrs: { class: context.props.wrapperClass } }, [child])
  }
}
