/*
 * dimer-vue
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

function handleError (error) {
  if (!error.response) {
    return {
      statusCode: error.status || 500,
      message: error.message,
    }
  }

  return {
    statusCode: error.response.status,
    message: error.response.status === 404 ? 'Route not found' : error.message,
  }
}

/**
 * A wrapper component to render to the layout
 */
function wrapper (LayoutComponent) {
  return {
    /**
     * Render the layout component
     */
    render (createElement) {
      return createElement(LayoutComponent, { props: { tree: this.tree } })
    },

    /**
     * Ensure that zone and version does exists. Also, in case of
     * missing permalink, we redirect to the hero doc
     */
    validate ({ app, params, redirect }) {
      const version = app.$getVersion(params.zone, params.version)
      if (!version) {
        return false
      }

      if (!params.permalink && version.heroDoc) {
        redirect(`/${params.zone}/${params.version}/${params.permalink}`)
        return true
      }

      return !!params.permalink
    },

    /**
     * Load the version tree
     */
    async asyncData ({ app, params, error }) {
      try {
        const tree = await app.$fetchTree(params.zone, params.version)
        return { tree }
      } catch (e) {
        error(handleError(e))
      }
    }
  }
}

/**
 * Content component to render the document
 */
function content (DocComponent) {
  return {
    render (createElement) {
      return createElement(DocComponent, { props: { doc: this.doc } })
    },

    /**
     * Load the doc contents
     */
    async asyncData ({ app, params, error }) {
      try {
        const doc = await app.$fetchDoc(params.zone, params.version, params.permalink)
        return { doc }
      } catch (e) {
        error(handleError(e))
      }
    }
  }
}

/**
 * The nuxt routes. They are automatically handled
 * @type {Object}
 */
export default function routes (Layout, Doc) {
  return {
    path: '/:zone/:version',
    component: wrapper(Layout),
    children: [{
      path: '/:zone/:version/:permalink',
      component: content(Doc)
    }]
  }
}
