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
        <el-input v-model.trim="dataJson.searchForm.name" clearable placeholder="员工名称" />
      </el-form-item>
      <el-form-item label="">
        <delete-type-normal v-model="dataJson.searchForm.is_del" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" plain icon="el-icon-search" @click="handleSearch">搜 索</el-button>
      </el-form-item>
      <el-form-item>
        <el-button v-popover:popover type="primary" plain icon="perfect-icon-reset" @click="doResetSearch">重 置</el-button>
      </el-form-item>
    </el-form>

    <el-button-group v-show="!meDialogSetting.dialogStatus">
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
      @row-dblclick="handleRowDbClick"
      @current-change="handleCurrentChange"
      @sort-change="handleSortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column v-if="!meDialogSetting.dialogStatus" type="selection" width="45" prop="id" />
      <el-table-column type="index" width="45" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="100" :sort-orders="settings.sortOrders" prop="name" label="员工姓名" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="150" :sort-orders="settings.sortOrders" prop="simple_name" label="姓名简称" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="80" :sort-orders="settings.sortOrders" prop="sex_text" label="性别" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="80" :sort-orders="settings.sortOrders" prop="birthday" label="生日" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="80" :sort-orders="settings.sortOrders" prop="email" label="邮箱地址" />
      <el-table-column show-overflow-tooltip min-width="150" prop="descr" label="描述" />
      <el-table-column min-width="50" :sort-orders="settings.sortOrders" label="删除" :render-header="renderHeaderIsDel">
        <template slot-scope="scope">
          <el-tooltip :content="'删除状态: ' + scope.row.is_del" placement="top">
            <el-switch
              v-model="scope.row.is_del"
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
      <el-table-column sortable="custom" min-width="150" :sort-orders="settings.sortOrders" prop="u_time" label="更新时间" />
    </el-table>
    <pagination ref="minusPaging" :total="dataJson.paging.total" :page.sync="dataJson.paging.current" :limit.sync="dataJson.paging.size" @pagination="getDataList" />

    <!-- pop窗口 数据编辑:新增、修改、步骤窗体-->
    <el-dialog
      v-el-drag-dialog
      :title="popSettingsData.textMap[popSettingsData.dialogStatus]"
      :visible="popSettingsData.dialogFormVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      width="800px"
    >
      <el-form
        ref="dataSubmitForm"
        :rules="popSettingsData.rules"
        :model="dataJson.tempJson"
        label-position="rigth"
        label-width="140px"
        status-icon
        :validate-on-rule-change="false"
      >

        <el-tabs style="height: 400px;">
          <br>
          <el-tab-pane>
            <template slot="label">基本信息<el-badge v-show="popSettingsData.badge.countOne>0" :value="popSettingsData.badge.countOne" type="danger" /></template>
            <el-row>
              <el-col :span="12">
                <el-form-item label="员工姓名：" prop="name">
                  <el-input ref="refInsertFocus" v-model.trim="dataJson.tempJson.name" clearable show-word-limit :maxlength="dataJson.inputSettings.maxLength.name" placeholder="请输入" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="员工姓名拼音：" prop="name_py">
                  <el-input v-model.trim="dataJson.tempJson.name_py" clearable show-word-limit :maxlength="dataJson.inputSettings.maxLength.name_py" placeholder="请输入" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="员工姓名简称：" prop="simple_name">
                  <el-input v-model.trim="dataJson.tempJson.simple_name" clearable show-word-limit :maxlength="dataJson.inputSettings.maxLength.simple_name" placeholder="请输入" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="员工姓名简称拼音：" prop="simple_name_py">
                  <el-input v-model.trim="dataJson.tempJson.simple_name_py" clearable show-word-limit :maxlength="dataJson.inputSettings.maxLength.simple_name_py" placeholder="请输入" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="12">
                <el-form-item label="性别：" prop="sex">
                  <select-dict v-model="dataJson.tempJson.type" :para="CONSTANTS.DICT_SYS_SEX_TYPE" init-placeholder="请选择性别" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="生日：" prop="birthday">
                  <el-date-picker v-model="dataJson.tempJson.birthday" value-format="yyyy-MM-dd" type="date" clearable placeholder="选择日期" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="12">
                <el-form-item label="邮箱地址：" prop="email">
                  <el-input v-model.trim="dataJson.tempJson.email" clearable show-word-limit :maxlength="dataJson.inputSettings.maxLength.email" placeholder="请输入" />
                </el-form-item>
              </el-col>
              <el-form-item label="在职情况：" prop="sex">
                <select-dict v-model="dataJson.tempJson.type" :para="CONSTANTS.DICT_USR_SERVICE_TYPE" init-placeholder="请选择在职情况" />
              </el-form-item>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="营业有效期 ：" prop="end_date">
                  <el-date-picker ref="refEnd_date" v-model="dataJson.tempJson.end_date" value-format="yyyy-MM-dd" type="date" clearable placeholder="选择日期" style="width: 100%" :disabled="popSettingsData.rules_disable.end_date" @change="handleEnd_dateChange()" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="营业有效期长期：" prop="long_term">
                  <el-switch v-model="dataJson.tempJson.long_term" inactive-text="营业有效期" active-text="长期" @change="handleLongTermChange" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="描述：" prop="descr">
              <el-input v-model.trim="dataJson.tempJson.descr" clearable show-word-limit type="textarea" :maxlength="dataJson.inputSettings.maxLength.descr" placeholder="请输入" />
            </el-form-item>

          </el-tab-pane>

          <el-tab-pane label="地址信息">

            <el-row>
              <el-col :span="12">
                <el-form-item label="联系人：" prop="link_man">
                  <el-input v-model.trim="popSettingsData.searchDialogDataOne.selectedDataJson.link_man" disabled>
                    <el-button slot="append" ref="selectOne" icon="el-icon-search" @click="handleModuleDialogClick">
                      选择
                    </el-button>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="电话：" prop="phone">
                  <el-input v-model.trim="popSettingsData.searchDialogDataOne.selectedDataJson.phone" disabled />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="邮编：" prop="postal_code">
                  <el-input v-model.trim="popSettingsData.searchDialogDataOne.selectedDataJson.postal_code" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="默认地址：" prop="is_default">
                  <el-switch
                    v-model="popSettingsData.searchDialogDataOne.selectedDataJson.is_default"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="12">
                <el-form-item label="省市区：" prop="cascader_text">
                  <el-input v-model.trim="popSettingsData.searchDialogDataOne.selectedDataJson.cascader_text" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="标签：" prop="tag">
                  <radio-dict v-model="popSettingsData.searchDialogDataOne.selectedDataJson.tag" :para="CONSTANTS.DICT_SYS_ADDRESS_TAG_TYPE" disabled />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="详细地址：" prop="detail_address">
              <el-input v-model.trim="popSettingsData.searchDialogDataOne.selectedDataJson.detail_address" disabled />
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

          </el-tab-pane>
        </el-tabs>

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
    <iframe id="refIframe" ref="refIframe" scrolling="no" frameborder="0" style="display:none" name="refIframe">x</iframe>

    <address-dialog
      :visible="popSettingsData.searchDialogDataOne.dialogVisible"
      @closeMeOk="handleAddressCloseOk"
      @closeMeCancle="handleAddressCloseCancle"
    />

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
import { getListApi, updateApi, insertApi, exportAllApi, exportSelectionApi, deleteApi } from '@/api/10_master/staff/staff'
import { getDataByid } from '@/api/10_master/address/address'
import resizeMixin from './staffResizeHandlerMixin'
import Pagination from '@/components/Pagination'
import elDragDialog from '@/directive/el-drag-dialog'
import DeleteTypeNormal from '@/layout/components/00_common/SelectComponent/SelectComponentDeleteTypeNormal'
import RadioDict from '@/layout/components/00_common/RedioComponent/RadioDictComponent'
import addressDialog from '@/views/10_master/address/dialog/dialog'
import SelectDict from '@/layout/components/00_common/SelectComponent/SelectDictComponent'

