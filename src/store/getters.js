const getters = {
  sidebar: state => state.app.sidebar,
  size: state => state.app.size,
  device: state => state.app.device,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  // add by zxh start
  cachedKeys: state => state.tagsView.cachedKeys,
  // add by zxh start
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  introduction: state => state.user.introduction,
  roles: state => state.user.roles,
  permission_routes: state => state.permission.routes,
  errorLogs: state => state.errorLog.logs,
  /** add by zxh */
  program: state => state.popUpSearchDialog.program,
  selectedDataJson: state => state.popUpSearchDialog.selectedDataJson
}
export default getters
