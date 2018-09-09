import Vue from 'vue/dist/vue'
import Search from '../src/DimerSearch/component'
import DimerTabs from '../src/DimerTabs/component'
import { Dimer, DimerApi, DimerTree } from '../src/main'
import VueRouter from 'vue-router'

Vue.use(VueRouter)
Vue.component('DimerTabs', DimerTabs)

Vue.component('Tabs', {
  template: `
  <dimer-tabs :node="node">
    <template slot-scope="tabsScope">
      <div class="tabsHead">
        <a v-for="(link, index) in tabsScope.links" @click.prevent="activeTab(index)">{{ link }}</a>
      </div>

      <div class="tabBody">
        <div v-for="(pane, index) in tabsScope.panes" v-show="index === activeIndex">
          <dimer-tree :node="pane" />
        </div>
      </div>
    </template>
  </dimer-tabs>
  `,

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
})

Dimer.use(DimerTree)
Dimer.addRenderer(function (node, rerender, createElement) {
  if (node.tag === 'div' && node.props.className && node.props.className.indexOf('tabs') > -1) {
    return createElement(Vue.component('Tabs'), { props: { node } })
  }
})
Dimer.use(DimerApi, {
  baseUrl: 'http://localhost:5000',
  docUrlPattern: ':zone/:version/:permalink'
})

Vue.use(Dimer)
Vue.mixin({
  beforeCreate () {
    if (this.$parent) {
      this.$dimer = this.Dimer.zone('dev-guides').defaultVersion()
    }
  }
})

Vue.component('App', {
  data: function () {
    return {
      model: {
        query: '',
        activeIndex: 0,
        results: []
      },
      doc: null
    }
  },

  async created () {
    this.doc = await this.$dimer.getDoc('introduction')
  },

  template: `
  <div class="search">
    <search :model="model">
      <template slot-scope="search">
        <input type="search" @keyup="search.triggerSearch" v-model="model.query" />
        <div v-if="model.results">
          <li v-for="(item, index) in model.results" :style="{background: model.activeIndex === index ? 'yellow' : '' }">
            <h2><component :is="search.renderMark(item.title.marks)" /></h2>
            <p v-if="item.body[0]"><component :is="search.renderMark(item.body[0].marks)" /></p>
          </li>
        </div>
      </template>
    </search>

    <div v-if="doc">
      <dimer-tree :node="doc.content" />
    </div>
  </div>
  `,
  components: { Search }
})

const router = new VueRouter({
  mode: 'history',
  routes: [{
    path: '/',
    component: Vue.component('App')
  }]
})

new Vue({
  router,
  el: '#app',
  data: function () {
    return {
      ready: false
    }
  },
  template: '<router-view v-if="ready"></router-view>',
  async created () {
    await this.Dimer.load()
    this.ready = true
  }
})
