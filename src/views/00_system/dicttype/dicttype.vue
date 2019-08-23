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
        <el-input v-model.trim="dataJson.searchForm.name" clearable placeholder="字典名称" />
      </el-form-item>
      <el-form-item label="">
        <el-input v-model.trim="dataJson.searchForm.code" clearable placeholder="字典编码" />
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
      <el-form-item>
        <el-button type="primary" plain icon="el-icon-search" @click="handleSearch">搜 索</el-button>
      </el-form-item>
      <el-form-item>
        <el-button v-popover:popover type="primary" plain icon="el-icon-search" @click="doResetSearch">重 置</el-button>
      </el-form-item>
    </el-form>
    <el-button-group>
      <el-button type="primary" icon="el-icon-circle-plus-outline" :loading="settings.listLoading" @click="handleInsert">新 增</el-button>
      <el-button :disabled="!settings.btnStatus.showUpdate" type="primary" icon="el-icon-edit-outline" :loading="settings.listLoading" @click="handleUpdate">修 改</el-button>
      <el-button :disabled="!settings.btnStatus.showExport" type="primary" icon="el-icon-edit-outline" :loading="settings.listLoading" @click="handleExport">数据导出</el-button>
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
      <el-table-column show-overflow-tooltip sortable="custom" min-width="80" :sort-orders="settings.sortOrders" prop="name" label="名称" />
      <el-table-column show-overflow-tooltip sortable="custom" min-width="150" :sort-orders="settings.sortOrders" prop="code" label="编码" />
      <el-table-column show-overflow-tooltip min-width="150" prop="descr" label="描述" />
      <el-table-column min-width="35" :sort-orders="settings.sortOrders" label="删除">
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
    </el-table>
    <pagination ref="minusPaging" :total="dataJson.paging.total" :page.sync="dataJson.paging.current" :limit.sync="dataJson.paging.size" @pagination="getDataList" />
    <!-- pop窗口 数据编辑:新增、修改、步骤窗体-->
    <el-dialog
      v-el-drag-dialog
      :title="popSettingsData.textMap[popSettingsData.dialogStatus]"
      :visible.sync="popSettingsData.dialogFormVisible"
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
        label-width="120px"
        status-icon
      >
        <el-steps :active="stepsSetting.active" finish-status="success" align-center>
          <el-step title="选择资源类型" />
          <el-step title="输入资源数据" />
        </el-steps>
        <br>
        <br>
        <div v-show="stepsSetting.active === 0">
          <el-form-item label="资源类型：" prop="type">
            <el-select v-model="dataJson.tempJson.type" placeholder="请选择资源类型" clearable @change="handleSelectChange">
              <el-option
                v-for="item in settings.codeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </div>
        <div v-show="stepsSetting.active === 1">
          <el-row>
            <el-col :span="12">
              <el-form-item label="资源类型：" prop="type">
                <el-input v-model.trim="dataJson.tempJson.type" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="资源名称：" prop="name">
                <el-input v-model.trim="dataJson.tempJson.name" clearable show-word-limit :maxlength="dataJson.inputSettings.maxLength.name" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="描述：" prop="descr">
            <el-input v-model.trim="dataJson.tempJson.descr" clearable type="textarea" show-word-limit :maxlength="dataJson.inputSettings.maxLength.descr" />
          </el-form-item>
          <el-form-item label="JSON配置信息：" prop="context">
            <el-input v-model.trim="dataJson.tempJson.context" :autosize="{ minRows: 4, maxRows: 10 }" clearable type="textarea" show-word-limit />
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

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-divider />
        <div class="floatLeft">
          <el-button v-show="stepsSetting.active === stepsSetting.stepNumber" type="danger" :disabled="settings.listLoading" @click="doReset()">重置</el-button>
        </div>
        <el-button plain :disabled="settings.listLoading" @click="popSettingsData.dialogFormVisible = false">取 消</el-button>
        <el-button v-show="stepsSetting.active !== stepsSetting.stepNumber" @click="handleNext">下一步</el-button>
        <el-button v-show="popSettingsData.btnStatus.doInsert && stepsSetting.active === stepsSetting.stepNumber" plain type="primary" :disabled="settings.listLoading" @click="doInsert()">确 定</el-button>
        <el-button v-show="popSettingsData.btnStatus.doUpdate && stepsSetting.active === stepsSetting.stepNumber" plain type="primary" :disabled="settings.listLoading" @click="doUpdate()">确 定</el-button>
        <el-button v-show="popSettingsData.btnStatus.doCopyInsert && stepsSetting.active === stepsSetting.stepNumber" plain type="primary" :disabled="settings.listLoading" @click="doCopyInsert()">确 定</el-button>
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
</style>

