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
      <el-button type="primary" icon="el-icon-circle-plus-outline" @click="handleCreate">新增</el-button>
      <el-button :disabled="!settings.btnStatus.doEdit" type="primary" icon="el-icon-edit-outline" @click="handleUpdate">修改</el-button>
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
      <el-table-column sortable prop="type" label="角色类型" />
      <el-table-column sortable prop="code" label="角色编码" />
      <el-table-column sortable prop="name" label="角色名称" />
      <el-table-column sortable prop="descr" label="描述" />
      <el-table-column sortable prop="simpleName" label="简称" />
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" @click="handleRowUpdate(scope.row)" />
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
            <el-form-item label="角色类型：" prop="type">
              <el-input v-model="dataJson.tempJson.type" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色编码：" prop="code">
              <el-input v-model="dataJson.tempJson.code" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="角色名称：" prop="name">
              <el-input v-model="dataJson.tempJson.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="简称：" prop="simple_name">
              <el-input v-model="dataJson.tempJson.simpleName" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="描述：" prop="descr">
          <el-input v-model="dataJson.tempJson.descr" type="textarea" />
        </el-form-item>
        <el-row>
          <el-col :span="12">
            1
          </el-col>
          <el-col :span="12">
            2
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            11
          </el-col>
          <el-col :span="12">
            22
          </el-col>
        </el-row>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button plain :disabled="settings.listLoading" @click="popSettings.dialogFormVisible = false">取 消</el-button>
        <el-button plain type="primary" :disabled="settings.listLoading" @click="popSettings.dialogStatus==='create'?createData():updateData()">确 定</el-button>
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
import { apiGetList, apiUpdateData } from '@/api/00_system/role/role'
import resizeMixin from './roleResizeHandlerMixin'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import elDragDialog from '@/directive/el-drag-dialog' // base on element-ui

export default {
  name: 'P00000000', // 页面id，和router中的name需要一致，作为缓存
  components: { Pagination },
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
        // 单条数据 json
        tempJson: {
          id: undefined,
          type: '',
          code: '',
          name: '',
          descr: '',
          simpleName: ''
        }
      },
      settings: {
        // 按钮状态
        btnStatus: {
          doEdit: false
        },
        // loading 状态
        listLoading: true,
        tableHeight: this.setUIheight()
      },
      popSettings: {
        // 弹出窗口状态名称
        textMap: {
          update: '修改',
          create: '新增'
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
    this.settings.btnStatus.doEdit = false
  },
  methods: {
    handleRowClick(row) {
      this.dataJson.tempJson = Object.assign({}, row) // copy obj
    },
    handleSearch() {
      // 查询
      this.dataJson.searchForm.pageCondition.current = 1
      this.getDataList()
    },
    handleCreate() {
      // 新增
      this.popSettings.dialogStatus = 'create'
      this.popSettings.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleRowUpdate(row) {
      // 修改
      this.dataJson.tempJson = Object.assign({}, row) // copy obj
      this.popSettings.dialogStatus = 'update'
      this.popSettings.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
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
    },
    handleCurrentChange(row) {
      this.dataJson.tempJson = Object.assign({}, row) // copy obj
      if (this.dataJson.tempJson.id !== undefined) {
        this.settings.btnStatus.doEdit = true
      } else {
        this.settings.btnStatus.doEdit = false
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
    resetTemp() {
      this.dataJson.tempJson = {
        id: undefined,
        type: '',
        code: '',
        name: '',
        descr: '',
        simpleName: ''
      }
    },
    getDataList() {
      this.dataJson.searchForm.pageCondition.current = this.dataJson.paging.current
      this.dataJson.searchForm.pageCondition.size = this.dataJson.paging.size
      // 查询逻辑
      this.settings.listLoading = true
      apiGetList(this.dataJson.searchForm).then(response => {
        this.dataJson.listData = response.data.records
        this.dataJson.paging = response.data
        this.dataJson.paging.records = {}
        this.settings.listLoading = false
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.dataJson.tempJson)
          this.settings.listLoading = true
          apiUpdateData(tempData).then(() => {
            for (const v of this.dataJson.listData) {
              if (v.id === this.dataJson.tempJson.id) {
                const index = this.dataJson.listData.indexOf(v)
                this.dataJson.listData.splice(index, 1, this.dataJson.tempJson)
                break
              }
            }
            this.popSettings.dialogFormVisible = false
            this.settings.listLoading = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    }
  }
}
</script>
