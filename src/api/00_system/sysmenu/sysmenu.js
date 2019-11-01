import request from '@/utils/request'

/**
 * 查询逻辑
 * @param {*} data
 */
export function getListApi(query) {
  return request({
    url: '/api/v1/menu/list',
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
    url: '/api/v1/menu/save',
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
    url: '/api/v1/menu/insert',
    method: 'post',
    data
  })
}

/**
 * 可见不可见逻辑
 * @param {*} data
 */
export function visibleApi(data) {
  return request({
    url: '/api/v1/menu/visible',
    method: 'post',
    data
  })
}
