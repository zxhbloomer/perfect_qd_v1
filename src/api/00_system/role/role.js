import request from '@/utils/request'

export function apiGetList(query) {
  return request({
    url: '/api/v1/role/list',
    method: 'post',
    data: query
  })
}

export function apiUpdateData(data) {
  return request({
    url: '/api/v1/role/save',
    method: 'post',
    data
  })
}
