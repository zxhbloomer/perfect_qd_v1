<template>
  <div class="app-container calendar-list-container">
    <el-form ref="form" :inline="true" :model="searchForm" class="filter-container" size="mini">
      <el-form-item label="大分类">
        <el-select
          v-model="type1value"
          :remote-method="type1RemoteMethod"
          :loading="type1loading"
          filterable
          remote
          reserve-keyword
          placeholder="请输入关键词"
        >
          <el-option
            v-for="item in type1option"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
            <span style="float: left">{{ item.label }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{ item.value }}</span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="小分类">
        <el-select
          v-model="type1value"
          :remote-method="type2RemoteMethod"
          :loading="type2loading"
          filterable
          remote
          reserve-keyword
          placeholder="请输入关键词"
        >
          <el-option
            v-for="item in type2option"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-checkbox v-model="status" label="显示已删除" border />
      </el-form-item>
      <el-form-item size="mini">
        <el-button type="primary" icon="el-icon-search" @click="onSearch">搜索</el-button>
        <el-button type="primary" icon="el-icon-circle-plus-outline" @click="onCreate">新增</el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="listLoading"
      :data="listData"
      :element-loading-text="'正在拼命加载中...'"
      :size="size"
      :height="tableHeight"
      stripe
      highlight-current-row
      show-overflow-tooltip
      border
      fit
      style="width: 100%"
      @sort-change="handleSortChange"
    >
      <el-table-column type="selection" width="35" />
      <el-table-column :index="indexMethod" type="index" width="35" />
      <el-table-column prop="type1" label="大分类" show-overflow-tooltip sortable min-width="95" />
      <el-table-column prop="type1_name" label="大分类名称" show-overflow-tooltip sortable min-width="150" />
      <el-table-column prop="type2" label="小分类" show-overflow-tooltip sortable min-width="95" />
      <el-table-column prop="type2_name" label="小分类名称" show-overflow-tooltip sortable min-width="150" />
      <el-table-column prop="content" label="字典内容" show-overflow-tooltip sortable min-width="95" />
      <el-table-column prop="remark" label="备注" show-overflow-tooltip sortable min-width="150" />
      <el-table-column prop="created_name" label="登录人" show-overflow-tooltip sortable min-width="90" />
      <el-table-column prop="created_date_format" label="登录日期" show-overflow-tooltip min-width="125px" sortable />
      <el-table-column prop="modified_name" label="修改人" show-overflow-tooltip sortable min-width="90" />
      <el-table-column prop="modified_date_format" label="修改日期" show-overflow-tooltip min-width="125px" sortable />
      <el-table-column label="操作" fixed="right" min-width="109px">
        <template slot-scope="scope">
          <el-button-group>
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="onUpd(scope.row)" />
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="onDel(scope.row)" />
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <div ref="paging" class="pagination-container">
      <el-pagination
        :current-page.sync="searchForm.page"
        :page-sizes="[10,20,30, 50]"
        :page-size="searchForm.limit"
        :total="total"
        background
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <!-- 新增/修改 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="formJson" status-icon label-position="right" label-width="100px" style="" size="medium">
        <el-form-item label="大分类" prop="type1">
          <el-input v-model="formJson.type1" />
        </el-form-item>
        <el-form-item label="大分类名称" prop="type1_name">
          <el-input v-model="formJson.type1_name" />
        </el-form-item>
        <el-form-item label="小分类" prop="type2">
          <el-input v-model="formJson.type2" />
        </el-form-item>
        <el-form-item label="小分类名称" prop="type2_name">
          <el-input v-model="formJson.type2_name" />
        </el-form-item>
        <el-form-item label="字典内容" prop="content">
          <el-input v-model="formJson.content" />
        </el-form-item>
        <el-form-item label="启用状态" prop="status">
          <el-switch v-model="formJson.status" active-text="启用" inactive-text="未启用" active-value="1" inactive-value="0" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="formJson.remark" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">确 定</el-button>
        <el-button v-else type="primary" @click="updateData">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getList, create, put } from '@/api/10_master/wordBook/wb'

