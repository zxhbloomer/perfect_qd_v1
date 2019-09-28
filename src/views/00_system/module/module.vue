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
        <el-input v-model.trim="dataJson.searchForm.code" clearable placeholder="模块编号" />
      </el-form-item>
      <el-form-item label="">
        <el-input v-model.trim="dataJson.searchForm.name" clearable placeholder="模块名称" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" plain icon="el-icon-search" @click="handleSearch">搜 索</el-button>
      </el-form-item>
      <el-form-item>
        <el-button v-popover:popover type="primary" plain icon="el-icon-s-promotion">高级搜索</el-button>
      </el-form-item>
    </el-form>

    <el-popover
      ref="popover"
      placement="top"
      width="420"
      title="高级查询"
    >
      <el-form
        :inline="true"
        :model="dataJson.searchForm"
        label-position="getLabelPosition()"
        class="floatRight"
      >
        <el-form-item v-show="false" label="">
          <el-input v-show="false" v-model.trim="dataJson.searchForm.code" clearable placeholder="模块编号" />
        </el-form-item>
        <el-form-item v-show="false" label="">
          <el-input v-show="false" v-model.trim="dataJson.searchForm.name" clearable placeholder="模块名称" />
        </el-form-item>
        <el-form-item label="">
          <el-select v-model="dataJson.searchForm.types" placeholder="请选择模块类型" multiple clearable>
            <el-option
              v-for="type in settings.selectOptions"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="">
          <el-select v-model="dataJson.searchForm.isdel" placeholder="请选择删除状态" clearable>
            <el-option
              v-for="item in settings.delOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <div style="text-align: right; margin: 0">
          <el-button type="text" @click="doResetSearch()">重置</el-button>
          <el-button type="primary" @click="handleSearch">提交</el-button>
        </div>
      </el-form>
    </el-popover>

    <el-button-group>
      <el-button type="primary" icon="el-icon-circle-plus-outline" :loading="settings.listLoading" @click="handleInsert">新 增</el-button>
      <el-button :disabled="!settings.btnShowStatus.showUpdate" type="primary" icon="el-icon-edit-outline" :loading="settings.listLoading" @click="handleUpdate">修 改</el-button>
      <el-button :disabled="!settings.btnShowStatus.showCopyInsert" type="primary" icon="el-icon-edit-outline" :loading="settings.listLoading" @click="handleCopyInsert">复制新增</el-button>
      <el-button :disabled="!settings.btnShowStatus.showExport" type="primary" icon="el-icon-edit-outline" :loading="settings.listLoading" @click="handleExport">导 出</el-button>
    </el-button-group>

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
      :default-sort="{prop: 'u_time', order: 'descending'}"
      style="width: 100%"
      @row-click="handleRowClick"
      @current-change="handleCurrentChange"
      @sort-change="handleSortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="45" prop="id" />
      <el-table-column type="index" width="45" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="80" :sort-orders="settings.sortOrders" prop="type" label="模块类型" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="80" :sort-orders="settings.sortOrders" prop="code" label="模块编号" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="150" :sort-orders="settings.sortOrders" prop="name" label="模块名称" />
      <el-table-column show-overflow-tooltip min-width="150" prop="descr" label="描述" />
      <el-table-column min-width="35" :sort-orders="settings.sortOrders" label="删除" :render-header="renderHeaderIsDel">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.isdel"
            active-color="#ff4949"
            inactive-color="#dcdfe6"
            :active-value="true"
            :inactive-value="false"
            :width="30"
            @change="handleDel(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column sortable="custom" min-width="100" prop="u_time" label="更新时间" />
      <el-table-column min-width="100" prop="templateName" label="使用资源名称" />
      <el-table-column min-width="100" prop="templateDescr" label="资源描述" />
    </el-table>
    <pagination ref="minusPaging" :total="dataJson.paging.total" :page.sync="dataJson.paging.current" :limit.sync="dataJson.paging.size" @pagination="getDataList" />
    <resource-dialog
      :visible.sync="popSettingsData.searchDialogData.dialogVisible"
      @closeMeOk="handleResourceCloseOk"
      @closeMeCancle="handleResourceCloseCancle"
    />
    <!-- pop窗口 数据编辑:新增、修改、步骤窗体-->
    <el-dialog
      v-el-drag-dialog
      :title="popSettingsData.textMap[popSettingsData.dialogStatus]"
      :visible.sync="popSettingsData.dialogFormVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      width="700px"
      top="5vh"
    >
      <el-form
        ref="dataForm"
        :rules="popSettingsData.rules"
        :model="dataJson.tempJson"
        label-position="rigth"
        label-width="120px"
        status-icon
      >
        <el-alert
          title="模块基本信息"
          type="info"
          :closable="false"
        />
        <br>
        <el-row>
          <el-form-item label="模块类型：" prop="type">
            <el-select ref="refType" v-model="dataJson.tempJson.type" placeholder="请选择" clearable :disabled="popSettingsData.dialogStatus==='update'" @change="handleSelectChange">
              <el-option
                v-for="item in settings.selectOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-col :span="12">
            <el-form-item label="模块编号：" prop="code">
              <el-input v-model.trim="dataJson.tempJson.code" placeholder="请输入" clearable show-word-limit :maxlength="dataJson.inputSettings.maxLength.code" :disabled="popSettingsData.dialogStatus==='update'" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模块名称：" prop="name">
              <el-input ref="refName" v-model.trim="dataJson.tempJson.name" placeholder="请输入" clearable show-word-limit :maxlength="dataJson.inputSettings.maxLength.name" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="描述：" prop="descr">
          <el-input v-model.trim="dataJson.tempJson.descr" placeholder="请输入" clearable type="textarea" show-word-limit :maxlength="dataJson.inputSettings.maxLength.descr" />
        </el-form-item>
        <el-row v-show="popSettingsData.dialogStatus === 'update'">
          <el-col :span="12">
            <el-form-item label="更新者：" prop="u_id">
              <el-input v-model.trim="dataJson.tempJson.u_id" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="更新时间：" prop="u_time">
              <el-input v-model.trim="dataJson.tempJson.u_time" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-alert
          title="模块资源信息：非必须"
          type="info"
          :closable="false"
        />
        <br>
        <el-row>
          <el-col :span="12">
            <el-form-item label="资源类型：" prop="templateType">
              <el-input v-model="popSettingsData.searchDialogData.selectedDataJson.type" disabled>
                <el-button slot="append" ref="selectOne" :icon="popSettingsData.searchDialogData.selectOrResetIcon" @click="handleSelectOrReset">
                  {{ popSettingsData.searchDialogData.selectOrResetName }}
                </el-button>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="资源名称：" prop="templateName">
              <el-input v-model="popSettingsData.searchDialogData.selectedDataJson.name" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="描述：" prop="templateDescr">
          <el-input v-model.trim="popSettingsData.searchDialogData.selectedDataJson.descr" disabled type="textarea" />
        </el-form-item>
        <el-form-item label="JSON配置信息：" prop="templateContext">
          <el-input v-model.trim="popSettingsData.searchDialogData.selectedDataJson.context" disabled :autosize="{ minRows: 4, maxRows: 10 }" type="textarea" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-divider />
        <div class="floatLeft">
          <el-button type="danger" :disabled="settings.listLoading || popSettingsData.btnDisabledStatus.disabledReset " @click="doReset()">重置</el-button>
        </div>
        <el-button plain :disabled="settings.listLoading" @click="popSettingsData.dialogFormVisible = false">取 消</el-button>
        <el-button v-show="popSettingsData.btnShowStatus.showInsert" plain type="primary" :disabled="settings.listLoading || popSettingsData.btnDisabledStatus.disabledInsert " @click="doInsert()">确 定</el-button>
        <el-button v-show="popSettingsData.btnShowStatus.showUpdate" plain type="primary" :disabled="settings.listLoading || popSettingsData.btnDisabledStatus.disabledUpdate " @click="doUpdate()">确 定</el-button>
        <el-button v-show="popSettingsData.btnShowStatus.showCopyInsert" plain type="primary" :disabled="settings.listLoading || popSettingsData.btnDisabledStatus.disabledCopyInsert " @click="doCopyInsert()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
  .floatRight {
    float: right;
  }
  .floatLeft {
    float: left;
  }
  .el-form-item .el-select {
    width: 100%;
  }
  .grid-content {
    border-radius: 2px;
    min-height: 36px;
    margin-bottom: 10px;
  }
  .bg-purple-light {
    background: #e5e9f2;
  }
