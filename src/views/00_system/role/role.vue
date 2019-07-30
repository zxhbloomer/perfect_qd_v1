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
        <el-input v-model="dataJson.searchForm.role_name" placeholder="权限组名称" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" plain icon="el-icon-search" @click="handleSearch">搜索</el-button>
      </el-form-item>
    </el-form>
    <el-button-group>
      <el-button type="primary" icon="el-icon-circle-plus-outline" @click="handleInsert">新增</el-button>
      <el-button :disabled="!settings.btnStatus.showUpdate" type="primary" icon="el-icon-edit-outline" @click="handleUpdate">修改</el-button>
      <el-button :disabled="!settings.btnStatus.showCopyInsert" type="primary" icon="el-icon-edit-outline" @click="handleCopyInsert">复制新增</el-button>
      <el-button :disabled="!settings.btnStatus.showCopyInsert" type="primary" icon="el-icon-edit-outline" @click="handleCopyInsert">数据导出</el-button>
    </el-button-group>

    <el-button-group>
      <el-button type="primary" icon="el-icon-upload" @click="handleOpenImportDialog">数据批量导入</el-button>
    </el-button-group>
    {{ dataJson.multipleSelection }}
    <el-table
      v-loading="settings.listLoading"
      :data="dataJson.listData"
      :element-loading-text="'正在拼命加载中...'"
      :height="settings.tableHeight"
      stripe
      border
      fit
      highlight-current-row
      show-overflow-tooltip
      :default-sort="{prop: 'uTime', order: 'descending'}"
      :row-key="getRowKeys"
      @row-click="handleRowClick"
      @current-change="handleCurrentChange"
      @sort-change="handleSortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="37" :reserve-selection="true" />
      <el-table-column type="index" />
      <el-table-column sortable="custom" :sort-orders="settings.sortOrders" prop="code" label="角色编码" />
      <el-table-column sortable="custom" :sort-orders="settings.sortOrders" prop="type" label="角色类型" />
      <el-table-column sortable="custom" :sort-orders="settings.sortOrders" prop="name" label="角色名称" />
      <el-table-column sortable="custom" :sort-orders="settings.sortOrders" prop="descr" label="描述" />
      <el-table-column sortable="custom" :sort-orders="settings.sortOrders" prop="simpleName" label="简称" />
      <el-table-column sortable="custom" :sort-orders="settings.sortOrders" prop="uTime" label="更新时间" />
      <el-table-column label="操作" min-width="45">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" @click="handleRowUpdate(scope.row, scope.$index)" />
          <el-button type="danger" icon="el-icon-delete" @click="onDel(scope.row)" />
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
            @upload-success="handleUploadFileSuccess"
            @upload-error="handleUploadFileError"
          />
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
      width="620px"
    >
      <el-form
        ref="dataForm"
        :rules="popSettingsData.rules"
        :model="dataJson.tempJson"
        label-position="rigth"
        label-width="120px"
        status-icon
      >
        <el-row>
          <el-col :span="12">
            <el-form-item label="角色编码：" prop="code">
              <el-input v-model="dataJson.tempJson.code" show-word-limit :maxlength="dataJson.inputSettings.maxLength.code" autofocus />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色类型：" prop="type">
              <el-input v-model="dataJson.tempJson.type" show-word-limit :maxlength="dataJson.inputSettings.maxLength.type" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="角色名称：" prop="name">
              <el-input v-model="dataJson.tempJson.name" show-word-limit :maxlength="dataJson.inputSettings.maxLength.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="简称：" prop="simpleName">
              <el-input v-model="dataJson.tempJson.simpleName" show-word-limit :maxlength="dataJson.inputSettings.maxLength.simpleName" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="描述：" prop="descr">
          <el-input v-model="dataJson.tempJson.descr" type="textarea" show-word-limit :maxlength="dataJson.inputSettings.maxLength.descr" />
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="更新者：" prop="uId">
              <el-input v-model="dataJson.tempJson.uId" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="更新时间：" prop="uTime">
              <el-input v-model="dataJson.tempJson.uTime" disabled />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button plain :disabled="settings.listLoading" @click="popSettingsData.dialogFormVisible = false">取 消</el-button>
        <el-button v-show="popSettingsData.btnStatus.doInsert" plain type="primary" :disabled="settings.listLoading" @click="doInsert()">确 定</el-button>
        <el-button v-show="popSettingsData.btnStatus.doUpdate" plain type="primary" :disabled="settings.listLoading" @click="doUpdate()">确 定</el-button>
        <el-button v-show="popSettingsData.btnStatus.doCopyInsert" plain type="primary" :disabled="settings.listLoading" @click="doCopyInsert()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
  .floatRight {
    float: right;
  }
</style>

<script>
import { getListApi, updateApi, insertApi } from '@/api/00_system/role/role'
import resizeMixin from './roleResizeHandlerMixin'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import elDragDialog from '@/directive/el-drag-dialog' // base on element-ui
import SimpleUpload from '@/layout/components/SimpleUpload'

export default {
  name: 'P00000000', // 页面id，和router中的name需要一致，作为缓存
  components: { Pagination, SimpleUpload },
  directives: { elDragDialog },
  mixins: [resizeMixin],
  data() {
    return {
      dataJson: {
        // 查询使用的json
        searchForm: {
          pageCondition: {
            current: 1,
            size: 20
          }, // 当前页
          // 查询条件
          condition_role_name: undefined,
          sort: '-uTime' // 排序
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
          code: '',
          name: '',
          descr: '',
          simpleName: '',
          dbversion: 0
        },
        // 单条数据 json
        tempJson: null,
        inputSettings: {
          maxLength: {
            type: 10,
            code: 10,
            name: 10,
            descr: 200,
            simpleName: 10
          }
        },
        // 当前表格中的索引，第几条
        rowIndex: 0,
        // 当前选中的行（checkbox）
        multipleSelection: []
      },
      // 页面设置json
      settings: {
        // 表格排序规则
        sortOrders: ['ascending', 'descending'],
        // 按钮状态
        btnStatus: {
          showUpdate: false,
          showCopyInsert: false
        },
        // loading 状态
        listLoading: true,
        tableHeight: this.setUIheight(),
        duration: 4000
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
          create_dt: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'blur' }],
          role_name: [{ required: true, message: 'title is required', trigger: 'blur' }]
        }
      },
      // 导入窗口的状态
      popSettingsImport: {
        // 弹出窗口会否显示
        dialogFormVisible: false,
        // 模版文件地址
        templateFilePath: 'http://baidu.com'
      }
    }
  },
  created() {
    // 初始化查询
    this.getDataList()
    // 数据初始化
    this.dataJson.tempJson = this.dataJson.tempJsonOriginal
  },
  methods: {
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
    // 点击按钮 新增
    handleInsert() {
      // 新增
      this.popSettingsData.dialogStatus = 'insert'
      this.popSettingsData.dialogFormVisible = true
      // 数据初始化
      this.dataJson.tempJson = this.dataJson.tempJsonOriginal
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
        this.dataJson.searchForm.sort = column.prop
      } else if (column.order === 'descending') {
        this.dataJson.searchForm.sort = '-' + column.prop
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
    handleUploadFileSuccess(response) {
      console.debug('文件上传成功')
    },
    // 文件上传失败
    handleUploadFileError() {
      console.debug('文件上传失败')
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
    getRowKeys(row) {
      return row.id
    },
    // table选择框
    handleSelectionChange(val) {
      this.dataJson.multipleSelection = val
    }
  }
}
</script>
