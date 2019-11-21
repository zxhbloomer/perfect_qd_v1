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
  if (this.$vnode.parent === undefined) {
    return
  }
  const cache = this.$vnode.parent.componentInstance.cache
  const keys = this.$vnode.parent.componentInstance.keys
  // const keys = this.$vnode.parent.componentInstance.keys
  // 忽略掉组件为null的key值
  // const cacheLen = 0
  let count = 0
  for (const item in keys) {
    if (keys[item] === null) {
      continue
    }
    const key = keys[item].split('-')[2]
    if (!cachedViews.includes(key)) {
      console.log('删除keys开始：')
      console.log(keys)
      keys.splice(count, 1)
      console.log('删除keys结束：')
      console.log(keys)
    }
    count++
  }
  for (const item in cache) {
    if (cache[item] === null) {
      continue
    }
    const key = cache[item].data.key
    let deleteFlg = true
    // for (const cachedItem in cachedViews) {
    //   if (key === cachedViews[cachedItem]) {
    //     deleteFlg = false
    //   }
    // }
    if (cachedViews.includes(key)) {
      deleteFlg = false
    }
    if (deleteFlg) {
      console.log('清空keepalive开始：')
      console.log(cache[item].componentInstance)
      cache[item].componentInstance.$destroy()
      cache[item] = null
      console.log('清空keepalive结束')
    }
    // cache[item].data.key
  }
}
