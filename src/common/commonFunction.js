import { Loading } from 'element-ui'

exports.install = function(Vue, options) {
  /** 获取页面的size */
  Vue.prototype.getSize = function() {
    return this.$store.getters.size
  }
  /** 设置翻页页数 */
  Vue.prototype.getPageSizes = function() {
    return [20, 50, 100]
  }
  /** 对齐 */
  Vue.prototype.getLabelPosition = function() {
    return 'right'
  }
  /** 弹出错误框
   *
   * element-ui定义
   *
  Vue.prototype.$loading = Loading.service;
  Vue.prototype.$msgbox = MessageBox;
  Vue.prototype.$alert = MessageBox.alert;
  Vue.prototype.$confirm = MessageBox.confirm;
  Vue.prototype.$prompt = MessageBox.prompt;
  Vue.prototype.$notify = Notification;
  Vue.prototype.$message = Message;

   *
   *
   */
  /**
   * 显示错误的信息
   */
  Vue.prototype.showErrorMsg = function(message, error) {
    let showMsg = message
    if (JSON.stringify(error) !== '{}') {
      showMsg = showMsg + ' : ' + error
    }
    new Vue().$msgbox({
      title: '错误',
      message: showMsg,
      showCancelButton: false,
      confirmButtonText: '确定',
      type: 'error'
    }).then(function() {
      return
    }).catch(function() {
      return
    })
  }
  /** 弹出Alert 警告 */
  Vue.prototype.showErrorMsgAlert = function(message) {
    new Vue().$message({
      message: message,
      type: 'error',
      duration: 8 * 1000
    })
  }

  /** 截取字符串 */
  Vue.prototype.truncateString = function(str, num) {
    return str.length > num ? str.slice(0, num > 3 ? num - 3 : num) + '...' : str
  }

  /** loading打开 */
  Vue.prototype.showLoading = function(msg) {
    Loading.service({ fullscreen: true, text: msg, lock: true, background: 'rgba(255, 255, 255, 0.7)' })
  }
  /** loading关闭 */
  Vue.prototype.closeLoading = function() {
    Loading.service().close()
  }
}