export default {
  name: 'P00000140', // 页面id，和router中的name需要一致，作为缓存
  components: { Pagination, DeleteTypeNormal, RadioDict, addressDialog, SelectDict },
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
          insert: '新增'
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
        rules: {},
        // 基本信息栏目check
        rulesOne: {
          code: [{ required: true, message: '请输入社会信用代码', trigger: 'change' }],
          name: [{ required: true, message: '请输入企业全称', trigger: 'change' }],
          simple_name: [{ required: true, message: '请输入企业简称', trigger: 'change' }],
          juridical_name: [{ required: true, message: '请输入法定代表人', trigger: 'change' }],
          register_capital: [{ required: true, message: '请输入注册资本（万）', trigger: 'change' }],
          type: [{ required: true, message: '请选择企业类型', trigger: 'change' }],
          setup_date: [
            { required: true, message: '请输入成立日期', trigger: 'change' },
            { validator: this.validateSetup_date, trigger: 'change' }
          ],
          end_date: [
            { required: true, message: '请输入营业有效期', trigger: 'change' },
            { validator: this.validateEnd_date, trigger: 'change' }
          ]
        },
        rules_disable: {
          // 默认可用
          end_date: false
        },
        // 错误数目
        badge: {
          countOne: 0,
          countTwo: 0,
          countThree: 0,
          countFour: 0
        },
        // 弹出的搜索框参数设置
        searchDialogDataOne: {
          // 弹出框显示参数
          dialogVisible: false,
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
    // 是否为更新模式
    isUpdateModel() {
      if (this.popSettingsData.dialogStatus === 'insert' || this.popSettingsData.dialogStatus === 'copyInsert') {
        return false
      } else {
        return true
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
    'popSettingsData.searchDialogDataOne.selectedDataJson': {
      handler(newVal, oldVal) {
        if (newVal !== {}) {
          this.dataJson.tempJson.address_id = this.popSettingsData.searchDialogDataOne.selectedDataJson.id
        } else {
          this.popSettingsData.searchDialogDataOne.selectedDataJson.id = undefined
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
        dbversion: 0,
        register_capital: 0
      }
    },
    initShow() {
      // 初始化查询
      this.getDataList()
      // 数据初始化
      this.dataJson.tempJson = Object.assign({}, this.dataJson.tempJsonOriginal)
    },
    // 弹出框设置初始化
    initDialogStatus() {
      if (this.$store.getters.program !== undefined &&
          this.$store.getters.program !== null &&
          this.$store.getters.program.status === 'open') {
        this.meDialogSetting.dialogStatus = true
      } else {
        this.meDialogSetting.dialogStatus = false
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
      // reset所有验证
      this.doResetValidate()
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
      // reset所有验证
      this.doResetValidate()
      // 设置按钮
      this.popSettingsData.btnShowStatus.showInsert = true
      this.popSettingsData.btnShowStatus.showUpdate = false
      this.popSettingsData.btnShowStatus.showCopyInsert = false
      // 初始化弹出页面
      this.doReset()
      this.popSettingsData.dialogFormVisible = true
      // 初始化模块选择
      this.initAddressSelectButton()
      // 控件focus
      this.$nextTick(() => {
        this.$refs['refInsertFocus'].focus()
      })
    },
    // 点击按钮 更新
    handleUpdate() {
      this.dataJson.tempJson = Object.assign({}, this.dataJson.currentJson)
      this.popSettingsData.searchDialogDataOne.selectedDataJson = {}
      this.getAddressDataByid()

      if (this.dataJson.tempJson.id === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      // 修改
      this.popSettingsData.dialogStatus = 'update'
      this.popSettingsData.dialogFormVisible = true
      // reset所有验证
      this.doResetValidate()
      // 设置按钮
      this.popSettingsData.btnShowStatus.showInsert = false
      this.popSettingsData.btnShowStatus.showUpdate = true
      this.popSettingsData.btnShowStatus.showCopyInsert = false
      // 初始化模块选择
      this.initAddressSelectButton()
      // 控件focus
      this.$nextTick(() => {
        this.$refs['refUpdateFocus'].focus()
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
      // reset所有验证
      this.doResetValidate()
      // 设置按钮
      this.popSettingsData.btnShowStatus.showInsert = false
      this.popSettingsData.btnShowStatus.showUpdate = false
      this.popSettingsData.btnShowStatus.showCopyInsert = true
      // 复制新增时focus
      this.$nextTick(() => {
        this.$refs['refInsertFocus'].focus()
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
        const recorders = response.data.records
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
      // 开始综合验证
      this.doValidateByTabs()
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
          break
        default:
          // 数据初始化
          this.dataJson.tempJson = Object.assign({}, this.dataJson.tempJsonOriginal)
          break
      }

      // 去除validate信息
      // reset所有验证
      this.doResetValidate()
    },
    // 插入逻辑
    doInsert() {
      // 开始综合验证
      this.doValidateByTabs()
      this.$refs['dataSubmitForm'].validate((valid, validateItems) => {
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
            删除状态提示：<br/>
            绿色：未删除  <br/>
            红色：已删除
            </div>
            <svg-icon icon-class='perfect-icon-question1_btn' style='margin-left: 5px'/>
          </el-tooltip>
        </span>
      )
    },
    // --------------弹出查询框：地址簿页面--------------
    // 选择or重置按钮的初始化
    initAddressSelectButton() {
      this.$nextTick(() => {
        this.$refs.selectOne.$el.parentElement.className = 'el-input-group__append el-input-group__append_select'
      })
    },
    handleModuleDialogClick() {
      // 选择按钮
      this.popSettingsData.searchDialogDataOne.dialogVisible = true
    },
    // 关闭对话框：确定
    handleAddressCloseOk(val) {
      this.popSettingsData.searchDialogDataOne.selectedDataJson = val
      this.popSettingsData.searchDialogDataOne.dialogVisible = false
      this.initAddressSelectButton()
    },
    // 关闭对话框：取消
    handleAddressCloseCancle() {
      this.popSettingsData.searchDialogDataOne.dialogVisible = false
    },
    // -------------------不同的页签，标签进行的验证------------------
    // 所有的数据开始validate
    doValidateAllRules() {
      this.popSettingsData.rules = { ...this.popSettingsData.rulesOne }
      this.$refs['dataSubmitForm'].rules = this.popSettingsData.rules
    },
    // 开始综合验证
    doValidateByTabs() {
      // 第一个tabs
      this.popSettingsData.rules = this.popSettingsData.rulesOne
      this.$refs['dataSubmitForm'].rules = this.popSettingsData.rules
      this.$refs['dataSubmitForm'].validate((valid, validateItems) => {
        if (valid === false) {
          this.popSettingsData.badge.countOne = Object.keys(validateItems).length
        }
      })

      // 第二个tabs

      // 所有的数据进行验证
      this.doValidateAllRules()
    },
    // reset所有验证
    doResetValidate() {
      this.popSettingsData.badge.countOne = 0
      this.popSettingsData.badge.countTwo = 0
      this.$nextTick(() => {
        this.$refs['dataSubmitForm'].clearValidate()
        this.doValidateAllRules()
      })
    },
    // 营业有效期长期
    handleLongTermChange(val) {
      if (val) {
        // 营业有效期 不可用
        this.popSettingsData.rules_disable.end_date = true
        this.dataJson.tempJson.end_date = '9999/01/01'
      } else {
        this.popSettingsData.rules_disable.end_date = false
        this.dataJson.tempJson.end_date = ''
      }
    },
    // -------------------验证部分------------------
    // 营业有效期需要大于成立日期
    validateSetup_date(rule, value, callback) {
      const _data = Date.parse(value)
      if (!isNaN(Date.parse(value))) {
        if (_data > Date.parse(this.dataJson.tempJson.end_date)) {
          return callback(new Error('输入的营业有效期应大于成立日期'))
        }

        return callback()
      }
    },
    validateEnd_date(rule, value, callback) {
      const _data = Date.parse(value)
      if (!isNaN(Date.parse(value))) {
        if (_data <= Date.parse(this.dataJson.tempJson.setup_date)) {
          return callback(new Error('输入的营业有效期应大于成立日期'))
        }
        return callback()
      }
    },
    handleSetup_dateChange() {
      this.$refs.dataSubmitForm.validateField('setup_date')
      this.$refs.dataSubmitForm.validateField('end_date')
    },
    handleEnd_dateChange() {
      this.$refs.dataSubmitForm.validateField('setup_date')
      this.$refs.dataSubmitForm.validateField('end_date')
    },
    getAddressDataByid() {
      getDataByid({ id: this.dataJson.tempJson.address_id }).then(response => {
        this.popSettingsData.searchDialogDataOne.selectedDataJson = Object.assign({}, response.data)
      })
    }
  }
}
</script>
