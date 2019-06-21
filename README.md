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

- [Dimer tree](#dimer-tree) component to convert Dimer JSON to Vue `createElement`. 
- [Dimer Search](#dimer-search) component to search documentation.
- [Dimer Tabs](#dimer-tabs) component to render multiple codeblocks as tabs.
- [Dimer Collapse](#dimer-collapse) component to render collapsable elements
- [Utils](#utils) for commonly required tasks.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Table of contents

- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Dimer Tree](#dimer-tree)
  - [Component level renderers](#component-level-renderers)
- [Dimer Search](#dimer-search)
  - [Highlighting search results using arrow keys](#highlighting-search-results-using-arrow-keys)
    - [@onArrowUp](#onarrowup)
    - [@onArrowDown](#onarrowdown)
  - [Using Enter to visit the selected doc](#using-enter-to-visit-the-selected-doc)
    - [@onEnter](#onenter)
  - [Hiding search results](#hiding-search-results)
- [Dimer Tabs](#dimer-tabs)
- [Dimer collapse](#dimer-collapse)
- [Utils](#utils)
    - [isARedirect(responseBody)](#isaredirectresponsebody)
    - [extractNode(node, callback)](#extractnodenode-callback)
    - [propsToAttrs(props)](#propstoattrsprops)
- [Usage with Nuxt](#usage-with-nuxt)
  - [Pre-requisites](#pre-requisites)
  - [Layout component](#layout-component)
- [Development](#development)
- [License](#license)
- [Contributors](#contributors)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


## Prerequisites 
Before getting started, make sure you know how to connect to the Dimer API server.

1. If you are testing it on your local server, then it will be accessible as `http://localhost:5000`
2. If you have published it on Dimer cloud, then it will be `https://api.dimerapp.com/YOUR_DOMAIN`.

## Setup
Install the package from npm registry as follows.

```shell
npm i dimer-vue

# yarn
yarn add dimer-vue
```

Once installed, you can make use of it as follows.

```js
import { Dimer, DimerTree } from 'dimer-vue'
import Vue from 'vue'

Dimer.use(DimerTree)

// Finally hook Dimer with VueJs
Vue.use(Dimer)
```

The `Dimer.use` function accepts the Dimer plugins. Finally, you will have to call `Vue.use(Dimer)`, so that Dimer can do its job of hooking it's plugins into the Vue runtime.

## Dimer Tree
The `DimerTree` component is the bare minimum you need to render markdown JSON AST as Vue elements.

```js
import { Dimer, DimerTree } from 'dimer-vue'
Dimer.use(DimerTree)

Vue.use(Dimer)
```

Now, you can use it as follows.

```vue
<template>
  <section>
    <div v-if="doc">
      <h1> {{ doc.title }} </h1>
      <dimer-tree :node="doc.content">
    </div>
  </section>
</template>

<script>
  import axios from 'axios' 

  export default {
    data () {
      doc: null
    },
    
    mounted () {
      const url = 'http://localhost:5000/guides/master/introduction.json'

      const response = await axios.get(url)      
      this.doc = response.data
    }
  }
</script>
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

## Dimer collapse

The `DimerCollapse` component is used to handle the `[collapse]` macro output.

The usage is similar to `DimerTabs` component.

```js
import { Dimer, DimerCollapse } from 'dimer-vue'
Dimer.use(DimerCollapse)
```

```js
<template>
  <dimer-collapse :node="node">
    <template slot-scope="collapseScope">
      <details>
        <summary>{{ collapseScope.title }}</summary>
        <dimer-tree :node="collapseScope.body" />
      </details>
    </template>
  </dimer-collapse>
</template>
```

Finally, add a new renderer to handle collapse node.

```js
import Collapse from '~/components/Collapse'

Dimer.addRenderer(function (node, rerender, createElement) {
  if (node.props.className && node.props.className.indexOf('collapsible') > -1) {
    return createElement(Collapse, { props: { node } })
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
The usage of Dimer gets very interesting with Nuxt, since you can build a fully functional routing based documentation site with it.

### Pre-requisites 

1. Your app must make use of [Vuex store](https://nuxtjs.org/guide/vuex-store).
2. Use `@nuxtjs/axios` module for API calls.
3. You have to inject couple of routes programmatically. We personally ditch the `pages` routing completely and started using [router-module](https://github.com/nuxt-community/router-module). Another way can be use [extendRoutes](https://nuxtjs.org/api/configuration-router#extendroutes) in `nuxt.config.js` file.

**Let's get started**.

The first step is to create a Nuxt plugin and write following code snippet inside it.

```js
import { Dimer, DimerTree } from 'dimer-vue'
import Vue from 'vue'

export default async function (ctx, inject) {
  Dimer.use(DimerTree)
  
  /**
   * Injects handful of utility methods and loads the vuex
   * store with `dimer` module.
   */
  await Dimer.loadStore(ctx, inject)
  
  Vue.use(Dimer)
}
```

```js
{
  plugins: ['~plugins/dimer.js']
}
```

Next, we need to register a couple of dynamic routes. These routes are meant to handle the Vue requests, call the correct Dimer API endpoint and then pass data to you.

**Using router module router.js file.**

```js
import Vue from 'vue'
import Router from 'vue-router'
import { routes } from 'dimer-vue'

import LayoutComponent from '~components/Layout'
import DocComponent from '~components/Doc'

const dimerRoutes = routes(LayoutComponent, DocComponent)

Vue.use(Router)

export function createRouter() {
  const appRoutes = dimerRoutes.concat([
    // Your application routes
  ])

  return new Router({
    mode: 'history',
    routes: appRoutes
  })
}
```

The `dimerRoutes` will register following routes to the Vue router.

- `:zone/:version`
- `:zone/:version/:permalink`

Any requests coming to these routes will be handled by Dimer and it will call the Dimer API and passes the content to your components.

### Layout component

The layout component is responsible for rendering the page layout and the documentation navigation (which is usually the sidebar).

```vue
<template>
  <section>
    <header>
    </header>
    
    <main>
      <aside>
        <ul v-for="node in tree">
          <h2> {{ node.category }} </h2>
          <li v-for="doc in node.docs">
            <nuxt-link :to="doc.permalink">
              {{ doc.title }} 
            </nuxt-link>
          </li>
        </ul>
      </aside>
      
      <article>
        <nuxt-child />
      </article>
    </main>
  </section>
</template>

<script>
 export default {
   props: ['tree']
 }
</script>
``` 

Once, done with the layout, we need another component to render the actual doc.

```vue
<template>
  <div>
    <h1> {{ doc.title }} </h1>
    <dimer-tree :node="doc.content" />
  </div>
</template>

<script>
 export default {
   props: ['doc']
 }
</script>
```

That's all you need :)

## Development
1. Fork and clone the repo.
2. Make your changes with good commit messages.
3. Once done, share a PR.

## License

The code is released under [MIT License](LICENSE.md).

## Contributors

[thetulage](https://github.com/thetutlage) and everyone who has committed to this repo is proud contributors.
