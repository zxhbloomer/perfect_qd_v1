import request from '@/utils/request'

/**
 * 查询逻辑
 * @param {*} data
 */
export function getListApi(query) {
  return request({
    url: '/api/v1/role/list',
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
    url: '/api/v1/role/save',
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
    url: '/api/v1/role/insert',
    method: 'post',
    data
  })
}

/**
 * 导出逻辑
 * @param {*} data
 */
export function exportApi(data) {
  return request({
    url: '/api/v1/role/export',
    method: 'post',
    data,
    responseType: 'arraybuffer'
  })
}
