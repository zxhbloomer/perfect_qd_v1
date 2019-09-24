import request from '@/utils/request'

/**
 * 取所有的下拉选项的数据bean
 * @param {*} data
 */
export function getDeleteTypeNormalApi() {
  return request({
    url: '/api/v1/common/component/select/deleteTypeNormal/list',
    method: 'post'
  })
}

// /**
//  * 获取所有的下拉选项的数据bean
//  */
// export function getAllComponentJsonApi() {
//   getAllComponentApi().then((_data) => {
//     debugger
//     return _data.data
//   }, (_error) => {
//     debugger
//     return {}
//   })
// }
