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
| CJS                    | 26 KB  | 5.83 KB  |
| UMD                    | 28.3 KB   | 6.02 KB  |
| UMD MIN                | 9.63 KB   | 2.98 KB  |

The goal of the project is to make it easier to create custom designs for your documentation, without re-creating the core elements or components.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Table of contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Nuxt usage](#nuxt-usage)
  - [Setup `nuxt.config.js` file](#setup-nuxtconfigjs-file)
  - [Registering routes](#registering-routes)
    - [Layout component](#layout-component)
    - [Doc component](#doc-component)
- [Vuex store](#vuex-store)
- [Dimer plugins](#dimer-plugins)
  - [Dimer tree](#dimer-tree)
    - [Component renderers](#component-renderers)
  - [Dimer tabs](#dimer-tabs)
  - [Dimer collapse](#dimer-collapse)
  - [Dimer search](#dimer-search)
    - [Events](#events)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


## Prerequisites 
Before getting started, make sure you know how to connect to the Dimer API server.

1. If you are testing it on your local server, then it will be accessible as `http://localhost:5000`
2. If you have published it on Dimer cloud, then it will be `https://api.dimerapp.com/YOUR_DOMAIN`.

## Installation
Install the package from npm registry as follows:

```sh
npm i dimer-vue

# yarn
yarn add dimer-vue
```

## Nuxt usage
The documentation covers this module usage with Nuxt. However, any Vue project using **Vue router** and **Vuex store** can leverage the API.

> Nuxt has almost zero boilerplate to create full blow SPA in Vue.js. So give it a try.

Before getting started, you have to install handful of dependencies and register them as nuxt modules inside `nuxt.config.js` file.

```sh
npm i nuxt-env @nuxtjs/axios @nuxtjs/router
```

- The `nuxt-env` is required, so that we can define environment variable for the Dimer API base url. The environment variables gives us the freedom to point to a different API endpoints in **production** and **development** respectively.
- The `@nuxtjs/axios` is required for making API calls.
- The `@nuxtjs/router` is required to register custom routes exposed by this module. The route is an optional dependency, however it makes the process of registering custom routes so simple. 

### Setup `nuxt.config.js` file
Next step is to setup the `nuxt.config.js` file with following code.

```js
export default {
  modules: [
    '@nuxtjs/router',
    '@nuxtjs/axios',
    ['nuxt-env', {
      keys: [{
        key: 'DIMER_BASE_URL',
        default: 'http://localhost:5000'
      }]
    }]
  ],
  plugins: ['~plugins/dimer.js']
}
```

We will create `~plugins/dimer.js` now, with following contents.

```js
import Vue from 'vue'
import { Dimer, DimerTree } from 'dimer-vue'

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

The dimer plugin is straight forward. We pre-load some stuff from the API to the **Vuex store** and also **inject** some helper functions.

> Feel free to add custom renderers and Dimer plugins inside this file.

### Registering routes
Now, we need to register couple of routes, which are handled by Dimer. This is done, so that Dimer can offload the task of making API calls, validating routes to have correct `zone` and `version` etc.

We will leverage the `router` module and define following routes inside `router.js` file.

```js
import Vue from 'vue'
import Router from 'vue-router'
import { routes } from 'dimer-vue'

import LayoutComponent from '~/components/Layout'
import DocComponent from '~/components/Doc'

Vue.use(Router)

export function createRouter() {
  return new Router({
    mode: 'history',
    routes: routes(LayoutComponent, DocComponent)
  })
}
```

The `routes` function exported by Dimer will register following routes

- `:/zone/:version`
- `:/zone/:version/:permalink`

Also, if you have noticed, the `routes` function accepts two Vue components. These components are rendered when Dimer will receive request on the registered routes.

#### Layout component
Define the complete page layout and documentation navigation (usually a sidebar) in this file.

```vue
<template>
  <section>    
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

<style>
  .main {
    display: flex;
  }

  .aside {
    width: 300px;
    padding-right: 40px;
  }
</style>
```

#### Doc component
The `Doc` component is meant to render a single doc.

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

That's all. Now you have a fully working Nuxt app consuming the Dimer API and rendering docs. From here

- You are free to design and structure the layout as per your needs.
- Use any Dimer plugins to enhance the documentation.
- Don't worry about someone entering the wrong URL, as Dimer custom routes will handle everything for you.

## Vuex store
The `Dimer.loadStore` method registers a module named `dimer` and makes the API calls to the Dimer API and add following values to the store.

```js
{
  websiteOptions: {},
  zones: []
}
```

1. The `websiteOptions` is loaded from `/config.json` endpoint.
2. The `zones` are loaded from `/zones.json` endpoint.

You are free to read values from the store from any custom component. For example: Rendering the main menu from the available zones and so on. 

## Dimer plugins
The Dimer plugins are mainly focused on the Rendering layer of Vue. As you know that Dimer API returns the markdown content as JSON AST and available plugins can ease the process of rendering and handling certain nodes differently.

### Dimer tree
The `DimerTree` is the bare minimum you need to render the JSON AST as it is.

```js
import { DimerTree, Dimer } from 'dimer'
Dimer.use(DimerTree)
```

and then use the component as follows:

```vue
<template>
  <dimer-tree :node="doc.content" />
</template>
```

The `DimerTree` component also accepts one or more `renderer` functions. These functions will receive all the AST nodes and can handle them any way. 

Let's say we want to add `target="_blank"` to all external links. We can define a renderer for that.

```js
import { DimerTree, Dimer, utils } from 'dimer'
Dimer.use(DimerTree)

Dimer.addRenderer(function (node, rerender, createElement) {
  if (node.tag === 'a' && /^http(s)?/.test(node.url)) {
    node.props.target = '_blank'

    const attrs = utils.propsToAttrs(node.props)
    const children = node.children.map(rerender)

    return createElement('a', { attrs }, children)
  }
})
```

> The possibilities with custom renderers are endless

#### Component renderers
The renderers added via `Dimer.addRenderer` are global and will always be used by `dimer-tree` component. However, you can use `customRenderers` prop to define custom renderers.

```vue
<template>
  <dimer-tree :node="doc.content" />
</template>

<script>
  function myCustomRenderer (node, rerender, createElement) {
  }

  export default {
    methods: {
      customRenderers (globalRenderers) {
        return globalRenderers.concat(myCustomRenderer)
      }
    }
  }
</script>
```

### Dimer tabs
The `DimerTabs` component is registered to ease the process showing multiple codeblocks inside a tab. They are defined using the `[codeblock]` macro in Markdown.

This is a renderless component, that you need to wrap in order to define your own markup for tabs.

The first step is to define a Dimer renderer, that returns a custom component for the `tabs` node.

```js
import { Dimer, DimerTabs } from 'dimer-vue'
Dimer.use(DimerTabs)

import Tabs from '~/components/Tabs'

Dimer.addRenderer(function (node, rerender, createElement) {
  if (node.props.className && node.props.className.indexOf('tabs') > -1) {
    return createElement(Tabs, { props: { node } })
  }
})
```

Next step is to create the `~components/Tabs` component. This component will make use `DimerTabs` and defines the markup for the tabs.

```vue
<template>
  <dimer-tabs :node="node">
    <template slot-scope="tabs">
      <div class="tabsHead">
        <a
          v-for="(link, index) in tabs.links" @click.prevent="activeTab(index)"
        >
          {{ link }}
        </a>
      </div>

      <div class="tabBody">
        <div
          v-for="(pane, index) in tabs.panes"
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

### Dimer collapse
The `DimerCollapse` component is similar to the `DimerTabs` component, but to define the custom markup and behavior for the `[collapse]` macro.

```js
import { Dimer, DimerCollapse } from 'dimer-vue'
Dimer.use(DimerCollapse)

import Collapse from '~/components/Collapse'

Dimer.addRenderer(function (node, rerender, createElement) {
  if (node.props.className && node.props.className.indexOf('collapsible') > -1) {
    return createElement(Collapse, { props: { node } })
  }
})
```

Next step is to create the `~/components/Collapse` component.

```vue
<template>
  <dimer-collapse :node="node">
    <template slot-scope="collapse">
      <details>
        <summary>{{ collapse.title }}</summary>
        <dimer-tree :node="collapse.body" />
      </details>
    </template>
  </dimer-collapse>
</template>

<script>
  export default {
    props: ['node']
  }
</script>
```

### Dimer search
Dimer has inbuilt search for documentation and instead of building the entire **Typeahead search** from hand, we recommend using the renderless `DimerSearch` component.

```js
import { Dimer, DimerSearch } from 'dimer-vue'
Dimer.use(DimerSearch)
```

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
       <div v-for="item in model.data">
         <p> Results for {{ item.zone }} </p>
         <li v-for="row in item.results">
           <h2>
             <component :is="searchScope.renderMark(row.title.marks)" />
            </h2>
            <p v-if="row.body.length">
              <component :is="searchScope.renderMark(row.body[0].marks)" />
            </p>
         </li>
        </div>
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
          data: [
            {
              zone: 'faqs',
              version: 'master',
              results: [],
            }
          ]
        }
      }
    }
  }
</script>
```

#### Events
You can define listeners for following events.

```vue
<dimer-search
  :model="model"
  @onArrowUp="customHandler"
  @onArrowDown="customHandler"
  @onEnter="customHandler"
  @onEscape="customHandler"
>
</dimer-search>
```
