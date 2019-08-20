<template>
  <div class="app-container">
    <el-form
      ref="minusForm"
      :inline="true"
      :model="dataJson.searchForm"
      label-position="getLabelPosition()"
      class="floatRight"
    >
      <el-form-item label="">
        <el-input v-model.trim="dataJson.searchForm.name" clearable placeholder="资源名称" />
      </el-form-item>
      <el-form-item label="">
        <el-select v-model="dataJson.selectContext" placeholder="请选择资源类型" multiple collapse-tags clearable>
          <el-option
            v-for="item in settings.options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" plain icon="el-icon-search" @click="handleSearch">搜索</el-button>
      </el-form-item>
    </el-form>

    <el-button-group>
      <el-button type="primary" icon="el-icon-circle-plus-outline" :loading="settings.listLoading" @click="handleInsert">新增</el-button>
      <el-button :disabled="!settings.btnStatus.showUpdate" type="primary" icon="el-icon-edit-outline" :loading="settings.listLoading" @click="handleUpdate">修改</el-button>
      <el-button :disabled="!settings.btnStatus.showCopyInsert" type="primary" icon="el-icon-edit-outline" :loading="settings.listLoading" @click="handleCopyInsert">复制新增</el-button>
      <el-button :disabled="!settings.btnStatus.showExport" type="primary" icon="el-icon-edit-outline" :loading="settings.listLoading" @click="handleExport">数据导出</el-button>
    </el-button-group>

    <el-button-group>
      <el-button type="primary" icon="el-icon-upload" @click="handleOpenImportDialog">数据批量导入</el-button>
    </el-button-group>

    <el-dropdown trigger="click">
      <el-button type="primary">
        更多<i class="el-icon-arrow-down el-icon--right" />
      </el-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item>黄金糕</el-dropdown-item>
        <el-dropdown-item>狮子头</el-dropdown-item>
        <el-dropdown-item>螺蛳粉</el-dropdown-item>
        <el-dropdown-item>双皮奶</el-dropdown-item>
        <el-dropdown-item>蚵仔煎</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <el-table
      ref="multipleTable"
      v-loading="settings.listLoading"
      :data="dataJson.listData"
      :element-loading-text="'正在拼命加载中...'"
      element-loading-background="rgba(255, 255, 255, 0.5)"
      :height="settings.tableHeight"
      stripe
      border
      fit
      highlight-current-row
      :default-sort="{prop: 'uTime', order: 'descending'}"
      :row-key="getRowKeys"
      style="width: 100%"
      @row-click="handleRowClick"
      @current-change="handleCurrentChange"
      @sort-change="handleSortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="38" :reserve-selection="true" prop="id" />
      <el-table-column type="index" width="38" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="80" :sort-orders="settings.sortOrders" prop="type" label="资源类型" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="150" :sort-orders="settings.sortOrders" prop="name" label="名称" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="150" :sort-orders="settings.sortOrders" prop="uri" label="相对路径" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="270" :sort-orders="settings.sortOrders" prop="baseurl" label="baseurl" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="50" :sort-orders="settings.sortOrders" prop="size" label="文件大小" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="40" :sort-orders="settings.sortOrders" prop="extension" label="扩展名" />
      <el-table-column min-width="45" :sort-orders="settings.sortOrders" label="删除">
        <template slot-scope="scope">
          <el-tooltip :content="'删除状态: ' + scope.row.isdel" placement="top">
            <el-switch
              v-model="scope.row.isdel"
              active-color="#ff4949"
              inactive-color="#dcdfe6"
              :active-value="true"
              :inactive-value="false"
              :width="30"
              @change="handleDel(scope.row)"
            />
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column sortable="custom" min-width="150" :sort-orders="settings.sortOrders" prop="uTime" label="更新时间" />
      <el-table-column label="操作" width="120" fixed="right">
        <template slot-scope="scope">
          <el-button-group>
            <el-button type="primary" icon="el-icon-edit" @click="handleRowUpdate(scope.row, scope.$index)" />
            <el-button type="danger" icon="el-icon-delete" @click="onDel(scope.row)" />
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>
    <pagination ref="minusPaging" :total="dataJson.paging.total" :page.sync="dataJson.paging.current" :limit.sync="dataJson.paging.size" @pagination="getDataList" />
    <!-- pop窗口 数据批量导入：模版导出、excel导入-->
    <el-dialog
      v-el-drag-dialog
      title="数据批量导入"
      :visible.sync="popSettingsImport.dialogFormVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      width="620px"
    >
      <el-form
        ref="dataForm"
        label-position="rigth"
        label-width="120px"
        status-icon
      >
        <el-form-item label="点击下载：">
          <el-link type="primary" :href="popSettingsImport.templateFilePath"> 模版文件</el-link>
        </el-form-item>
        <el-form-item label="选择导入文件：">
          <simple-upload
            :accept="'.xls,.xlsx'"
            @upload-success="handleUploadFileSuccess"
            @upload-error="handleUploadFileError"
          />
          <el-link v-show="!(popSettingsImport.errorFileUrl =='')" type="danger" :href="popSettingsImport.errorFileUrl">
            <i class="el-icon-view el-icon--right" />错误信息
          </el-link>
        </el-form-item>
      </el-form>
      <p><strong>说明：</strong></p>
      <ul>
        <li>请先下载模版文件，在模版文件中进行修改后再上传</li>
        <li>支持上传的文件类型：xls、xlsx</li>
        <li>请避免excel文件格式错误</li>
        <li>文件中存在任何错误，整个文件上传都将失败</li>
        <li>如果上传失败，会自动下载错误信息，请修改完毕后再次上传</li>
      </ul>

      <div slot="footer" class="dialog-footer">
        <el-divider />
        <el-button plain :disabled="settings.listLoading" @click="handlCloseDialog">关 闭</el-button>
      </div>
    </el-dialog>

    <!-- pop窗口 数据编辑:新增、修改、-->
    <el-dialog
      v-el-drag-dialog
      :title="popSettingsData.textMap[popSettingsData.dialogStatus]"
      :visible.sync="popSettingsData.dialogFormVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      width="1024px"
    >
      <el-form
        ref="dataForm"
        :rules="popSettingsData.rules"
        :model="dataJson.tempJson"
        label-position="rigth"
        label-width="120px"
        status-icon
      >
        111{{ stepsSetting.active }}222
        <el-steps :active="stepsSetting.active" finish-status="success">
          <el-step title="选择资源类型" />
          <el-step title="输入资源数据" />
          <el-step title="步骤 3" />
        </el-steps>
        <div v-show="stepsSetting.active === 0">
          <el-row>
            <el-col :span="12">
              <el-form-item label="资源类型：" prop="type">
                <el-select v-model="dataJson.tempJson.type" placeholder="请选择资源类型" clearable @change="handleSelectChange">
                  <el-option
                    v-for="item in settings.options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="资源名称：" prop="name">
                <el-input v-model.trim="dataJson.tempJson.name" clearable show-word-limit :maxlength="dataJson.inputSettings.maxLength.name" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <div v-show="stepsSetting.active === 1">
          <el-row>
            <el-col :span="12">
              <el-form-item label="相对路径：" prop="uri">
                <el-input v-model.trim="dataJson.tempJson.uri" clearable show-word-limit :maxlength="dataJson.inputSettings.maxLength.uri" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="baseurl：" prop="base">
                <el-input v-model.trim="dataJson.tempJson.base" clearable show-word-limit :maxlength="dataJson.inputSettings.maxLength.base" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="文件大小：" prop="size">
                <el-input v-model.trim="dataJson.tempJson.size" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="文件扩展名：" prop="extension">
                <el-input v-model.trim="dataJson.tempJson.extension" disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="描述：" prop="descr">
            <el-input v-model.trim="dataJson.tempJson.descr" clearable type="textarea" show-word-limit :maxlength="dataJson.inputSettings.maxLength.descr" />
          </el-form-item>
          <el-form-item label="json配置信息：" prop="context">
            <json-editor ref="jsonEditor" v-model.trim="dataJson.tempJson.context" />
          </el-form-item>
          <el-row>
            <el-col :span="12">
              <el-form-item label="更新者：" prop="uId">
                <el-input v-model.trim="dataJson.tempJson.uId" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="更新时间：" prop="uTime">
                <el-input v-model.trim="dataJson.tempJson.uTime" disabled />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <el-button @click="handleNext">下一步</el-button>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-divider />
        <el-button plain :disabled="settings.listLoading" @click="popSettingsData.dialogFormVisible = false">取 消</el-button>
        <el-button v-show="popSettingsData.btnStatus.doInsert" plain type="primary" :disabled="settings.listLoading" @click="doInsert()">确 定</el-button>
        <el-button v-show="popSettingsData.btnStatus.doUpdate" plain type="primary" :disabled="settings.listLoading" @click="doUpdate()">确 定</el-button>
        <el-button v-show="popSettingsData.btnStatus.doCopyInsert" plain type="primary" :disabled="settings.listLoading" @click="doCopyInsert()">确 定</el-button>
      </div>
    </el-dialog>
  </div></template>

