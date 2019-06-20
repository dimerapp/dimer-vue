/*
 * dimer-vue
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

export const DimerTabs = {
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
        return 'dimer-tabs-wrapper'
      }
    }
  },

  render (createElement, context) {
    /**
     * We make sure that tabs have 2 top-level divs
     */
    if (context.props.node.children.length !== 2) {
      throw new Error('Invalid tabs node. It must have head and body as top level nodes')
    }

    /**
     * The first div, that is the navigation links for the tabs, must be wrapped inside
     * a ul
     */
    if (context.props.node.children[0].children.length !== 1) {
      throw new Error('Invalid tabs navigation node. It must be wrapped inside an ul')
    }

    /**
     * Here we get all list items for the tabs navigation
     */
    const tabListItems = context.props.node.children[0].children[0].children.filter((li) => li.tag === 'li')

    /**
     * Here we get all the corresponding divs for a tabs content.
     */
    const tabsContentPanes = context.props.node.children[1].children

    /**
     * The length of tabs navigation links, must match the length of content panes.
     * Otherwise the tabs are invalid
     */
    if (tabListItems.length !== tabsContentPanes.length) {
      throw new Error('Invalid tabs node. The navigation links count mis-matches the tabs content panes count')
    }

    const child = context.data.scopedSlots.default ? context.data.scopedSlots.default({
      links: tabListItems.map((item, index) => item.children[0].value),
      panes: tabsContentPanes
    }) : context.slots.default || ''

    return createElement('div', { attrs: { class: context.props.wrapperClass } }, [child])
  }
}
