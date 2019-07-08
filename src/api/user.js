import request from '@/utils/request'

// update by zxh
export function loginApi(data) {
  return request({
    url: '/api/v1/login_process',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}
