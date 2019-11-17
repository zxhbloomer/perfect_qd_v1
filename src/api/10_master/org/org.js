import request from '@/utils/request'

/**
 * 查询逻辑
 * @param {*} data
 */
export function getCascaderListApi(query) {
  return request({
    url: '/api/v1/tentant/cascader/list',
    method: 'post',
    data: query
  })
}

/**
 * 查询逻辑
 * @param {*} data
 */
export function getTreeListApi(query) {
  return request({
    url: '/api/v1/org/tree/list',
    method: 'post',
    data: query
  })
}

/**
 * 查询逻辑
 * @param {*} data
 */
export function getListApi(query) {
  return request({
    url: '/api/v1/tentant/list',
    method: 'post',
    data: query
  })
}

/**
 * 更新api
 * @param {*} data
 */
export function updateApi(data) {
  return request({
    url: '/api/v1/tentant/save',
    method: 'post',
    data
  })
}

/**
 * 插入api
 * @param {*} data
 */
export function insertApi(data) {
  return request({
    url: '/api/v1/org/insert',
    method: 'post',
    data
  })
}

/**
 * 导出逻辑，全部导出
 * @param {*} data
 */
export function exportAllApi(data) {
  return request({
    url: '/api/v1/tentant/export_all',
    method: 'post',
    data,
    responseType: 'arraybuffer'
  })
}

/**
 * 导出逻辑，部分导出
 * @param {*} data
 */
export function exportSelectionApi(data) {
  return request({
    url: '/api/v1/tentant/export_selection',
    method: 'post',
    data,
    responseType: 'arraybuffer'
  })
}

/**
 * 启用逻辑
 * @param {*} data
 */
export function enableApi(data) {
  return request({
    url: '/api/v1/tentant/enable',
    method: 'post',
    data
  })
}