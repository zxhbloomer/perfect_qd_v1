import axios from 'axios'
// upd by zxh
// import { MessageBox, Message } from 'element-ui'
import { MessageBox } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'
import fileDownload from 'js-file-download'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  withCredentials: true, // send cookies when cross-domain requests
  timeout: 25000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent

    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['X-Token'] = getToken()
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data
    // if the custom code is not 20000, it is judged as an error.
    if (res.code !== 20000) {
      // upd by zxh
      // 调用成功时，不需要message
      // Message({
      //   message: res.message || 'Error',
      //   type: 'error',
      //   duration: 5 * 1000
      // })

      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        // to re-login
        MessageBox.confirm('You have been logged out, you can cancel to stay on this page, or log in again', 'Confirm logout', {
          confirmButtonText: 'Re-Login',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      }
      // 判断是否有下载，有的话，就下载
      const fileName = response.headers['perfect-filename'] // 下载后文件名
      if (fileName !== undefined) {
        fileDownload(response.data, decodeURI(fileName))
      }
      // upd by zxh
      // return Promise.reject(new Error(res.message || 'Error'))
      return Promise.resolve(res)
    } else {
      return res
    }
  },
  error => {
    console.log('err' + error) // for debug
    // upd by zxh
    // Message({
    //   message: error.message,
    //   type: 'error',
    //   duration: 5 * 1000
    // })
    // return Promise.reject(error)
    if (error.response) {
      // switch (error.response.status) {
      //   case 401:
      //     // 返回 401 清除token信息并跳转到登录页面
    }
    // commonFunction.showErrorMsg('发生了异常，请联系管理员！', error.response.data.data)
    let showMsg = ''
    try {
      if (error.response.status === 404) {
        showMsg = error.message
      } else {
        showMsg = error.response.data.message
      }
    } catch (error) {
      showMsg = error.message
    }
    // 没有从服务器上获取到错误信息时，意味着服务器没有启动，或其他错误
    if (showMsg === undefined) {
      showMsg = '请联系管理员，服务器没有响应。'
    }

    if (JSON.stringify(showMsg) !== '{}') {
      showMsg = '' + '' + JSON.stringify(showMsg, null, 2)
    }
    // 存在多个双引号的情况，则去除开头和结尾的多余双引号
    if (showMsg.startsWith('"')) {
      showMsg = showMsg.slice(1)
    }
    if (showMsg.endsWith('"')) {
      showMsg = showMsg.slice(0, showMsg.length - 1)
    }

    if (error.response.status !== 401) {
      MessageBox.confirm(showMsg, '错误信息', {
        showCancelButton: false,
        confirmButtonText: '确定',
        type: 'error'
      }).then(() => {

      })
    }
    return Promise.reject(error.response.data) // 返回接口返回的错误信息
  },
)

export default service
