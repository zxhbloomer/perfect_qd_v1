import request from '@/utils/request'

export function getListApi(query) {
  return request({
    url: '/api/v1/role/list',
    method: 'post',
    data: query
  })
}

export function updateApi(data) {
  return request({
    url: '/api/v1/role/save',
    method: 'post',
    data
  })
}

export function insertApi(data) {
  return request({
    url: '/api/v1/role/insert',
    method: 'post',
    data
  })
}