<script>
import { getListApi, updateApi, insertApi, exportAllApi, exportSelectionApi, deleteApi } from '@/api/00_system/dicttype/dicttype'
import resizeMixin from './dictypeResizeHandlerMixin'
import Pagination from '@/components/Pagination'
import elDragDialog from '@/directive/el-drag-dialog'

export default {
  name: 'P00000030', // 页面id，和router中的name需要一致，作为缓存
  components: { Pagination },
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
          code: '',
          isdel: 'null',
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
          name: '',
          code: '',
          descr: '',
          dbversion: 0
        },
        // 单条数据 json
        tempJson: null,
        inputSettings: {
          maxLength: {
            name: 10,
            code: 50,
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
        duration: 4000
      },
      popSettingsData: {
        // 弹出窗口状态名称
        textMap: {
          update: '修改',
          insert: '新增'
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
        rules: []
      },
      // 步骤设置部分
      stepsSetting: {
        active: 0, // 控制步骤
        stepNumber: 1, // 总步数
        // 步骤1的check内容
        rulesFirst: {
          type: [
            { required: true, message: '请选择资源类型', trigger: 'change' },
            { validator: this.validateType, trigger: 'change' }
          ]
        },
        // 步骤2的check内容
        rulesSecond: {
          name: [{ required: true, message: '请输入资源名称', trigger: 'change' }],
          context: [{ required: true, message: '请输入json配置信息', trigger: 'change' }]
        }
      }
    }
  },
  // 监听器
  watch: {
    // 根据当前步骤，替换相应validate的rules
    'stepsSetting.active': {
      handler(newVal, oldVal) {
        this.$nextTick(() => {
          this.$refs['dataSubmitForm'].clearValidate()
        })
        switch (newVal) {
          case 0:
            this.popSettingsData.rules = this.stepsSetting.rulesFirst
            break
          case 1:
            this.popSettingsData.rules = this.stepsSetting.rulesSecond
            break
        }
      }
    }
  },
  created() {
    // 初始化查询
    this.getDataList()
    // 数据初始化
    this.dataJson.tempJson = Object.assign({}, this.dataJson.tempJsonOriginal)
    // 步骤初始化
    this.popSettingsData.rules = this.stepsSetting.rulesFirst
  },
  methods: {
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
    // 点击按钮 新增
    handleInsert() {
      // 新增
      this.popSettingsData.dialogStatus = 'insert'
      // 数据初始化
      this.dataJson.tempJson = Object.assign({}, this.dataJson.tempJsonOriginal)
      this.$nextTick(() => {
        this.$refs['dataSubmitForm'].clearValidate()
      })
      // 设置按钮
      this.popSettingsData.btnStatus.doInsert = true
      this.popSettingsData.btnStatus.doUpdate = false
      this.popSettingsData.btnStatus.doCopyInsert = false
      // 初始化弹出页面
      this.doReset()
      this.popSettingsData.dialogFormVisible = true
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
        this.$refs['dataSubmitForm'].clearValidate()
      })
      // 设置按钮
      this.popSettingsData.btnStatus.doInsert = false
      this.popSettingsData.btnStatus.doUpdate = true
      this.popSettingsData.btnStatus.doCopyInsert = false
      // 设置步骤激活的步骤：2
      this.stepsSetting.active = 1
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
      this.$refs['dataSubmitForm'].validate((valid) => {
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
    // 重置查询区域
    doResetSearch() {
      this.dataJson.searchForm = {
        // 翻页条件
        pageCondition: {
          current: 1,
          size: 20,
          sort: '-uTime' // 排序
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
      // 步骤初始化
      switch (this.popSettingsData.dialogStatus) {
        case 'insert':
          this.stepsSetting.active = 0
          break
        case 'update':
          this.stepsSetting.active = 1
          break
      }
      // 数据初始化
      this.dataJson.tempJson.name = ''
      this.dataJson.tempJson.descr = ''
      this.dataJson.tempJson.context = ''
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
    // 关闭弹出窗口
    handlCloseDialog() {
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
      this.$refs['dataSubmitForm'].validate((valid) => {
        if (valid) {
          // check没有错误
          if (this.stepsSetting.active === this.stepsSetting.stepNumber) {
            return
          }
          this.stepsSetting.active++
          this.$nextTick(() => {
            this.$refs['dataSubmitForm'].clearValidate()
          })
        } else {
          // check有错误
          return false
        }
      })
    },
    // 资源类型check
    validateType(rule, value, callback) {
      // 现阶段只支持json配置
      if (value === '10') {
        return callback()
      }
      return callback(new Error('现在只支持json配置，请选择“json配置”'))
    }
  }
}
</script>
