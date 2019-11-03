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
        <el-input v-model.trim="dataJson.searchForm.name" clearable placeholder="名称" />
      </el-form-item>
      <el-form-item label="">
        <select-dict v-model="dataJson.searchForm.visible" :para="CONSTANTS.DICT_SYS_VISIBLE_TYPE" init-placeholder="请选择菜单类型" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" plain icon="el-icon-search" @click="handleSearch">搜 索</el-button>
      </el-form-item>
      <el-form-item>
        <el-button v-popover:popover type="primary" plain icon="perfect-icon-reset" @click="doResetSearch">重 置</el-button>
      </el-form-item>
    </el-form>
    <el-button-group v-show="!meDialogSetting.dialogStatus">
      <el-button type="primary" icon="el-icon-circle-plus-outline" :loading="settings.listLoading" @click="handleInsert">新增菜单组</el-button>
      <el-button :disabled="!settings.btnShowStatus.showCopyInsert" type="primary" icon="el-icon-edit-outline" :loading="settings.listLoading" @click="handleCopyInsert">添加子菜单</el-button>
      <el-button :disabled="!settings.btnShowStatus.showUpdate" type="primary" icon="el-icon-edit-outline" :loading="settings.listLoading" @click="handleUpdate">修 改</el-button>
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
      default-expand-all
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      row-key="id"
      @row-click="handleRowClick"
      @row-dblclick="handleRowDbClick"
      @current-change="handleCurrentChange"
      @sort-change="handleSortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column v-if="!meDialogSetting.dialogStatus" type="selection" width="45" prop="id" />
      <el-table-column type="index" width="45" />
      <el-table-column show-overflow-tooltip min-width="150" prop="name" label="菜单名称" />
      <el-table-column show-overflow-tooltip min-width="80" prop="sort" label="排序" />
      <el-table-column show-overflow-tooltip min-width="80" prop="type_name" label="菜单类型" />
      <el-table-column min-width="45" label="可见" :render-header="renderHeaderIsDel">
        <template slot-scope="scope">
          <el-tooltip :content="'可见状态: ' + scope.row.visible" placement="top">
            <el-switch
              v-model="scope.row.visible"
              active-color="#ff4949"
              inactive-color="#dcdfe6"
              :active-value="true"
              :inactive-value="false"
              :width="30"
              :disabled="meDialogSetting.dialogStatus"
              @change="handleDel(scope.row)"
            />
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column min-width="150" prop="u_time" label="更新时间" />
    </el-table>

    <!-- pop窗口 数据编辑:新增、修改、步骤窗体-->
    <el-dialog
      v-el-drag-dialog
      :title="popSettingsData.textMap[popSettingsData.dialogStatus]"
      :visible="popSettingsData.dialogFormVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      width="900px"
    >
      <el-form
        ref="dataSubmitForm"
        :rules="popSettingsData.rules"
        :model="dataJson.tempJson"
        label-position="rigth"
        label-width="120px"
        status-icon
      >
        <div v-show="isNewMenuGroup">
          <el-alert title="菜单组信息" type="info" :closable="false" />
          <br>
          <el-row>
            <el-col :span="12">
              <el-form-item label="菜单组编号：" prop="code">
                <el-input v-model.trim="dataJson.tempJson.code" clearable show-word-limit />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="菜单组名称：" prop="name">
                <el-input v-model.trim="dataJson.tempJson.name" clearable show-word-limit />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <div v-show="isNewMenu">
          <el-alert title="上级菜单信息" type="info" :closable="false" />
          <br>
          <el-row>
            <el-form-item label="上级菜单：" prop="parent_id">
              <el-cascader
                ref="refInsertFocus"
                v-model="dataJson.tempJson.depth_id"
                placeholder="请选择"
                :options="dataJson.cascader.data"
                filterable
                clearable
                :props="{ checkStrictly: true, expandTrigger: 'hover'}"
                style="width: 100%"
                disabled
              />
            </el-form-item>
          </el-row>

          <el-alert title="本菜单模块信息" type="info" :closable="false" />
          <br>
          <el-row>
            <el-col :span="12">
              <el-form-item label="菜单名称：" prop="name">
                <el-input v-model.trim="dataJson.tempJson.name" clearable show-word-limit>
                  <el-button slot="append" ref="selectTwo" :icon="popSettingsData.searchDialogDataTwo.selectOrResetIcon" @click="handleModuleDialogClick">
                    {{ popSettingsData.searchDialogDataTwo.selectOrResetName }}
                  </el-button>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="请求地址：" prop="path">
                <el-input v-model.trim="dataJson.tempJson.path" clearable show-word-limit disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="菜单类型：" prop="type">
                <select-dict v-model="dataJson.tempJson.type" :para="CONSTANTS.DICT_MODULE_TYPE" disabled />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="模块名称：" prop="meta_title">
                <el-input v-model.trim="dataJson.tempJson.meta_title" clearable show-word-limit disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="模块icon：" prop="meta_icon">
                <el-input v-model.trim="dataJson.tempJson.meta_icon" clearable show-word-limit disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="路由名：" prop="route_name">
                <el-input v-model.trim="dataJson.tempJson.route_name" clearable show-word-limit disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="模块路径：" prop="meta_icon">
                <el-input v-model.trim="dataJson.tempJson.component" clearable show-word-limit disabled />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

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
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-divider />
        <div class="floatLeft">
          <el-button type="danger" :disabled="settings.listLoading || popSettingsData.btnDisabledStatus.disabledReset" @click="doReset()">重置</el-button>
        </div>
        <el-button plain :disabled="settings.listLoading" @click="popSettingsData.dialogFormVisible = false">取 消</el-button>
        <el-button v-show="popSettingsData.btnShowStatus.showInsert" plain type="primary" :disabled="settings.listLoading || popSettingsData.btnDisabledStatus.disabledInsert " @click="doInsert()">确 定</el-button>
        <el-button v-show="popSettingsData.btnShowStatus.showUpdate" plain type="primary" :disabled="settings.listLoading || popSettingsData.btnDisabledStatus.disabledUpdate " @click="doUpdate()">确 定</el-button>
        <el-button v-show="popSettingsData.btnShowStatus.showCopyInsert" plain type="primary" :disabled="settings.listLoading || popSettingsData.btnDisabledStatus.disabledCopyInsert " @click="doCopyInsert()">确 定</el-button>
      </div>
    </el-dialog>
    <module-dialog
      :visible="popSettingsData.searchDialogDataTwo.dialogVisible"
      @closeMeOk="handleModuleCloseOk"
      @closeMeCancle="handleModuletCloseCancle"
    />
    <iframe id="refIframe" ref="refIframe" scrolling="no" frameborder="0" style="display:none" name="refIframe">x</iframe>
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
import { getCascaderListApi, getListApi, updateApi, addMenuGroupApi, addSubMenuApi, deleteApi } from '@/api/00_system/sysmenu/sysmenu'
import resizeMixin from './sysmenuResizeHandlerMixin'
import elDragDialog from '@/directive/el-drag-dialog'
import SelectDict from '@/layout/components/00_common/SelectComponent/SelectDictComponent'
import moduleDialog from '@/views/00_system/module/dialog/dialog'

