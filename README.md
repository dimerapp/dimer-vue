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

This repo helps you to build the UI using the API exposed by your Dimer project. 

| file                   | size     | gzip size |
|------------------------|----------|-----------|
| CJS                    | 27.09 KB  | 6.47 KB  |
| UMD                    | 29.2 KB   | 6.61 KB  |
| UMD MIN                | 9.49 KB   | 3.15 KB  |

The goal of the project is to make it easier to create custom designs for your documentation, without re-creating the core 
elements or components.

Following is the list of included components and API's:

- [SDK](#sdk) to make API calls
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
  baseUrl: 'http://localhost:5000',
  docRouteName: 'doc'
})

// Finally hook Dimer with VueJs
Vue.use(Dimer)
```

## Injected properties
You can access the following properties inside your vue components.

1. `this.$dimer` when using the `DimerApi` plugin.
2. `this.$activeDimer` when using Vue router and have defined the `docRouteNamee`.  The `$activeDimer` will only be available for that route.
3. `dimer-search` component when using `DimerSearch` plugin.
4. `dimer-tabs` component when using `DimerTabs` plugin. 
5. `dimer-tree` component when using `DimerTree` plugin. 

### $activeDimer
The `docRouteName` must be defined when using vue router. When it is defined, Dimer will inject `$activeDimer` property to your components, which you can use this property to fetch the data for the current zone and version.

Define the vue route as follows:

> The `path` defined in the vue router can be custom. However, the `params` name have to match. So if you are using the zone name in your URL's, then the param must be `:zone` and same is for `:version`.

```js
const router = new VueRouter({
  routes: [
    {
      path: '/:zone/:version/:permalink',
      name: 'doc',
      component: Doc
    }
  ]
})
```

Then tell Dimer about the route name.

```js
Dimer.use(DimerApi, {
  baseUrl: 'http://localhost:5000',
  docRouteName: 'doc'
})
```

And finally use it as

```js
this.$activeDimer.getDoc(permalink)
this.$activeDimer.getTree()
this.$activeDimer.makeUrl(permalink)
this.$activeDimer.search(query, limit)
```

## SDK
The job of the SDK is to make REST calls to the Dimer API server. It hides the complexity of manually creating HTTP requests and instead provides a clean API to fetch and use data.

At a bare minimum, you need to register the `DimerApi` plugin with the `Dimer` object as shown below.

```js
import { Dimer, DimerApi } from 'dimer-vue'

Dimer.use(DimerApi, {
  baseUrl: 'http://localhost:5000',
  docRouteName: 'doc'
})
```

**Once done, you can access `this.$dimer` from your Vue.js components.**

- The `baseUrl` is the URL for your API server.
- The `docRouteName` is the route name you will define with Vue router or Nuxt router. You have to tell this to Dimer also so that it can make internal links properly for you.

#### load
The `load` function must be called when you boot your VueJs or Nuxt app. It will hit the Dimer servers and pre-fetches all `zones` and `versions` for you.

Multiple calls to the `load` method are ignored. So we suggest using the Nuxt middleware to call the load function.

```js
export default async function ({ app, isServer }) {
  if (isServer) {
    await app.$Dimer.load()
  }
}
```

#### zone(slug)
Get an instance of a zone for a given slug. If your app is not making use of zones, you can make use of `defaultZone` method.

```js
// Get zone slug from URL
this.$dimer.zone(params.zone)

// Using default zone
this.$dimer.defaultZone()
```

#### getVersions
Returns an array of versions for a given zone.

```js
const zone = this.$dimer.zone(params.zone)

// Returns from initial load
zone.getVersions()
```


#### version(no, docUrlPattern)
Get an instance of a given version inside a zone. Again if your app uses only a single version, then you can call the `defaultVersion` method.

```js
const version = this.$dimer
    .zone(params.zone)
    .version(params.version, this.$route.path)

const version = this.$dimer
    .defaultZone()
    .defaultVersion(this.$route.path)
```

#### getTree(reload = false)
Get tree of `categories` and their `docs` for a given version. The value is cached after first load. However, you can pass `reload=true` to hit the API server again.

```js
// API call
await this.$activeDimer.getTree()
```

#### getDoc(permalink)
Get contents for a `doc` with its permalink and for a given version.

```js
// API call
await this.$activeDimer.getDoc(params.permalink)
```

#### search(query, [limit])
Search docs for a given version.

```js
// API call
await this.$activeDimer.search(USER_QUERY)
```

#### makeUrl(permalink)
Make an absolute URL for a permalink.

The `this.$activeDimer` is defined when your app is using the `Vue-router` and you have defined the `docRouteName` inside the dimer config.

```js
<nuxt-link :to="this.$activeDimer.makeUrl(doc.permalink)">
 {{ doc.title }}
</nuxt-link>
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
      
      if (selectedRow) {
        this.$router.push({
          path: this.$activeDimer.makeUrl(selectedRow.url)
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
  this.$router.push({
    path: this.$activeDimer.makeUrl(response.redirect)
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

## Development
1. Fork and clone the repo.
2. Make your changes with good commit messages.
3. Once done, share a PR.

## License

The code is released under [MIT License](LICENSE.md).

## Contributors

[thetulage](https://github.com/thetutlage) and everyone who has committed to this repo is proud contributors.
