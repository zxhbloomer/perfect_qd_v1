const state = {
  visitedViews: [],
  cachedViews: [
    // 'M00000010',
    // 'M00000020', // 字典管理
    // 'M00000021', // 模块管理
    // 'M00000030', // 组织机构

    // 'P00000000',
    // 'P00000010',
    // 'P00000020', // 字典管理--节点
    // 'P00000030', // 字典类型
    // 'P00000040', // 模块管理
    // 'P00000041', // 模块管理 按钮管理
    // 'P00000050', // 字典数据
    // 'P00000060',
    // 'P00000070',
    // 'P00000080', // 租户管理
    // 'P00000081', // 租户管理 左侧树
    // 'P00000082', // 租户管理 右侧grid
    // 'P00000090', // 组织机构--节点
    // 'P00000100', // 集团信息
    // 'P00000110', // 公司信息 企业信息
    // 'P00000120', // 系统菜单
    // 'P00000130', // 地址簿
    // 'P00000140', // 员工管理
    // 'P00000150', // 部门管理
    // 'P00000160', // 岗位管理
    // 'P00000170', // 组织机构管理
    // 'P00000171', // 组织机构管理  左侧树
    // 'P00000172', // 组织机构管理  右侧1
    // 'P00000173' // 组织机构管理  右侧2
  ],
  cachedKeys: []
}
const mutations = {
  ADD_VISITED_VIEW: (state, view) => {
    if (state.visitedViews.some(v => v.path === view.path)) return
    state.visitedViews.push(
      Object.assign({}, view, {
        title: view.meta.title || 'no-name'
      })
    )
  },
  ADD_CACHED_VIEW: (state, view) => {
    if (view.name === 'M00000020') return
    if (state.cachedViews.includes(view.name)) return
    if (!view.meta.noCache) {
      for (const matchedView of view.matched) {
        const { name } = matchedView.components.default
        if (name && state.cachedViews.indexOf(name) === -1) {
          state.cachedViews.push(name)
          // add by zxh start
          state.cachedKeys.push(view.path)
          // add by zxh end
        }
      }
    }
  },

  DEL_VISITED_VIEW: (state, view) => {
    for (const [i, v] of state.visitedViews.entries()) {
      if (v.path === view.path) {
        state.visitedViews.splice(i, 1)
        break
      }
    }
  },
  DEL_CACHED_VIEW: (state, view) => {
    const index = state.cachedViews.indexOf(view.matched[view.matched.length - 1].name)
    // add by zxh start
    if (index > -1) {
      state.cachedKeys.splice(index, 1)
    }
    // add by zxh end
    index > -1 && state.cachedViews.splice(index, 1)
  },

  DEL_OTHERS_VISITED_VIEWS: (state, view) => {
    state.visitedViews = state.visitedViews.filter(v => {
      return v.meta.affix || v.path === view.path
    })
  },
  DEL_OTHERS_CACHED_VIEWS: (state, view) => {
    const index = state.cachedViews.indexOf(view.name)
    if (index > -1) {
      state.cachedViews = state.cachedViews.slice(index, index + 1)
      // add by zxh start
      state.cachedKeys = state.cachedKeys.slice(index, index + 1)
      // add by zxh end
    } else {
      // if index = -1, there is no cached tags
      state.cachedViews = []
      // add by zxh start
      state.cachedKeys = []
      // add by zxh end
    }
  },

  DEL_ALL_VISITED_VIEWS: state => {
    // keep affix tags
    const affixTags = state.visitedViews.filter(tag => tag.meta.affix)
    state.visitedViews = affixTags
  },
  DEL_ALL_CACHED_VIEWS: state => {
    state.cachedViews = []
    // add by zxh start
    state.cachedKeys = []
    // add by zxh end
  },

  UPDATE_VISITED_VIEW: (state, view) => {
    for (let v of state.visitedViews) {
      if (v.path === view.path) {
        v = Object.assign(v, view)
        break
      }
    }
  }
}

const actions = {
  addView({ dispatch }, view) {
    dispatch('addVisitedView', view)
    dispatch('addCachedView', view)
  },
  addVisitedView({ commit }, view) {
    commit('ADD_VISITED_VIEW', view)
  },
  addCachedView({ commit }, view) {
    commit('ADD_CACHED_VIEW', view)
  },

  delView({ dispatch, state }, view) {
    return new Promise(resolve => {
      dispatch('delVisitedView', view)
      dispatch('delCachedView', view)
      resolve({
        visitedViews: [...state.visitedViews],
        cachedViews: [...state.cachedViews],
        // add by zxh start
        cachedKeys: [...state.cachedKeys]
        // add by zxh end
      })
    })
  },
  delVisitedView({ commit, state }, view) {
    return new Promise(resolve => {
      commit('DEL_VISITED_VIEW', view)
      resolve([...state.visitedViews])
    })
  },
  delCachedView({ commit, state }, view) {
    return new Promise(resolve => {
      commit('DEL_CACHED_VIEW', view)
      resolve([...state.cachedViews])
      // add by zxh start
      resolve([...state.cachedKeys])
      // add by zxh end
    })
  },

  delOthersViews({ dispatch, state }, view) {
    return new Promise(resolve => {
      dispatch('delOthersVisitedViews', view)
      dispatch('delOthersCachedViews', view)
      resolve({
        visitedViews: [...state.visitedViews],
        cachedViews: [...state.cachedViews],
        // add by zxh start
        cachedKeys: [...state.cachedKeys]
      // add by zxh end
      })
    })
  },
  delOthersVisitedViews({ commit, state }, view) {
    return new Promise(resolve => {
      commit('DEL_OTHERS_VISITED_VIEWS', view)
      resolve([...state.visitedViews])
    })
  },
  delOthersCachedViews({ commit, state }, view) {
    return new Promise(resolve => {
      commit('DEL_OTHERS_CACHED_VIEWS', view)
      resolve([...state.cachedViews])
      // add by zxh start
      resolve([...state.cachedKeys])
      // add by zxh end
    })
  },

  delAllViews({ dispatch, state }, view) {
    return new Promise(resolve => {
      dispatch('delAllVisitedViews', view)
      dispatch('delAllCachedViews', view)
      resolve({
        visitedViews: [...state.visitedViews],
        cachedViews: [...state.cachedViews],
        // add by zxh start
        cachedKeys: [...state.cachedKeys]
      // add by zxh end
      })
    })
  },
  delAllVisitedViews({ commit, state }) {
    return new Promise(resolve => {
      commit('DEL_ALL_VISITED_VIEWS')
      resolve([...state.visitedViews])
    })
  },
  delAllCachedViews({ commit, state }) {
    return new Promise(resolve => {
      commit('DEL_ALL_CACHED_VIEWS')
      resolve([...state.cachedViews])
      // add by zxh start
      resolve([...state.cachedKeys])
      // add by zxh end
    })
  },

  updateVisitedView({ commit }, view) {
    commit('UPDATE_VISITED_VIEW', view)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