</style>
<style >
  .el-input-group__append_select{
    color: #FFFFFF;
    background-color: #1890ff;
    border-color: #1890ff;
  }
  .el-input-group__append_reset{
    color: #FFFFFF;
    background-color: #F56C6C;
    border-color: #F56C6C;
  }
</style>

<script>
import { getListApi, updateApi, insertApi, exportAllApi, exportSelectionApi, deleteApi } from '@/api/00_system/module/module'
import resizeMixin from './moduleResizeHandlerMixin'
import Pagination from '@/components/Pagination'
import elDragDialog from '@/directive/el-drag-dialog'
import resourceDialog from '@/views/00_system/resource/dialog/dialog'

export default {
  name: 'P00000040', // 页面id，和router中的name需要一致，作为缓存
  components: { Pagination, resourceDialog },
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
            sort: '-u_time' // 排序
          },
          // 查询条件
          name: '',
          code: '',
          isdel: 'null',
          isenable: '',
          types: []
        },
        // 分页控件的json
        paging: {
          current: 1,
          size: 20,
          total: 0
        },
        // table使用的json，数据源
        listData: null,
        // 单条数据 json的，初始化原始数据
        tempJsonOriginal: {
          id: undefined,
          type: '',
          name: '',
          code: '',
          descr: '',
          dbversion: 0,
          template_id: undefined
        },
        // 单条数据 json
        currentJson: null,
        tempJson: null,
        inputSettings: {
          maxLength: {
            name: 20,
            code: 20,
            descr: 200,
            dbversion: 0
          }
        },
        // 当前表格中的索引，第几条
        rowIndex: 0,
        // 当前选中的行（checkbox）
        multipleSelection: []
      },
      // 页面设置json
      settings: {
        // 模块类型下拉选项json
        selectOptions: [{
          value: '10',
          label: '页面'
        }, {
          value: '20',
          label: '菜单'
        }, {
          value: '30',
          label: 'task'
        }],
        // 资源类型下拉选项json
        delOptions: [{
          value: '0',
          label: '未删除'
        }, {
          value: '1',
          label: '已删除'
        }, {
          value: 'null',
          label: '全部'
        }],
        // 表格排序规则
        sortOrders: ['ascending', 'descending'],
        // 按钮状态是否启用
        btnShowStatus: {
          showUpdate: false,
          showCopyInsert: false,
          showExport: false
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
        // 按钮状态：是否显示
        btnShowStatus: {
          showReset: false,
          showInsert: false,
          showUpdate: false,
          showCopyInsert: false
        },
        // 按钮状态：是否可用
        btnDisabledStatus: {
          disabledReset: false,
          disabledInsert: false,
          disabledUpdate: false,
          disabledCopyInsert: false
        },
        // 重置按钮点击后
        btnResetStatus: false,
        // 以下为pop的内容：数据弹出框
        selection: [],
        dialogStatus: '',
        dialogFormVisible: false,
        // pop的check内容
        rules: {
          type: [{ required: true, message: '请选择模块类型', trigger: 'change' }],
          code: [{ required: true, message: '请输入模块编号', trigger: 'change' }],
          name: [{ required: true, message: '请输入模块名称', trigger: 'change' }]
        },
        // 弹出的搜索框参数设置
        searchDialogData: {
          // 弹出框显示参数
          dialogVisible: false,
          // 当前设置状态:false->选择（select）;true->重置(reset)----选择后置为true，修改时有数据置为true
          selectOrReset: false,
          selectOrResetName: '选择',
          selectOrResetIcon: 'el-icon-search',
          // 点击确定以后返回的值
          selectedDataJson: {}
        }
      }
    }
  },
  // 监听器
  watch: {
    // 监听弹出窗口是否有返回值
    'popSettingsData.searchDialogData.selectedDataJson': {
      handler(newVal, oldVal) {
        if (newVal.id !== undefined) {
          this.dataJson.tempJson.template_id = newVal.id
        }
      },
      deep: true,
      immediate: true
    },
    // 监听页面上面是否有修改，有修改按钮高亮
    'dataJson.tempJson': {
      handler(newVal, oldVal) {
        if (this.popSettingsData.btnResetStatus === true) {
          // 点击了重置按钮
          this.popSettingsData.btnDisabledStatus.disabledReset = true
          this.popSettingsData.btnDisabledStatus.disabledInsert = true
          this.popSettingsData.btnDisabledStatus.disabledUpdate = true
          this.popSettingsData.btnDisabledStatus.disabledCopyInsert = true
          this.popSettingsData.btnResetStatus = false
        } else if (this.popSettingsData.dialogFormVisible) {
          // 弹出窗口
          // 有修改按钮高亮
          this.popSettingsData.btnDisabledStatus.disabledReset = false
          this.popSettingsData.btnDisabledStatus.disabledInsert = false
          this.popSettingsData.btnDisabledStatus.disabledUpdate = false
          this.popSettingsData.btnDisabledStatus.disabledCopyInsert = false
        }
      },
      deep: true
    },
    // 弹出窗口初始化，按钮不可用
    'popSettingsData.dialogFormVisible': {
      handler(newVal, oldVal) {
        if (this.popSettingsData.dialogFormVisible) {
          this.initPopUpStatus()
          // 修改的情况下
          if (this.popSettingsData.dialogStatus === 'update') {
            this.initResourceData()
          }
        }
      }
    },
    // 选中的数据，使得导出按钮可用，否则就不可使用
    'dataJson.multipleSelection': {
      handler(newVal, oldVal) {
        if (newVal.length > 0) {
          this.settings.btnShowStatus.showExport = true
        } else {
          this.settings.btnShowStatus.showExport = false
        }
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
    initResourceData() {
      // 设置资源部分的数据，从表格上复制
      this.popSettingsData.searchDialogData.selectedDataJson = {
        id: this.dataJson.tempJson.template_id,
        type: this.dataJson.tempJson.templateType,
        name: this.dataJson.tempJson.templateName,
        descr: this.dataJson.tempJson.templateDescr,
        context: this.dataJson.tempJson.templateContext
      }
      this.initSelectOrResectButton()
    },
    // 弹出框设置初始化
    initPopUpStatus() {
      this.popSettingsData.btnDisabledStatus.disabledReset = true
      this.popSettingsData.btnDisabledStatus.disabledInsert = true
      this.popSettingsData.btnDisabledStatus.disabledUpdate = true
      this.popSettingsData.btnDisabledStatus.disabledCopyInsert = true
      this.popSettingsData.searchDialogData.selectedDataJson = {}
      this.initSelectOrResectButton()
    },
    // 选择资源窗口判断是否已经选择
    isResourceSelected() {
      if (this.popSettingsData.searchDialogData.selectedDataJson.id === undefined) {
        // 未选择
        return false
      } else {
        // 已经选择
        return true
      }
    },
    // 选择or重置按钮的初始化
    initSelectOrResectButton() {
      if (this.isResourceSelected() === false) {
        this.$nextTick(() => {
          this.$refs.selectOne.$el.parentElement.className = 'el-input-group__append el-input-group__append_select'
        })
        this.popSettingsData.searchDialogData.selectOrReset = false
        this.popSettingsData.searchDialogData.selectOrResetName = '选择'
        this.popSettingsData.searchDialogData.selectOrResetIcon = 'el-icon-search'
      } else {
        this.$nextTick(() => {
          this.$refs.selectOne.$el.parentElement.className = 'el-input-group__append el-input-group__append_reset'
        })
        this.popSettingsData.searchDialogData.selectOrReset = true
        this.popSettingsData.searchDialogData.selectOrResetName = '清空'
        this.popSettingsData.searchDialogData.selectOrResetIcon = 'el-icon-circle-close'
      }
    },
    // 下拉选项控件事件
    handleSelectChange(val) {
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
    // handleRowUpdate(row, _rowIndex) {
    //   // 修改
    //   this.dataJson.tempJson = Object.assign({}, row) // copy obj
    //   this.dataJson.rowIndex = _rowIndex
    //   this.popSettingsData.dialogStatus = 'update'
    //   this.popSettingsData.dialogFormVisible = true
    //   this.$nextTick(() => {
    //     this.$refs['dataForm'].clearValidate()
    //   })
    // },
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
          // this.popSettingsData.dialogFormVisible = false
          this.settings.listLoading = false
        })
      }).catch(action => {
        row.isdel = !row.isdel
      })
    },
    // 点击按钮 新增
    handleInsert() {
      // 新增
      this.popSettingsData.dialogStatus = 'insert'
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
      // 设置按钮
      this.popSettingsData.btnShowStatus.showInsert = true
      this.popSettingsData.btnShowStatus.showUpdate = false
      this.popSettingsData.btnShowStatus.showCopyInsert = false
      // 初始化弹出页面
      this.doReset()
      this.popSettingsData.dialogFormVisible = true
    },
    // 点击按钮 更新
    handleUpdate() {
      this.dataJson.tempJson = Object.assign({}, this.dataJson.currentJson)
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
      this.popSettingsData.btnShowStatus.showInsert = false
      this.popSettingsData.btnShowStatus.showUpdate = true
      this.popSettingsData.btnShowStatus.showCopyInsert = false
      // 修改时控件focus
      this.$nextTick(() => {
        this.$refs['refName'].focus()
      })
    },
    // 导出按钮
    handleExport() {
      // 没有选择任何数据的情况
      if (this.dataJson.multipleSelection.length <= 0) {
        this.$alert('请在表格中选择数据进行导出', '空数据错误', {
          confirmButtonText: '关闭',
          type: 'error'
        }).then(() => {
          this.settings.btnShowStatus.showExport = false
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
      this.dataJson.tempJson = Object.assign({}, this.dataJson.currentJson)
      this.dataJson.tempJson.id = undefined
      this.dataJson.tempJson.template_id = undefined
      this.dataJson.tempJson.u_id = ''
      this.dataJson.tempJson.u_time = ''
      // 修改
      this.popSettingsData.dialogStatus = 'copyInsert'
      this.popSettingsData.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
      // 设置按钮
      this.popSettingsData.btnShowStatus.showInsert = false
      this.popSettingsData.btnShowStatus.showUpdate = false
      this.popSettingsData.btnShowStatus.showCopyInsert = true
      // 修改时控件focus
      this.$nextTick(() => {
        this.$refs['refType'].focus()
      })
    },
    handleCurrentChange(row) {
      this.dataJson.currentJson = Object.assign({}, row) // copy obj
      this.dataJson.tempJsonOriginal = Object.assign({}, row) // copy obj
      this.dataJson.currentJson.index = this.getRowIndex(row)
      if (this.dataJson.currentJson.id !== undefined) {
        // this.settings.btnShowStatus.doInsert = true
        this.settings.btnShowStatus.showUpdate = true
        this.settings.btnShowStatus.showCopyInsert = true
      } else {
        // this.settings.btnShowStatus.doInsert = false
        this.settings.btnShowStatus.showUpdate = false
        this.settings.btnShowStatus.showCopyInsert = false
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
            // 设置到table中绑定的json数据源
            this.dataJson.listData.splice(this.dataJson.rowIndex, 1, this.dataJson.tempJson)
            // 设置到currentjson中
            this.dataJson.currentJson = Object.assign({}, this.dataJson.tempJson)
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
            // this.popSettingsData.dialogFormVisible = false
            this.settings.listLoading = false
          })
        }
      })
    },
    // 重置查询区域
    doResetSearch() {
      this.dataJson.searchForm = {
        // 翻页条件
        pageCondition: {
          current: 1,
          size: 20,
          sort: '-u_time' // 排序
        },
        // 查询条件
        name: '',
        simpleName: '',
        isdel: 'null',
        isenable: ''
      }
    },
    // 重置按钮
    doReset() {
      this.popSettingsData.btnResetStatus = true
      switch (this.popSettingsData.dialogStatus) {
        case 'update':
          // 数据初始化
          this.initPopUpStatus()
          // 复制数据
          this.dataJson.tempJson = Object.assign({}, this.dataJson.tempJsonOriginal)
          // 初始化数据
          this.initResourceData()
          // 设置控件焦点focus
          this.$nextTick(() => {
            this.$refs['refName'].focus()
          })
          break
        case 'copyInsert':
          // 数据初始化
          this.initPopUpStatus()
          // 复制数据
          this.dataJson.tempJson = Object.assign({}, this.dataJson.tempJsonOriginal)
          this.dataJson.tempJson.template_id = undefined
          this.dataJson.tempJson.templateType = ''
          this.dataJson.tempJson.templateName = ''
          this.dataJson.tempJson.templateDescr = ''
          this.dataJson.tempJson.templateContext = ''
          // 初始化数据
          this.initResourceData()
          // 设置控件焦点focus
          this.$nextTick(() => {
            this.$refs['refType'].focus()
          })
          break
        case 'insert':
          // 数据初始化
          this.initPopUpStatus()
          // 复制数据
          this.dataJson.tempJson = {}
          // 初始化数据
          this.initResourceData()
          // 设置控件焦点focus
          this.$nextTick(() => {
            this.$refs['refType'].focus()
          })
          break
      }

      // 去除validate信息
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
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
            // this.popSettingsData.dialogFormVisible = false
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
            // this.popSettingsData.dialogFormVisible = false
            this.settings.listLoading = false
          })
        }
      })
    },
    // 关闭弹出窗口
    handlCloseDialog() {
      this.popSettingsData.dialogFormVisible = false
    },
    // 获取row-key
    // getRowKeys(row) {
    //   return row.id
    // },
    // table选择框
    handleSelectionChange(val) {
      this.dataJson.multipleSelection = val
    },
    // 资源类型check
    validateType(rule, value, callback) {
      // 现阶段只支持json配置
      if (value === '10') {
        return callback()
      }
      return callback(new Error('现在只支持json配置，请选择“json配置”'))
    },
    // 弹出搜索对话框
    handleSelectOrReset() {
      // this.$store.dispatch('popUpSearchDialog/show', true)
      if (this.popSettingsData.searchDialogData.selectOrReset === false) {
        // 选择按钮
        this.popSettingsData.searchDialogData.dialogVisible = true
      } else {
        // 重置按钮
        this.popSettingsData.searchDialogData.selectedDataJson = {}
        this.initSelectOrResectButton()
        this.dataJson.tempJson.template_id = undefined
        this.dataJson.tempJson.templateType = ''
        this.dataJson.tempJson.templateName = ''
        this.dataJson.tempJson.templateDescr = ''
        this.dataJson.tempJson.templateContext = ''
      }
    },
    // 关闭对话框：确定
    handleResourceCloseOk(val) {
      this.popSettingsData.searchDialogData.selectedDataJson = val
      this.popSettingsData.searchDialogData.dialogVisible = false
      this.initSelectOrResectButton()
      this.dataJson.tempJson.template_id = this.popSettingsData.searchDialogData.selectedDataJson.id
      this.dataJson.tempJson.templateType = this.popSettingsData.searchDialogData.selectedDataJson.type
      this.dataJson.tempJson.templateName = this.popSettingsData.searchDialogData.selectedDataJson.name
      this.dataJson.tempJson.templateDescr = this.popSettingsData.searchDialogData.selectedDataJson.descr
      this.dataJson.tempJson.templateContext = this.popSettingsData.searchDialogData.selectedDataJson.context
    },
    // 关闭对话框：取消
    handleResourceCloseCancle() {
      this.popSettingsData.searchDialogData.dialogVisible = false
    },
    renderHeaderIsDel: function(h, { column }) {
      return (
        <span>{column.label}
          <el-tooltip
            class='item'
            effect='dark'
            placement='bottom'
          >
            <div slot='content'>
            删除状态提示：
              <br/>灰色：未删除
              <br/>红色：已删除
            </div>
            <svg-icon icon-class='perfect-icon-question1_btn' style='margin-left: 5px'/>
          </el-tooltip>
        </span>
      )
    }
  }
}
</script>
