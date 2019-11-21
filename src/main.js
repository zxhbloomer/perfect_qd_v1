import Vue from 'vue'

import Cookies from 'js-cookie'

import 'normalize.css/normalize.css' // a modern alternative to CSS resets

import Element from 'element-ui'
import './styles/element-variables.scss'

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

import './icons' // icon
import './permission' // permission control
import './utils/error-log' // error log

import * as filters from './filters' // global filters

/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online! ! !
 */
import { mockXHR } from '../mock'
if (process.env.NODE_ENV === 'production') {
  mockXHR()
}

// add by zxh
import commonFunction from './common/commonFunction'
import constants from './common/constants/constants'
import EventProxy from 'vue-event-proxy'

Vue.use(commonFunction)
Vue.prototype.CONSTANTS = constants
Vue.use(EventProxy)

Vue.use(Element, {
  size: Cookies.get('size') || 'mini' // set element-ui default size
})

// register global utility filters
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})

/**
   * 手动清空缓存，把不用的缓存删除
   */
Vue.prototype.$destroyKeepAlive = function(cachedViews, cachedKeys) {
  const cache = this.$vnode.parent.componentInstance.cache
  // const keys = this.$vnode.parent.componentInstance.keys
  // 忽略掉组件为null的key值
  // const cacheLen = 0
  debugger
  for (const item in cache) {
    const tag = cache[item].tag
    let deleteFlg = true
    for (const cachedItem in cachedViews) {
      if (tag.includes(cachedViews[cachedItem])) {
        deleteFlg = false
      }
    }
    if (deleteFlg) {
      cache[item].componentInstance.$destroy()
      cache[item] = null
    }
    // cache[item].data.key
  }
}
