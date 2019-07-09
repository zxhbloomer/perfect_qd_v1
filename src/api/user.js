import request from '@/utils/request'

// update by zxh
export function loginApi(data) {
  return request({
    url: '/api/v1/user/token/get',
    method: 'post',
    data
  })
}

export function getUserInfoApi(token) {
  return request({
    url: '/user/info',
    method: 'post',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}