export default {
  data() {
    return {
      // type1 start
      type1option: [],
      type1value: [],
      type1list: [],
      states: [{ type: 'code001', name: '测试1' }, { type: 'code002', name: '测试2' }, { type: 'code003', name: '测试3' }],
      type1loading: false,
      type2option: [],
      type2value: [],
      type2list: [],
      type2loading: false,
      // type1 end
      // status start
      status: false,
      // status end
      // 编辑对话框 start
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '新增'
      },
      // 编辑对话框 end
      // 新增页面json start
      formJson: {
        id: undefined,
        type1: '',
        type1_name: '',
        type2: '',
        type2_name: '',
        content: '',
        status: '1',
        remark: '',
        created_name: '',
        created_date: '',
        modified_name: '',
        modified_date: ''
      },
      // 新增页面json end
      // 表单规则 start
      rules: {
        type1: [
          { required: true, message: '请输入大分类', trigger: 'blur' },
          { max: 20, message: '最大长度20个字符', trigger: 'blur' }
        ],
        type1_name: [
          { required: true, message: '请输入大分类名称', trigger: 'blur' },
          { max: 50, message: '最大长度20个字符', trigger: 'blur' }
        ],
        type2: [
          { required: true, message: '请输入小分类', trigger: 'blur' },
          { max: 20, message: '最大长度20个字符', trigger: 'blur' }
        ],
        type2_name: [
          { required: true, message: '请输入小分类名称', trigger: 'blur' },
          { max: 50, message: '最大长度20个字符', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请输入字典内容', trigger: 'blur' },
          { max: 250, message: '最大长度250个字符', trigger: 'blur' }
        ],
        status: [
          // { required: true, message: '请输入状态', trigger: 'blur' }
        ],
        remark: [
          { required: false, message: 'title is required', trigger: 'change' }
        ]
      },
      // 表单规则 end
      tableHeight: 800,
      total: null,
      searchForm: {
        page: 1,
        limit: 20,
        sort: undefined
      },
      size: 'mini',
      listLoading: true,
      // 表格数据的json start
      listData: null
      // 表格数据的json end
    }
  },
  created() {
    // 初始化查询
    this.getDataList()
    this.$nextTick(() => {
      this.resize()
      // this.$emit('resize')
    })
  },
  mounted: function() {
    window.addEventListener('resize', this.resize)
    this.type1list = this.states.map(item => {
      return { value: item.type, label: item.name }
    })
    this.type2list = this.states.map(item => {
      return { value: item.type, label: item.item }
    })
  },
  methods: {
    resize() {
      // 页面resize
      this.tableHeight = document.documentElement.clientHeight
      this.tableHeight = this.tableHeight - this.$parent.$parent.$refs.navbar.$el.offsetHeight
      this.tableHeight = this.tableHeight - this.$parent.$parent.$refs.tagsview.$el.offsetHeight
      this.tableHeight = this.tableHeight - this.$refs.paging.offsetHeight * 2
      this.tableHeight = this.tableHeight - 110
    },
    onSearch() {
      // 查询按钮
      this.searchForm.page = 1
      this.getDataList()
    },
    onCreate() {
      // 新增按钮
      this.resetformJson()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    onUpd(row) {
      this.formJson = Object.assign({}, row) // copy obj
      this.formJson.timestamp = new Date(this.formJson.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    resetformJson() {
      // 清空json
      this.formJson = {
        id: undefined,
        type1: '',
        type1_name: '',
        type2: '',
        type2_name: '',
        content: '',
        status: '1',
        remark: '',
        created_name: '',
        created_date: '',
        modified_name: '',
        modified_date: ''
      }
    },
    createData() {
      // 新增 调用api
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          create(this.formJson).then(() => {
            this.listData.unshift(this.formJson)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    updateData() {
      // 更新  调用api
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const formData = Object.assign({}, this.formJson)
          put(formData).then(() => {
            for (const v of this.listData) {
              if (v.id === this.formJson.id) {
                const index = this.listData.indexOf(v)
                this.listData.splice(index, 1, this.formJson)
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
    },
    indexMethod(index) {
      // 行编号
      return this.searchForm.limit * (this.searchForm.page - 1) + 1 + index
    },
    getDataList() {
      // 查询逻辑
      this.listLoading = true
      getList(this.searchForm).then(response => {
        this.listData = response.data.results
        this.total = response.data.count
        this.listLoading = false
      })
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
    handleSizeChange(val) {
      // 每页条数
      console.log(`每页 ${val} 条`)
      if (this.searchForm.limit === val) {
        return
      }
      this.searchForm.limit = val
      this.getDataList()
    },
    handleCurrentChange(val) {
      // 当前页跳转
      console.log(`当前页: ${val}`)
      this.getDataList()
    },
    type1RemoteMethod(query) {
      // 下拉选项
      if (query !== '') {
        this.type1loading = true
        setTimeout(() => {
          this.type1loading = false
          this.type1option = this.type1list.filter(item => {
            return item.label.toLowerCase().indexOf(query.toLowerCase()) > -1 ||
                     item.value.toLowerCase().indexOf(query.toLowerCase()) > -1
          })
        }, 200)
      } else {
        this.type1option = []
      }
    },
    type2RemoteMethod(query) {
      // 下拉选项
      if (query !== '') {
        this.type2loading = true
        setTimeout(() => {
          this.type2loading = false
          this.type2option = this.type2list.filter(item => {
            return item.label.toLowerCase().indexOf(query.toLowerCase()) > -1 ||
                     item.value.toLowerCase().indexOf(query.toLowerCase()) > -1
          })
        }, 200)
      } else {
        this.type2option = []
      }
    }
  }
}
</script>
