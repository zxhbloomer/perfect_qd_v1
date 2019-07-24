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
    </el-button-group>
    <el-button-group>
      <el-button type="primary" icon="el-icon-circle-plus-outline" @click="handleInsert">上传</el-button>
      <el-button type="primary" icon="el-icon-circle-plus-outline" @click="handleInsert">下载</el-button>
      <HelloWorld />
    </el-button-group>
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
      @row-click="handleRowClick"
      @current-change="handleCurrentChange"
      @sort-change="handleSortChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column type="index" />
      <el-table-column sortable prop="code" label="角色编码" />
      <el-table-column sortable prop="type" label="角色类型" />
      <el-table-column sortable prop="name" label="角色名称" />
      <el-table-column sortable prop="descr" label="描述" />
      <el-table-column sortable prop="simpleName" label="简称" />
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" @click="handleRowUpdate(scope.row, scope.$index)" />
          <el-button type="danger" icon="el-icon-delete" @click="onDel(scope.row)" />
        </template>
      </el-table-column>
    </el-table>
    <pagination ref="minusPaging" :total="dataJson.paging.total" :page.sync="dataJson.paging.current" :limit.sync="dataJson.paging.size" @pagination="getDataList" />
    <!-- pop窗口1 -->
    <el-dialog
      v-el-drag-dialog
      :title="popSettings.textMap[popSettings.dialogStatus]"
      :visible.sync="popSettings.dialogFormVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      width="620px"
    >
      <el-form
        ref="dataForm"
        :rules="popSettings.rules"
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
        <el-button plain :disabled="settings.listLoading" @click="popSettings.dialogFormVisible = false">取 消</el-button>
        <el-button v-show="popSettings.btnStatus.doInsert" plain type="primary" :disabled="settings.listLoading" @click="doInsert()">确 定</el-button>
        <el-button v-show="popSettings.btnStatus.doUpdate" plain type="primary" :disabled="settings.listLoading" @click="doUpdate()">确 定</el-button>
        <el-button v-show="popSettings.btnStatus.doCopyInsert" plain type="primary" :disabled="settings.listLoading" @click="doCopyInsert()">确 定</el-button>
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
import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'P00000000', // 页面id，和router中的name需要一致，作为缓存
  components: { Pagination, HelloWorld },
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
          sorts: [] // 排序
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
        rowIndex: 0
      },
      settings: {
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
      popSettings: {
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
        // 以下为pop的内容
        selection: [],
        dialogStatus: '',
        dialogFormVisible: false,
        // pop的check内容
        rules: {
          create_dt: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'blur' }],
          role_name: [{ required: true, message: 'title is required', trigger: 'blur' }]
        }
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
      this.popSettings.dialogStatus = 'update'
      this.popSettings.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 点击按钮 新增
    handleInsert() {
      // 新增
      this.popSettings.dialogStatus = 'insert'
      this.popSettings.dialogFormVisible = true
      // 数据初始化
      this.dataJson.tempJson = this.dataJson.tempJsonOriginal
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
      // 设置按钮
      this.popSettings.btnStatus.doInsert = true
      this.popSettings.btnStatus.doUpdate = false
      this.popSettings.btnStatus.doCopyInsert = false
    },
    // 点击按钮 更新
    handleUpdate() {
      if (this.dataJson.tempJson.id === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      // 修改
      this.popSettings.dialogStatus = 'update'
      this.popSettings.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
      // 设置按钮
      this.popSettings.btnStatus.doInsert = false
      this.popSettings.btnStatus.doUpdate = true
      this.popSettings.btnStatus.doCopyInsert = false
    },
    // 点击按钮 复制新增
    handleCopyInsert() {
      this.dataJson.tempJson.id === undefined
      this.dataJson.tempJson.uId = ''
      this.dataJson.tempJson.uTime = ''
      // 修改
      this.popSettings.dialogStatus = 'copyInsert'
      this.popSettings.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
      // 设置按钮
      this.popSettings.btnStatus.doInsert = false
      this.popSettings.btnStatus.doUpdate = false
      this.popSettings.btnStatus.doCopyInsert = true
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
            this.popSettings.dialogFormVisible = false
            this.settings.listLoading = false
          }, (_error) => {
            this.$notify({
              title: '更新错误',
              message: _error.message,
              type: 'error',
              duration: this.settings.duration
            })
            this.popSettings.dialogFormVisible = false
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
            this.popSettings.dialogFormVisible = false
            this.settings.listLoading = false
          }, (_error) => {
            this.$notify({
              title: '插入错误',
              message: _error.message,
              type: 'error',
              duration: this.settings.duration
            })
            this.popSettings.dialogFormVisible = false
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
            this.popSettings.dialogFormVisible = false
            this.settings.listLoading = false
          }, (_error) => {
            this.$notify({
              title: '更新错误',
              message: _error.message,
              type: 'error',
              duration: this.settings.duration
            })
            this.popSettings.dialogFormVisible = false
            this.settings.listLoading = false
          })
        }
      })
    }
  }
}
</script>
