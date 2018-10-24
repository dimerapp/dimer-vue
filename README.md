<div align="center">
  <div>
    <img width="500" src="https://res.cloudinary.com/adonisjs/image/upload/q_100/v1532274184/Dimer_Readme_Banner_lyy7wv.svg" alt="Dimer App">
  </div>
  <br>
  <p>
    <a href="https://dimerapp.com/what-is-dimer">
      Dimer is an open source project and CMS to help you publish your documentation online.
    </a>
  </p>
  <br>
  <p>
    <sub>We believe every project/product is incomplete without documentation. <br /> We want to help you publish user facing documentation, without worrying <code>about tools or code</code> to write.</sub>
  </p>
  <br>
</div>

## Dimer vue
> Components and helpers to build user interfaces using Dimer 

| file                   | size     | gzip size |
|------------------------|----------|-----------|
| CJS                    | 27.09 KB  | 6.47 KB  |
| UMD                    | 29.2 KB   | 6.61 KB  |
| UMD MIN                | 9.49 KB   | 3.15 KB  |

The goal of the project is to make it easier to create custom designs for your documentation, without re-creating the core elements or components.

Following is the list of included components and API's:

- [SDK](#sdk) to make API calls.
- [Dimer tree](#dimer-tree) component to convert Dimer JSON to Vue `createElement`. 
- [Dimer Search](#dimer-search) component to search documentation.
- [Dimer Tabs](#dimer-tabs) component to render multiple codeblocks as tabs.
- [Utils](#utils) for commonly required tasks.

## Prerequisites 
Before getting started, make sure you know how to connect to the Dimer API server.

1. If you are testing it on your local server, then it will be accessible as `http://localhost:5000`
2. If you have published it on Dimer cloud, then it will be `https://api.dimerapp.com/YOUR_DOMAIN`.

## Setup
Install the package from npm.

```shell
npm i dimer-vue

# yarn
yarn add dimer-vue
```

Once installed, you can make use of it as follows.

```js
import { Dimer, DimerApi } from 'dimer-vue'
import Vue from 'vue'

// Tell dimer to use the API plugin
Dimer.use(DimerApi, {
  apiUrl: 'http://localhost:5000',
  routes: [{
  }]
})

// Finally hook Dimer with VueJs
Vue.use(Dimer)
```

## Injected properties
You can access the following properties inside your vue components.

1. `this.$dimer` when using the `DimerApi` plugin.
2. `this.$activeDimer` when current route belongs to one of the defined config `routes`.
3. `dimer-search` component when using `DimerSearch` plugin.
4. `dimer-tabs` component when using `DimerTabs` plugin.
5. `dimer-tree` component when using `DimerTree` plugin.

## SDK
The job of the SDK is to make REST calls to the Dimer API server. It hides the complexity of manually creating HTTP requests and instead provides a clean API to fetch and use data.

At a bare minimum, you need to register the `DimerApi` plugin with the `Dimer` object as shown below.

```js
import { Dimer, DimerApi } from 'dimer-vue'

Dimer.use(DimerApi, {
  apiUrl: 'http://localhost:5000',
  routes: [
    {
      name: 'doc',
      path: '/:zone/:version/:permalink'
    }
  ]
})
```

**Once done, you can access `this.$dimer` from all of your Vue.js components.**

- The `apiUrl` is the URL for your API server.
- The `routes` array defines the routes in which you need the SDK instance for a specific version. [Learn more about it here](#activedimer)

The SDK is divided into 3 classes.

1. **Dimer**: Main API wrapper
2. **Zone**: Instance for a given zone.
3. **Version**: Instance for a given version inside a zone.

You get access to the internal classes by using the helper methods. Example:

```js
const faqs = this.$dimer.zone('faq')
const master = faqs.version('master')

// Now using the master version, you can fetch categories, docs and search
await master.getDoc(permalink)
await master.search(query)
await master.getTree()
```

### [Dimer](https://github.com/dimerapp/dimer-vue/blob/develop/src/Api/Dimer.js)
The following methods exists on the main Dimer class.

#### load
The `load` function must be called when you boot your VueJs or Nuxt app. It will hit the Dimer servers and pre-fetches all `zones` and `versions` for you.

```js
// do it in the root component
await this.$dimer.load()
```

#### zone(slug) -> [zone](https://github.com/dimerapp/dimer-vue/blob/develop/src/Api/Zone.js)
Get an instance of a zone for a given slug. If your app is not making use of zones, you can fetch the `defaultZone`.

```js
// Get zone slug from URL
this.$dimer.zone(this.$route.params.zone)

// Using default zone
this.$dimer.defaultZone()
```

### [Zone](https://github.com/dimerapp/dimer-vue/blob/develop/src/Api/Zone.js)
The following methods are available on the Zone class.

#### getVersions
Returns an array of versions for a given zone.

```js
const zone = this.$dimer.zone(params.zone)

// Returns from initial load
zone.getVersions()
```

#### version(no)
Get an instance of a given version inside a zone. Again if your app uses only a single version, then you can call the `defaultVersion` method.

```js
const version = this.$dimer
    .zone(this.$route.params.zone)
    .version(this.$route.params.version)

const version = this.$dimer
    .defaultZone()
    .defaultVersion()
```

### [Version](https://github.com/dimerapp/dimer-vue/blob/develop/src/Api/Version.js)
The following methods exists on the Version class. Also you get access to this using `this.$activeDimer` property.

#### getTree(options)
Get tree of `categories` and their `docs` for a given version. The value is cached after first load. However, you can pass `options.reload` to always get the latest tree from the server.

```js
// API call
await this.$activeDimer.getTree()

// with options
await this.$activeDimer.getTree({
  reload: true,
  query: {
    limit: '10',            // Limit the number of categories (default=nolimit)
    load_content: true,     // Load docs content inline (default=false)
    load_version: true      // Load version node within content node (default=false)
  }
})
```

#### getDoc(permalink, options)
Get contents for a `doc` with its permalink and for a given version.

```js
// API call
await this.$activeDimer.getDoc(params.permalink, {
  query: {
    load_version: true // Load version node within content node (default=false)
  }
})
```

#### search(query, [limit])
Search docs for a given version.

```js
// API call
await this.$activeDimer.search(USER_QUERY)
```

## activeDimer
Understanding the use of `$activeDimer` is very important. Also the property `$activeDimer` is not available in all routes, it's only available when

1. Current route falls inside one of the registered routes with Dimer.
2. You are using Vue router or router with similar API.
3. The params placeholder must use `:zone` for zone, `:version` for version no and `:permalink` for doc permalink.

Registering Vue routes:
```js
new VueRouter({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/:zone/:version/:permalink',
      name: 'doc',
      component: Doc
    }
  ]
})
```

Now, we need to tell Dimer that the `Doc` route is meant to render docs, so that dimer should inject `$activeDimer` property and you can make use of it to make API calls.

```js
Dimer.use(DimerApi, {
  routes: [
    {
      name: 'doc',
      path: '/:zone/:version/:permalink',
    }
  ]
})
```

Now anytime someone will visit `/:zone/:version/:permalink`, dimer will inject `$activeDimer` to your components and you can use it to make API calls as follows.

```js
await this.$activeDimer.getDoc(this.$route.params.permalink)
await this.$activeDimer.getTree()

await this.$activeDimer.search('user query')
```

## Dimer Tree
The `DimerTree` component is the bare minimum you need to render markdown JSON AST as Vue elements.

```js
import { Dimer, DimerTree } from 'dimer-vue'
Dimer.use(DimerTree)
```

Now, you can use it as follows.

```vue
<template>
 <div>
   <h1> {{ doc.title }} </h1>
   <dimer-tree :node="doc.contents">
 </div>
</template>
```

The significant part about the Dimer Tree component is that you can define your own `renderers` for specific elements.

For example, You want to add a class to each `h2` in your documentation.

```js
import { utils } from 'dimer-vue'

Dimer.addRenderer(function (node, rerender, createElement) {
  if (node.tag === 'h2') {
    node.props.className = ['section-title']

    return createElement('h2', {
      attrs: utils.propsToAttrs(node.props)
    }, node.children.map(rerender))
  }
})
```

Or adding target blank to all external URL's.

```js
import { utils } from 'dimer-vue'

Dimer.addRenderer(function (node, rerender, createElement) {
  if (node.tag === 'a' && /^http(s)?/.test(node.url)) {
    node.props.target = '_blank'
    
    return createElement('a', {
      attrs: utils.propsToAttrs(node.props)
    }, node.children.map(rerender))
  }
})
```

### Component level renderers

Renderers added using `Dimer.addRenderer` are added globally. Which means, everytime you use `<dimer-tree>`, then will be applied by default.

However, at times, you may want more control by defining different renderers in different areas of your website.

For example: At Dimer, we want to apply different `renderers` when showing FAQ's and apply different when showing normal Guides. This is where we use **Component level renderers**.

```vue
<template>
  <dimer-tree :customRenderers="customRenderers" />
</template>

<script>
  function faqRenderer (node, rerender, createElement) {
  }

  export default {
    methods: {
      customRenderers (globalRenderers) {
        return [faqRenderer]
      }
    }
  }
</script>
```

The `customRenderers` prop is a function, which receives an array of `globalRenderers` and the output of this function defines the renderers to be used by the component.

By allowing a function, we enable you to re-use `globalRenderers`, cherry pick by filtering from the globalRenderers or `concat` new to them. **Just make sure that return value is an array of functions**


## Dimer Search

The `DimerSearch` component gives you the bare bones to implement the search functionality in your Vue.js apps. 

The component doesn't create any markup, and neither provides any styling. We encourage theme creators to do that.

```js
import { Dimer, DimerSearch } from 'dimer-vue'

Dimer.use(DimerSearch)
```

Now, you can make use of the search component as follows.

```vue
<template>
  <dimer-search :model="model">
    <template slot-scope="searchScope">  
      <input
        type="search"
        v-model="model.query"
        @keyup="searchScope.triggerSearch"
      />
      
      <div>
       <li v-for="row in model.results">
         <h2>
           <component :is="searchScope.renderMark(row.title.marks)" />
          </h2>
          <p v-if="row.body.length">
            <component :is="searchScope.renderMark(row.body[0].marks)" />
          </p>
       </li>
      </div>
    </template>
  </dimer-search>
</template>

<script>
  export default {
    data () {
      return {
        model: {
          query: '',
          results: [],
          activeIndex: 0
        }
      }
    }
  }
</script>
```

### Highlighting search results using arrow keys
The search component listens for `up` and `down` arrows and updates the `activeIndex` property. Now you can use this property to highlight search results as follows.

```vue
<li
  v-for="(row, index) in model.results"
  :class="{highlight: index === model.activeIndex}"
>
</li>
```

If you want, you can define your custom listeners for `arrowUp` and `arrowDown`. In that case, the default functionality is removed.

#### @onArrowUp
```vue
<dimer-search :model="model" @onArrowUp="customHandler">
</dimer-search>
```

#### @onArrowDown
```vue
<dimer-search :model="model" @onArrowUp="customHandler">
</dimer-search>
```

### Using Enter to visit the selected doc
Now since users can use their keyboard to navigate through the list of search results, we can also let them `Press Enter` to select a search result.

#### @onEnter
```vue
<template>
  <dimer-search :model="model" @onEnter="openActiveDoc">
  </dimer-search>
</template>

<script>
export default {
  methods: {
    openActiveDoc () {
      const selectedRow = this.model.results[this.model.activeIndex]
      const { params } = this.$route

      if (selectedRow) {
        this.$router.push({
          path: `${params.zone}/${params.version}/${selectedRow.url}`
        })
      }
    }
  }
}
</script>
```

### Hiding search results
The search results and active is cleared whenever the user clicks the `escape` key. However, you can override the `@onEscape` listener to define your custom behavior.

```vue
<dimer-search :model="model" @onEscape="customHandler">
</dimer-search>
```

Also, if you want to hide results `onBlur` or any other action, clear the model properties.

```js
this.model.query = ''
this.model.results = []
this.model.activeIndex = 0
```


## Dimer Tabs
The `DimerTabs` component is used to display a [group of code blocks](https://dimerapp.com/syntax-guide/codegroups) as tabs. Like [Dimer Search](#dimer-search), this component also comes with no styling or markup, and we expect the theme creators to define that.

This component cannot be used directly since we need to hook it into the Dimer rendering process and then render this component. So, we are going to make use of `renderers` to make use of the tabs component.

```js
import { Dimer, DimerTabs } from 'dimer-vue'

Dimer.use(DimerTabs)
```

Next, we need to create a custom component, which uses the `dimer-tabs` component and defines the markup and CSS for it.

**components/Tabs.vue**
```vue
<template>
  <dimer-tabs :node="node">
    <template slot-scope="tabsScope">
      <div class="tabsHead">
        <a
          v-for="(link, index) in tabsScope.links" @click.prevent="activeTab(index)"
        >
          {{ link }}
        </a>
      </div>

      <div class="tabBody">
        <div
          v-for="(pane, index) in tabsScope.panes"
          v-show="index === activeIndex"
        >
          <dimer-tree :node="pane" />
        </div>
      </div>
    </template>
  </dimer-tabs>
</template>

<script>
export default {
  data () {
    return {
      activeIndex: 0
    }
  },

  methods: {
    activeTab (index) {
      this.activeIndex = index
    }
  },

  props: ['node']
}
</script>
```

Now, we can finally add a renderer to the Dimer rendering process and use this component for displaying tabs.

```js
import Tabs from '~/components/Tabs'

Dimer.addRenderer(function (node, rerender, createElement) {
  if (node.tag === 'div' && node.props.className && node.props.className.indexOf('tabs') > -1) {
    return createElement(Tabs, { props: { node } })
  }
})
```

## Utils
The utils object has several handy methods to make certain tasks simple.

#### isARedirect(responseBody)
Since docs in Dimer can define their `redirects`, we need to handle this part in the Vue app to redirect the user to correct permalink.

This is done by inspecting the response of `getDoc` method. Following is the complete example of same.

```js
const response = await this.$activeDimer.getDoc(params.permalink)

if (utils.isARedirect(response)) {
  const { params } = this.$route

  this.$router.push({
    path: `${params.zone}/${params.version}/${response.redirect}`
  })
  return
}

// otherwise render doc
```

#### extractNode(node, callback)
Remove a node from the top level children of the `doc.contents` Object. This is usually used to extract the `toc` container and render it as a separate element on the UI.

```js
const toc = utils.extractNode(doc.contents, ({ tag, props }) => {
  return tag === 'div' && props.className.indexOf('toc-container') > -1
})

doc.contents // without tot-container
toc // just toc-container
```

Later, you can render them as two different elements.

```vue
<article>
  <dimer-tree :node="doc.contents" />
</article>

<aside>
  <dimer-tree :node="toc" />
</aside>
```

#### propsToAttrs(props)
Convert dimer node props to VueJs attrs.

```js
createElement('div', { attrs: utils.propsToAttrs(node.props) }, [])
```

## Usage with Nuxt
Using `dimer-vue` with Nuxt is really simple. All we need is a [plugin](#nuxt-plugin) and a [middlware](#nuxt-middleware).

What we need to do is set `$dimer` and `$activeDimer` properties on the Nuxt App when it is rendered on server side. If you are not aware of the Nuxt lifecycle, then inside `asyncData` method, you cannot access Vue instance. Which means properties like `$dimer` and `$activeDimer` are not available unless the VueJs component is booted.

### Nuxt plugin
Let's hook everything inside `plugins/dimer.js` file.

> Make sure to register the plugin inside `nuxt.config.js` file.

```js
import Vue from 'vue'
import { Dimer, DimerApi, DimerSearch, DimerTabs, DimerTree, utils } from 'dimer-vue'

export default async function ({ app }) {
   // required
  Dimer.use(DimerApi, {
    apiUrl: 'http://localhost:5000',
    docRouteName: 'doc'
  })
  Dimer.use(DimerTree)

  // optional
  Dimer.use(DimerSearch)
  Dimer.use(DimerTabs)

  // Inject Vuejs Plugin
  Vue.use(Dimer)

  // Attach dimer on the app too
  app.dimer = Vue.prototype.$dimer

  // Make initial api call to fetch config, zones and versions
  await app.dimer.load()
}
```

### Nuxt middleware
The nuxt middleware is required to attach `activeDimer` property to the app. Since this property is computed based upon the current route, we need to place it inside a middleware and not the plugin file (plugins are executed once only and not on each route change).

```js
export default function ({ app }) {
  const { route } = app.context
  
  if (app.dimer.isDocRoute(route)) {
    const { zoneSlug, versionNo } = app.dimer.getClosestZoneAndVersion(route.params)
    app.activeDimer = app.dimer.zone(zoneSlug).version(versionNo)
  }
}
```

### Doc Page
Now inside your `doc` page. You will be able to make API calls as follows.

```js
<template>
<div>
  <aside>
    <div v-for="node in tree">
      <h3> {{ node.category }} </h3>
      <ul>
        <li v-for="doc in node.docs">
          <nuxt-link :to="doc.permalink">
            {{ doc.title }}
          </nuxt-link>
        </li>
      </ul>
    </div>
  </aside>

  <article>
    <dimer-tree :node="doc.content" />
  </article>
</div>
</template>

<script>
  export default {
    middleware: ['dimer'],

    async asyncData ({ app, params }) {
      const { permalink } = params
      const [ tree, doc ] = Promise.all([this.activeDimer.getTree(), this.activeDimer.getDoc(permalink)])
      return { tree, doc }
    }
  }
</script>
```

## Development
1. Fork and clone the repo.
2. Make your changes with good commit messages.
3. Once done, share a PR.

## License

The code is released under [MIT License](LICENSE.md).

## Contributors

[thetulage](https://github.com/thetutlage) and everyone who has committed to this repo is proud contributors.
