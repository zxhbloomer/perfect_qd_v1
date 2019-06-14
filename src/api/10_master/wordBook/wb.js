import request from '@/utils/request'

export function getList(query) {
  return request({
    url: '/v1.0/wb/',
    method: 'get',
    params: query
  })
}

export function create(data) {
  // 新增
  return request({
    url: '/v1.0/wb/',
    method: 'post',
    data
  })
}

export function put(data) {
  // 更新
  return request({
    url: '/v1.0/wb/' + data.id + '/',
    method: 'put',
    data
  })
}
