import request from '@/utils/request'

export function getList(query) {
  return request({
    url: '/api/v1/role/list',
    method: 'post',
    params: query
  })
}

export function updateData(data) {
  return request({
    url: '/sys/role/update',
    method: 'post',
    data
  })
}