export default {
  name: 'P00000120', // 页面id，和router中的name需要一致，作为缓存
  components: { SelectDict, moduleDialog },
  directives: { elDragDialog },
  mixins: [resizeMixin],
  data() {
    return {
      dataJson: {
        // 级联选择器数据
        cascader: {
          data: null,
          value: ''
        },
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
          visible: 'null',
          is_del: '0' // 未删除
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
          name: '',
          code: '',
          descr: '',
          dbversion: 0
        },
        // 单条数据 json
        currentJson: null,
        tempJson: null,
        inputSettings: {
          maxLength: {
            name: 20,
            code: 20,
            descr: 200,
            simple_name: 20
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
        // 按钮状态
        btnShowStatus: {
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
        rules: [],
        rulesFirst: {
          code: [{ required: true, message: '请输入菜单组编号', trigger: 'change' }],
          name: [{ required: true, message: '请输入菜单组名称', trigger: 'change' }]
        },
        rulesSecond: {
          parent_id: [{ required: true, message: '请输入上级菜单', trigger: 'change' }],
          name: [{ required: true, message: '请选择菜单名称', trigger: 'change' }]
        },
        // 弹出的搜索框参数设置
        searchDialogDataOne: {
          // 弹出框显示参数
          dialogVisible: false,
          // 当前设置状态:false->选择（select）;true->重置(reset)----选择后置为true，修改时有数据置为true
          selectOrReset: false,
          selectOrResetName: '选择',
          selectOrResetIcon: 'el-icon-search',
          // 点击确定以后返回的值
          selectedDataJson: {}
        },
        // 弹出的搜索框参数设置
        searchDialogDataTwo: {
          // 弹出框显示参数
          dialogVisible: false,
          // 当前设置状态:false->选择（select）;true->重置(reset)----选择后置为true，修改时有数据置为true
          selectOrReset: false,
          selectOrResetName: '选择',
          selectOrResetIcon: 'el-icon-search',
          // 点击确定以后返回的值
          selectedDataJson: {}
        }
      },
      // 导入窗口的状态
      popSettingsImport: {
        // 弹出窗口会否显示
        dialogFormVisible: false,
        // 模版文件地址
        templateFilePath: process.env.VUE_APP_BASE_API + '/api/v1/template.html?id=P00000030',
        // 错误数据文件
        errorFileUrl: ''
      },
      meDialogSetting: {
        program: this.$store.getters.program,
        selectedDataJson: this.$store.getters.selectedDataJson,
        dialogStatus: false
      }
    }
  },
  computed: {
    // 是否为新增菜单组
    isNewMenuGroup() {
      if (this.popSettingsData.dialogStatus === 'insert') {
        return true
      } else {
        return false
      }
    },
    // 是否为新增子菜单
    isNewMenu() {
      if (this.popSettingsData.dialogStatus === 'copyInsert') {
        return true
      } else {
        return false
      }
    }
  },
  // 监听器
  watch: {
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
          this.popSettingsData.btnDisabledStatus.disabledReset = true
          this.popSettingsData.btnDisabledStatus.disabledInsert = true
          this.popSettingsData.btnDisabledStatus.disabledUpdate = true
          this.popSettingsData.btnDisabledStatus.disabledCopyInsert = true
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
    },
    'popSettingsData.searchDialogDataTwo.selectedDataJson': {
      handler(newVal, oldVal) {
        if (newVal === {}) {
          this.dataJson.tempJson.type = ''
          this.dataJson.tempJson.name = ''
          this.dataJson.tempJson.module_id = ''
          this.dataJson.tempJson.path = ''
          this.dataJson.tempJson.route_name = ''
          this.dataJson.tempJson.meta_title = ''
          this.dataJson.tempJson.meta_icon = ''
          this.dataJson.tempJson.component = ''
          this.dataJson.tempJson.affix = ''
        } else {
          this.dataJson.tempJson.type = this.popSettingsData.searchDialogDataTwo.selectedDataJson.type
          this.dataJson.tempJson.name = this.popSettingsData.searchDialogDataTwo.selectedDataJson.name
          this.dataJson.tempJson.module_id = this.popSettingsData.searchDialogDataTwo.selectedDataJson.id
          this.dataJson.tempJson.path = this.popSettingsData.searchDialogDataTwo.selectedDataJson.path
          this.dataJson.tempJson.route_name = this.popSettingsData.searchDialogDataTwo.selectedDataJson.route_name
          this.dataJson.tempJson.meta_title = this.popSettingsData.searchDialogDataTwo.selectedDataJson.meta_title
          this.dataJson.tempJson.meta_icon = this.popSettingsData.searchDialogDataTwo.selectedDataJson.meta_icon
          this.dataJson.tempJson.component = this.popSettingsData.searchDialogDataTwo.selectedDataJson.component
          this.dataJson.tempJson.affix = this.popSettingsData.searchDialogDataTwo.selectedDataJson.affix
        }
      }
    }
  },
  created() {
    this.initShow()
  },
  mounted() {
    // 描绘完成
  },
  methods: {
    initTempJsonOriginal() {
      // 单条数据 json的，初始化原始数据
      this.dataJson.tempJsonOriginal =
      {
        id: undefined,
        name: '',
        code: '',
        descr: '',
        dbversion: 0
      }
    },
    initShow() {
      // 初始化查询
      this.getDataList()
      // 数据初始化
      this.dataJson.tempJson = Object.assign({}, this.dataJson.tempJsonOriginal)
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
    // 行双点击，仅在dialog中有效
    handleRowDbClick(row) {
      this.dataJson.tempJson = Object.assign({}, row) // copy obj
      this.dataJson.rowIndex = this.getRowIndex(row)
      if (this.meDialogSetting.dialogStatus) {
        this.$emit('rowDbClick', this.dataJson.tempJson)
      }
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
        this.$refs['dataSubmitForm'].clearValidate()
      })
    },
    // 删除操作
    handleDel(row) {
      let _message = ''
      const _value = row.is_del
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
        row.is_del = !row.is_del
      })
    },
    // 点击按钮 新增
    handleInsert() {
      // 新增
      this.popSettingsData.dialogStatus = 'insert'
      // 数据初始化
      this.initTempJsonOriginal()
      this.dataJson.tempJson = Object.assign({}, this.dataJson.tempJsonOriginal)
      this.$nextTick(() => {
        this.$refs['dataSubmitForm'].clearValidate()
      })
      // 设置按钮
      this.popSettingsData.btnShowStatus.showInsert = true
      this.popSettingsData.btnShowStatus.showUpdate = false
      this.popSettingsData.btnShowStatus.showCopyInsert = false
      // 初始化弹出页面
      this.doReset()
      this.popSettingsData.dialogFormVisible = true
      // 控件focus
      this.$nextTick(() => {
        // this.$refs['selectOne'].focus()
        // 初始化模块选择
        this.initModuleSelectButton()
      })
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
        this.$refs['dataSubmitForm'].clearValidate()
      })
      // 设置按钮
      this.popSettingsData.btnShowStatus.showInsert = false
      this.popSettingsData.btnShowStatus.showUpdate = true
      this.popSettingsData.btnShowStatus.showCopyInsert = false
      // 控件focus
      this.$nextTick(() => {
        // this.$refs['selectOne'].focus()
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
    // 点击按钮 复制新增
    handleCopyInsert() {
      // 初始化级联数据
      this.getCascaderDataList()

      this.dataJson.tempJson = Object.assign({}, this.dataJson.currentJson)
      this.dataJson.tempJson.parent_id = this.dataJson.tempJson.id

      this.dataJson.tempJson.id = undefined
      this.dataJson.tempJson.template_id = undefined
      this.dataJson.tempJson.u_id = ''
      this.dataJson.tempJson.u_time = ''
      this.dataJson.tempJson.code = ''
      this.dataJson.tempJson.name = ''

      // 修改
      this.popSettingsData.dialogStatus = 'copyInsert'
      this.popSettingsData.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataSubmitForm'].clearValidate()
      })
      // 设置按钮
      this.popSettingsData.btnShowStatus.showInsert = false
      this.popSettingsData.btnShowStatus.showUpdate = false
      this.popSettingsData.btnShowStatus.showCopyInsert = true
      // 复制新增时focus
      this.$nextTick(() => {
        // this.$refs['selectOne'].focus()
      })
    },
    handleCurrentChange(row) {
      this.dataJson.currentJson = Object.assign({}, row) // copy obj
      this.dataJson.currentJson.index = this.getRowIndex(row)
      this.dataJson.tempJsonOriginal = Object.assign({}, row) // copy obj

      if (this.dataJson.currentJson.id !== undefined) {
        // this.settings.btnShowStatus.doInsert = true
        this.settings.btnShowStatus.showUpdate = true
        this.settings.btnShowStatus.showCopyInsert = true
      } else {
        // this.settings.btnShowStatus.doInsert = false
        this.settings.btnShowStatus.showUpdate = false
        this.settings.btnShowStatus.showCopyInsert = false
      }
      // 设置dialog的返回
      this.$store.dispatch('popUpSearchDialog/selectedDataJson', Object.assign({}, row))
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
        // 增加对象属性，columnTypeShowIcon，columnNameShowIcon
        const recorders = response.data
        const newRecorders = recorders.map(v => {
          return { ...v, columnTypeShowIcon: false, columnNameShowIcon: false }
        })
        this.dataJson.listData = newRecorders
        this.dataJson.paging = response.data
        this.dataJson.paging.records = {}
        this.settings.listLoading = false
      })
    },
    // 更新逻辑
    doUpdate() {
      this.$refs['dataSubmitForm'].validate((valid) => {
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
        code: '',
        name: '',
        simple_name: '',
        is_del: 'null'
      }
    },
    // 重置按钮
    doReset() {
      this.popSettingsData.btnResetStatus = true
      switch (this.popSettingsData.dialogStatus) {
        case 'update':
          // 数据初始化
          this.dataJson.tempJson = Object.assign({}, this.dataJson.tempJsonOriginal)
          // 初始化数据
          this.handleSelectOrReset()
          // 设置控件焦点focus
          this.$nextTick(() => {
            // this.$refs['selectOne'].focus()
          })
          break
        default:
          // 数据初始化
          this.dataJson.tempJson = Object.assign({}, this.dataJson.tempJsonOriginal)
          // 设置控件焦点focus
          this.$nextTick(() => {
            // this.$refs['selectOne'].focus()
          })
          break
      }

      // 去除validate信息
      this.$nextTick(() => {
        this.$refs['dataSubmitForm'].clearValidate()
      })
    },
    // 插入逻辑
    doInsert() {
      this.$refs['dataSubmitForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.dataJson.tempJson)
          this.settings.listLoading = true
          addMenuGroupApi(tempData).then((_data) => {
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
    // 资源类型check
    validateType(rule, value, callback) {
      // 现阶段只支持json配置
      if (value === '10') {
        return callback()
      }
      return callback(new Error('现在只支持json配置，请选择“json配置”'))
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
            可见状态提示：<br/>
            绿色：可见  <br/>
            红色：不可见
            </div>
            <svg-icon icon-class='perfect-icon-question1_btn' style='margin-left: 5px'/>
          </el-tooltip>
        </span>
      )
    },
    getCascaderDataList() {
      // 级联查询逻辑
      this.settings.listLoading = true
      getCascaderListApi().then(response => {
        this.dataJson.cascader.data = response.data
        this.settings.listLoading = false
      })
    },
    // --------------弹出查询框：--------------

    // --------------弹出查询框：模块页面--------------
    // 选择or重置按钮的初始化
    initModuleSelectButton() {
      this.$nextTick(() => {
        this.$refs.selectTwo.$el.parentElement.className = 'el-input-group__append el-input-group__append_select'
      })
      this.popSettingsData.searchDialogDataTwo.selectOrReset = false
      this.popSettingsData.searchDialogDataTwo.selectOrResetName = '选择'
      this.popSettingsData.searchDialogDataTwo.selectOrResetIcon = 'el-icon-search'
    },
    handleModuleDialogClick() {
      if (this.popSettingsData.searchDialogDataTwo.selectOrReset === false) {
        // 选择按钮
        this.popSettingsData.searchDialogDataTwo.dialogVisible = true
      } else {
        // 重置按钮
        this.popSettingsData.searchDialogDataTwo.selectedDataJson = {}
      }
    },
    // 关闭对话框：确定
    handleModuleCloseOk(val) {
      this.popSettingsData.searchDialogDataTwo.selectedDataJson = val
      this.popSettingsData.searchDialogDataTwo.dialogVisible = false
      this.initSelectOrResectButton()
    },
    // 关闭对话框：取消
    handleModuletCloseCancle() {
      this.popSettingsData.searchDialogDataTwo.dialogVisible = false
    },
    // 复制新增逻辑
    doCopyInsert() {
      this.$refs['dataSubmitForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.dataJson.tempJson)
          this.settings.listLoading = true
          addSubMenuApi(tempData).then((_data) => {
            this.$notify({
              title: '更新成功',
              message: _data.message,
              type: 'success',
              duration: this.settings.duration
            })
            this.getDataList()
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
    }
  }
}
</script>