<style scoped>
  .floatRight {
    float: right;
  }
  .el-form-item .el-select {
    width: 100%;
  }
</style>

<script>
import { getListApi, updateApi, insertApi, exportAllApi, exportSelectionApi, importExcelApi, deleteApi, enableApi } from '@/api/00_system/resource/resource'
import resizeMixin from './resourceResizeHandlerMixin'
import Pagination from '@/components/Pagination'
import elDragDialog from '@/directive/el-drag-dialog'
import SimpleUpload from '@/layout/components/SimpleUpload'
import JsonEditor from '@/components/JsonEditor'

export default {
  name: 'P00000020', // 页面id，和router中的name需要一致，作为缓存
  components: { Pagination, SimpleUpload, JsonEditor },
  directives: { elDragDialog },
  mixins: [resizeMixin],
  data() {
    return {
      dataJson: {
        // 查询使用的json
        searchForm: {
          // 翻页条件
          pageCondition: {
            current: 1,
            size: 20,
            sort: '-uTime' // 排序
          },
          // 查询条件
          name: '',
          simpleName: '',
          code: '',
          isdel: '',
          isenable: ''
        },
        // 分页控件的json
        paging: {
          current: 1,
          size: 20,
          total: 0
        },
        // table使用的json
        listData: null,
        // 单条数据 json的，初始化原始数据
        tempJsonOriginal: {
          id: undefined,
          type: '',
          name: '',
          uri: '',
          base: '',
          size: '',
          extension: '',
          descr: '',
          context: '',
          dbversion: 0
        },
        // 单条数据 json
        tempJson: null,
        inputSettings: {
          maxLength: {
            name: 10,
            uri: 50,
            base: 50,
            descr: 200,
            dbversion: 0
          }
        },
        // 当前表格中的索引，第几条
        rowIndex: 0,
        // 当前选中的行（checkbox）
        multipleSelection: [],
        // 下拉选项选择的内容
        selectContext: []
      },
      // 页面设置json
      settings: {
        // 表格排序规则
        sortOrders: ['ascending', 'descending'],
        // 按钮状态
        btnStatus: {
          showUpdate: false,
          showCopyInsert: false,
          showExport: false
        },
        // loading 状态
        listLoading: true,
        tableHeight: this.setUIheight(),
        duration: 4000,
        // 下拉选项json
        options: [{
          value: '10',
          label: '配置文件'
        }, {
          value: '20',
          label: 'json配置'
        }]
      },
      popSettingsData: {
        // 弹出窗口状态名称
        textMap: {
          update: '修改',
          insert: '新增',
          copyInsert: '复制新增'
        },
        // 按钮状态
        btnStatus: {
          doInsert: false,
          doUpdate: false,
          doCopyInsert: false
        },
        // 以下为pop的内容：数据弹出框
        selection: [],
        dialogStatus: '',
        dialogFormVisible: false,
        // pop的check内容
        rules: {
          type: [{ required: true, message: '请选择资源类型', trigger: 'change' }],
          name: [{ required: true, message: '请输入资源名称', trigger: 'change' }]
        }
      },
      // 导入窗口的状态
      popSettingsImport: {
        // 弹出窗口会否显示
        dialogFormVisible: false,
        // 模版文件地址
        templateFilePath: 'http://baidu.com',
        // 错误数据文件
        errorFileUrl: ''
      },
      // 步骤设置部分
      stepsSetting: {
        active: 0, // 控制步骤
        stepNumber: 2 // 总步数
      }
    }
  },
  // 监听器
  watch: {
    // 选中的数据，使得导出按钮可用，否则就不可使用
    'dataJson.multipleSelection': {
      handler(newVal, oldVal) {
        if (newVal.length > 0) {
          this.settings.btnStatus.showExport = true
        } else {
          this.settings.btnStatus.showExport = false
        }
      }
    },
    // 根据窗口状态，清空错误link
    'popSettingsImport.dialogFormVisible': {
      handler(newVal, oldVal) {
        // 清空错误文件
        this.popSettingsImport.errorFileUrl = ''
      }
    }
  },
  created() {
    // 初始化查询
    this.getDataList()
    // 数据初始化
    this.dataJson.tempJson = Object.assign({}, this.dataJson.tempJsonOriginal)
  },
  methods: {
    // 下拉选项控件事件
    handleSelectChange(val) {
      alert(val)
    },
    // 获取行索引
    getRowIndex(row) {
      const _index = this.dataJson.listData.lastIndexOf(row)
      return _index
    },
    // 行点击
    handleRowClick(row) {
      this.dataJson.tempJson = Object.assign({}, row) // copy obj
      this.dataJson.rowIndex = this.getRowIndex(row)
    },
    handleSearch() {
      // 查询
      this.dataJson.searchForm.pageCondition.current = 1
      this.getDataList()
      // 清空选择
      this.dataJson.multipleSelection = []
      this.$refs.multipleTable.clearSelection()
    },
    handleRowUpdate(row, _rowIndex) {
      // 修改
      this.dataJson.tempJson = Object.assign({}, row) // copy obj
      this.dataJson.rowIndex = _rowIndex
      this.popSettingsData.dialogStatus = 'update'
      this.popSettingsData.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 删除操作
    handleDel(row) {
      let _message = ''
      const _value = row.isdel
      const selectionJson = []
      selectionJson.push({ 'id': row.id })
      if (_value === true) {
        _message = '是否要删除该条数据？'
      } else {
        _message = '是否要复原该条数据？'
      }
      // 选择全部的时候
      this.$confirm(_message, '确认信息', {
        distinguishCancelAndClose: true,
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }).then(() => {
        // loading
        this.settings.listLoading = true
        deleteApi(selectionJson).then((_data) => {
          this.$notify({
            title: '更新成功',
            message: _data.message,
            type: 'success',
            duration: this.settings.duration
          })
          this.popSettingsData.dialogFormVisible = false
          this.settings.listLoading = false
        }, (_error) => {
          this.$notify({
            title: '更新错误',
            message: _error.message,
            type: 'error',
            duration: this.settings.duration
          })
          this.popSettingsData.dialogFormVisible = false
          this.settings.listLoading = false
        })
      }).catch(action => {
        row.isdel = !row.isdel
      })
    },
    // 启用操作
    handleEnable(row) {
      let _message = ''
      const _value = row.isenable
      const selectionJson = []
      selectionJson.push({ 'id': row.id })
      if (_value === true) {
        _message = '是否要禁用该条数据？'
      } else {
        _message = '是否要启用该条数据？'
      }
      // 选择全部的时候
      this.$confirm(_message, '确认信息', {
        distinguishCancelAndClose: true,
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }).then(() => {
        // loading
        this.settings.listLoading = true
        enableApi(selectionJson).then((_data) => {
          this.$notify({
            title: '更新成功',
            message: _data.message,
            type: 'success',
            duration: this.settings.duration
          })
          this.popSettingsData.dialogFormVisible = false
          this.settings.listLoading = false
        }, (_error) => {
          this.$notify({
            title: '更新错误',
            message: _error.message,
            type: 'error',
            duration: this.settings.duration
          })
          this.popSettingsData.dialogFormVisible = false
          this.settings.listLoading = false
        })
      }).catch(action => {
        row.isenable = !row.isenable
      })
    },
    // 点击按钮 新增
    handleInsert() {
      // 新增
      this.popSettingsData.dialogStatus = 'insert'
      this.popSettingsData.dialogFormVisible = true
      // 数据初始化
      this.dataJson.tempJson = Object.assign({}, this.dataJson.tempJsonOriginal)
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
      // 设置按钮
      this.popSettingsData.btnStatus.doInsert = true
      this.popSettingsData.btnStatus.doUpdate = false
      this.popSettingsData.btnStatus.doCopyInsert = false
    },
    // 点击按钮 更新
    handleUpdate() {
      if (this.dataJson.tempJson.id === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      // 修改
      this.popSettingsData.dialogStatus = 'update'
      this.popSettingsData.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
      // 设置按钮
      this.popSettingsData.btnStatus.doInsert = false
      this.popSettingsData.btnStatus.doUpdate = true
      this.popSettingsData.btnStatus.doCopyInsert = false
    },
    // 导出按钮
    handleExport() {
      // 没有选择任何数据的情况
      if (this.dataJson.multipleSelection.length <= 0) {
        this.$alert('请在表格中选择数据进行导出', '空数据错误', {
          confirmButtonText: '关闭',
          type: 'error'
        }).then(() => {
          this.settings.btnStatus.showExport = false
        })
      } else if (this.dataJson.multipleSelection.length === this.dataJson.listData.length) {
        // 选择全部的时候
        this.$confirm('请选择：当前页数据导出，全数据导出？', '确认信息', {
          distinguishCancelAndClose: true,
          confirmButtonText: '全数据导出',
          cancelButtonText: '当前页数据导出'
        }).then(() => {
          this.handleExportAllData()
        }).catch(action => {
          // 右上角X
          if (action !== 'close') {
            // 当前页所选择的数据导出
            this.handleExportSelectionData()
          }
        })
      } else {
        // 部分数据导出
        this.handleExportSelectionData()
      }
    },
    // 全部数据导出
    handleExportAllData() {
      // loading
      this.settings.listLoading = true
      // 开始导出
      exportAllApi(this.dataJson.searchForm).then(response => {
        this.settings.listLoading = false
      })
    },
    // 部分数据导出
    handleExportSelectionData() {
      // loading
      this.settings.listLoading = true
      const selectionJson = []
      this.dataJson.multipleSelection.forEach(function(value, index, array) {
        selectionJson.push({ 'id': value.id })
      })
      // 开始导出
      exportSelectionApi(selectionJson).then(response => {
        this.settings.listLoading = false
      })
    },
    // 点击按钮 复制新增
    handleCopyInsert() {
      this.dataJson.tempJson.id === undefined
      this.dataJson.tempJson.uId = ''
      this.dataJson.tempJson.uTime = ''
      // 修改
      this.popSettingsData.dialogStatus = 'copyInsert'
      this.popSettingsData.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
      // 设置按钮
      this.popSettingsData.btnStatus.doInsert = false
      this.popSettingsData.btnStatus.doUpdate = false
      this.popSettingsData.btnStatus.doCopyInsert = true
    },
    handleCurrentChange(row) {
      this.dataJson.tempJson = Object.assign({}, row) // copy obj
      this.dataJson.tempJson.index = this.getRowIndex(row)
      if (this.dataJson.tempJson.id !== undefined) {
        // this.settings.btnStatus.doInsert = true
        this.settings.btnStatus.showUpdate = true
        this.settings.btnStatus.showCopyInsert = true
      } else {
        // this.settings.btnStatus.doInsert = false
        this.settings.btnStatus.showUpdate = false
        this.settings.btnStatus.showCopyInsert = false
      }
    },
    handleSortChange(column) {
      // 服务器端排序
      if (column.order === 'ascending') {
        this.dataJson.searchForm.pageCondition.sort = column.prop
      } else if (column.order === 'descending') {
        this.dataJson.searchForm.pageCondition.sort = '-' + column.prop
      }
      this.getDataList()
    },
    getDataList() {
      this.dataJson.searchForm.pageCondition.current = this.dataJson.paging.current
      this.dataJson.searchForm.pageCondition.size = this.dataJson.paging.size
      // 查询逻辑
      this.settings.listLoading = true
      getListApi(this.dataJson.searchForm).then(response => {
        this.dataJson.listData = response.data.records
        this.dataJson.paging = response.data
        this.dataJson.paging.records = {}
        this.settings.listLoading = false
      })
    },
    // 更新逻辑
    doUpdate() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.dataJson.tempJson)
          this.settings.listLoading = true
          updateApi(tempData).then((_data) => {
            this.dataJson.tempJson.dbversion = _data.data.dbversion
            this.dataJson.listData.splice(this.dataJson.rowIndex, 1, this.dataJson.tempJson)
            this.$notify({
              title: '更新成功',
              message: _data.message,
              type: 'success',
              duration: this.settings.duration
            })
            this.popSettingsData.dialogFormVisible = false
            this.settings.listLoading = false
          }, (_error) => {
            this.$notify({
              title: '更新错误',
              message: _error.message,
              type: 'error',
              duration: this.settings.duration
            })
            this.popSettingsData.dialogFormVisible = false
            this.settings.listLoading = false
          })
        }
      })
    },
    // 插入逻辑
    doInsert() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.dataJson.tempJson)
          this.settings.listLoading = true
          insertApi(tempData).then((_data) => {
            this.dataJson.listData.push(_data.data)
            this.$notify({
              title: '插入成功',
              message: _data.message,
              type: 'success',
              duration: this.settings.duration
            })
            this.popSettingsData.dialogFormVisible = false
            this.settings.listLoading = false
          }, (_error) => {
            this.$notify({
              title: '插入错误',
              message: _error.message,
              type: 'error',
              duration: this.settings.duration
            })
            this.popSettingsData.dialogFormVisible = false
            this.settings.listLoading = false
          })
        }
      })
    },
    // 复制新增逻辑
    doCopyInsert() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.dataJson.tempJson)
          this.settings.listLoading = true
          insertApi(tempData).then((_data) => {
            this.dataJson.listData.push(_data.data)
            this.$notify({
              title: '更新成功',
              message: _data.message,
              type: 'success',
              duration: this.settings.duration
            })
            this.popSettingsData.dialogFormVisible = false
            this.settings.listLoading = false
          }, (_error) => {
            this.$notify({
              title: '更新错误',
              message: _error.message,
              type: 'error',
              duration: this.settings.duration
            })
            this.popSettingsData.dialogFormVisible = false
            this.settings.listLoading = false
          })
        }
      })
    },
    // 文件上传成功
    handleUploadFileSuccess(res) {
      // 开始导出
      importExcelApi(res.response.data).then(response => {
        this.settings.listLoading = false
        this.popSettingsImport.errorFileUrl = ''
        if (response.code !== 0) {
          this.popSettingsImport.errorFileUrl = response.data.fsType2Url
          this.showErrorMsg('您上传的excel数据有错误，请点击错误信息进行查看！')
        } else if (response.code === 0) {
          const successList = '成功导入 ' + response.data.length + ' 条数据'
          this.$alert(successList, '导入成功', {
            confirmButtonText: '关闭',
            type: 'success'
          }).then(() => {
            this.popSettingsImport.dialogFormVisible = false
          })
        }
      }, (_error) => {
        this.showErrorMsg('发生了异常，请联系管理员！', _error.data)
        console.log('发生了异常，请联系管理员！:' + JSON.stringify(_error))
      })
    },
    // 文件上传失败
    handleUploadFileError() {
      console.debug('文件上传失败')
      this.$notify({
        title: '导入错误',
        message: '文件上传发生错误！',
        type: 'error',
        duration: 0
      })
    },
    // 数据批量导入按钮
    handleOpenImportDialog() {
      this.popSettingsImport.dialogFormVisible = true
    },
    // 关闭弹出窗口
    handlCloseDialog() {
      this.popSettingsImport.dialogFormVisible = false
      this.popSettingsData.dialogFormVisible = false
    },
    // 获取row-key
    getRowKeys(row) {
      return row.id
    },
    // table选择框
    handleSelectionChange(val) {
      this.dataJson.multipleSelection = val
    },
    handleNext() {
      debugger
      if (this.stepsSetting.active === this.stepsSetting.stepNumber) {
        return
      }
      const forms = []
      // 验证当前页的表单是否通过验证
      switch (this.stepsSetting.active) {
        case 0:
          // forms.push('serviceStaffInfo');
          forms.push('partnerInfoes')
          break
        case 1:
          // forms.push('agentBasicInfo');
          // forms.push('agentArea');
          break
        case 2:
          forms.push('agentCompanyInfo')
          forms.push('corporateInfo')
          // forms.push('contractInfo');
          break
        case 3:
          forms.push('serviceManager')
          forms.push('bdManager')
          break
        case 4:
          // forms.push('agentCommissionRatio');
          // forms.push('agentCommissionAccount');
          break
        case 5:
          // forms.push('platformServiceFee');
          // forms.push('dividingInfo');
          // forms.push('paymentInfo');
          break
      }
      let r = 0
      for (let i = 0; i < forms.length; i++) {
        debugger
        this.$refs[forms[i]].validate((valid) => {
          if (valid) {
            r++
          }
        })
      }
      if (r === forms.length) {
        this.active++
      }
    }
  }
}
</script>
