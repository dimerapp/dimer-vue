import Vue from 'vue/dist/vue'
import Search from '../src/DimerSearch/component'
import { Dimer, DimerApi } from '../src/main'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

Dimer.use(DimerApi, {
  baseUrl: 'http://localhost:5000',
  docUrlPattern: ':zone/:version/:permalink'
})

Vue.use(Dimer)
Vue.mixin({
  beforeMount () {
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
      }
    }
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
