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
    url: '/api/v1/org/list',
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
    url: '/api/v1/org/save',
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
 * 启用逻辑
 * @param {*} data
 */
export function enableApi(data) {
  return request({
    url: '/api/v1/org/enable',
    method: 'post',
    data
  })
}
