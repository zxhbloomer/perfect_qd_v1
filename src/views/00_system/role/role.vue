<template>
  <div class="app-container">
    <!-- 我來玩玩 -->
    <el-form
      ref="minusForm"
      :inline="true"
      :model="searchForm"
      :size="getSize()"
      label-position="getLabelPosition()"
      class="floatRight"
    >
      <el-form-item label="">
        <el-input v-model="searchForm.role_name" placeholder="权限组名称" />
      </el-form-item>
      <el-form-item :size="getSize()">
        <el-button type="primary" plain icon="el-icon-search" @click="handleSearch">搜索</el-button>
      </el-form-item>
    </el-form>
    <el-button-group>
      <el-button type="primary" icon="el-icon-circle-plus-outline" @click="handleCreate">新增</el-button>
      <el-button :disabled="!btnStatus.doEdit" type="primary" icon="el-icon-edit-outline" @click="handleUpdate">修改</el-button>
    </el-button-group>
    <el-table
      v-loading="listLoading"
      :data="listData"
      :element-loading-text="'正在拼命加载中...'"
      :size="getSize()"
      :height="tableHeight"
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
      <el-table-column sortable prop="create_dt" label="日期" />
      <el-table-column sortable prop="role_name" label="权限组名称" />
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button :size="getSize()" type="primary" icon="el-icon-edit" @click="handleRowUpdate(scope.row)" />
          <el-button :size="getSize()" type="danger" icon="el-icon-delete" @click="onDel(scope.row)" />
        </template>
      </el-table-column>
    </el-table>
    xx{{ paging.total }}xx{{ paging.page }}xx{{ paging.limit }}xx
    <pagination ref="minusPaging" :total="paging.total" :page.sync="paging.page" :limit.sync="paging.limit" @pagination="getDataList" />
    <!-- pop窗口1 -->
    <el-dialog
      v-el-drag-dialog
      :title="textMap[dialogStatus]"
      :visible.sync="dialogFormVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        :size="getSize()"
        label-position="rigth"
        label-width="120px"
        status-icon
      >
        <el-form-item label="日期：" prop="create_dt">
          <el-input v-model="temp.create_dt" />
        </el-form-item>
        <el-form-item label="权限组名称：" prop="role_name">
          <el-input v-model="temp.role_name" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button plain @click="dialogFormVisible = false">取 消</el-button>
        <el-button plain type="primary" @click="dialogStatus==='create'?createData():updateData()">确 定</el-button>
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
import { getList, updateData } from '@/api/00_system/role/role'
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
        search: {
          page: 1,
          limit: 20,
          role_name: undefined
        },
        // 分页控件的json
        paging: {
          page: 0,
          limit: 0,
          total: 0
        },
        // table使用的json
        listData: null,
        // 单条数据 json
        temp: {
          id: undefined,
          create_dt: '',
          role_name: ''
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
        dialogFormVisible: false
      },
      rules: {
        create_dt: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'blur' }],
        role_name: [{ required: true, message: 'title is required', trigger: 'blur' }]
      }
    }
  },
  created() {
    // 初始化查询
    this.getDataList()
    this.btnStatus.doEdit = false
    // 初始化分页
    this.paging.page = this.searchForm.page
    this.paging.limit = this.searchForm.limit
    this.paging.total = this.searchForm.total
  },
  methods: {
    handleRowClick(row) {
      this.temp = Object.assign({}, row) // copy obj
    },
    handleSearch() {
      // 查询
      this.searchForm.page = 1
      this.getDataList()
    },
    handleCreate() {
      // 新增
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleRowUpdate(row) {
      // 修改
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleUpdate() {
      if (this.temp.id === undefined) {
        this.showErrorMsg('请选择一条数据')
        return
      }
      // 修改
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleCurrentChange(row) {
      this.temp = Object.assign({}, row) // copy obj
      if (this.temp.id !== undefined) {
        this.btnStatus.doEdit = true
      } else {
        this.btnStatus.doEdit = false
      }
    },
    handleSortChange(column) {
      // 服务器端排序
      if (column.order === 'ascending') {
        this.searchForm.sort = column.prop
      } else if (column.order === 'descending') {
        this.searchForm.sort = '-' + column.prop
      }
      this.getDataList()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        create_dt: '',
        role_name: ''
      }
    },
    getDataList() {
      // 查询逻辑
      this.listLoading = true
      getList(this.searchForm).then(response => {
        this.listData = response.data.records
        this.searchForm.total = response.data.total
        this.listLoading = false
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateData(tempData).then(() => {
            for (const v of this.list) {
              if (v.id === this.temp.id) {
                const index = this.list.indexOf(v)
                this.list.splice(index, 1, this.temp)
                break
              }
            }
            this.dialogFormVisible = false
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
