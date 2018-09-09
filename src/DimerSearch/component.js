/*
 * dimer-vue
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

export default {
  props: {
    model: {
      required: true,
      validator: function (value) {
        if (!value) {
          return false
        }

        const { results, query, activeIndex } = value
        return Array.isArray(results) && typeof (query) === 'string' && typeof (activeIndex) === 'number'
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
          this.onEscape(e)
          break
        case 40:
          this.onArrowDown(e)
          break
        case 38:
          this.onArrowUp(e)
          break
        default:
          this.search(e)
      }
    },

    /**
     * Search dimer API for results
     *
     * @method search
     *
     * @return {void}
     */
    async search () {
      if (!this.$dimer) {
        throw new Error('Make sure you are using dimer-vue to allow HTTP calls')
      }

      this.model.results = await this.$dimer.search(this.model.query)
    },

    /**
     * Updates the active index to let user toggle through
     * the list using their keyboard.
     *
     * The direction must be one of the following
     * - up
     * - down
     *
     * @method updateActiveIndex
     *
     * @param  {String}          direction
     *
     * @return {void}
     */
    updateActiveIndex (direction) {
      if (direction === 'up') {
        if (this.model.activeIndex <= 0) {
          this.model.activeIndex = this.model.results.length - 1
          return
        }
        this.model.activeIndex--
      }

      if (direction === 'down') {
        if ((this.model.activeIndex + 1) >= this.model.results.length) {
          this.model.activeIndex = 0
          return
        }

        this.model.activeIndex++
      }
    },

    /**
     * When up arrow is pressed
     *
     * @method onArrowUp
     *
     * @param  {Event}  e
     *
     * @return {void}
     */
    onArrowUp (e) {
      if (this.$listeners.onArrowUp) {
        if (process.env.NODE_ENV === 'development') {
          console.info('arrowUp event ignored as parent component has a listener for it')
        }
        return
      }

      e.preventDefault()
      this.updateActiveIndex('up')
    },

    /**
     * When down arrow is pressed
     *
     * @method onArrowDown
     *
     * @param  {Event}    e
     *
     * @return {void}
     */
    onArrowDown (e) {
      if (this.$listeners.onArrowDown) {
        if (process.env.NODE_ENV === 'development') {
          console.info('arrowDown event ignored as parent component has a listener for it')
        }
        return
      }

      e.preventDefault()
      this.updateActiveIndex('down')
    },

    /**
     * When escape is pressed. If a custom listener is defined, then
     * it will be used over the default behavior
     *
     * @method onEscape
     *
     * @param  {Object} e
     *
     * @return {void}
     */
    onEscape (e) {
      if (this.$listeners.onEscape) {
        if (process.env.NODE_ENV === 'development') {
          console.info('onEscape event ignored as parent component has a listener for it')
        }
        return
      }

      e.preventDefault()
      this.model.query = ''
      this.model.results = []
      this.model.activeIndex = 0
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
