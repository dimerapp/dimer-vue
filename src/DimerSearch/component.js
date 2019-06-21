/*
 * dimer-vue
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

export const DimerSearch = {
  props: {
    model: {
      required: true,
      validator: function (value) {
        if (!value) {
          return false
        }

        const { data, query } = value
        return Array.isArray(data) && typeof (query) === 'string'
      }
    },

    wrapperClass: {
      type: String,
      default () {
        return 'dimer-search-wrapper'
      }
    }
  },

  methods: {
    /**
     * Trigger the search
     *
     * @method triggerSearch
     *
     * @param  {Event}      e
     *
     * @return {void}
     */
    triggerSearch (e) {
      switch (e.which) {
        case 13:
          this.$emit('onEnter', e)
          break
        case 27:
          this.$emit('onEscape', e)
          break
        case 40:
          this.$emit('onArrowDown', e)
          break
        case 38:
          this.$emit('onArrowUp', e)
          break
        default:
          this.search(e)
      }
    },

    /**
     * Performs search for a given data entry item
     */
    async searchFor (item) {
      item.results = await this.$searchDocs(item.zone, item.version, this.model.query)
    },

    /**
     * Search dimer API for results
     *
     * @method search
     *
     * @return {void}
     */
    async search () {
      await Promise.all(this.model.data.map((entry) => this.searchFor(entry)))
    },

    /**
     * Returns a function component with marks
     *
     * @method renderMark
     *
     * @param  {Array}   marks
     *
     * @return {Component}
     */
    renderMark (marks) {
      return {
        functional: true,
        render (createElement) {
          return marks.filter((mark) => !!mark.text.trim()).map((mark) => {
            return mark.type === 'raw' ? createElement('span', [mark.text]) : createElement('strong', [mark.text])
          })
        }
      }
    }
  },

  /**
   * Render the component
   *
   * @method render
   *
   * @param  {Function} createElement
   *
   * @return {Object}
   */
  render (createElement) {
    const child = this.$scopedSlots.default ? this.$scopedSlots.default({
      triggerSearch: this.triggerSearch,
      renderMark: this.renderMark
    }) : this.$slots.default || ''

    return createElement('div', { attrs: { class: this.$props.wrapperClass } }, [child])
  }
}
