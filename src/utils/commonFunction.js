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
  /** 弹出错误框 */
  Vue.prototype.showErrorMsg = function(message) {
    new Vue().$msgbox({
      title: '错误',
      message: message,
      showCancelButton: false,
      confirmButtonText: '确定',
      type: 'error'
    }).then(function() {
      return
    }).catch(function() {
      return
    })
  }
}
