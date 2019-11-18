<template>
  <div>
    <el-input
      ref="minusLeftFilterInput"
      v-model="dataJson.filterText"
      class="filterInput"
      placeholder="输入关键字进行过滤"
      style="width:calc(100% - 90px)"
    >
      <el-button slot="append" ref="buttonSearch" icon="el-icon-search" class="buttonSearch" @click="handleButtonSearch" />
    </el-input>
    <div class="floatRight">
      <el-button-group>
        <el-button type="primary" icon="el-icon-plus" style="padding:7px 7px" :disabled="settings.btnDisabledStatus.disabledInsert" @click="handleInsert" />
        <el-button type="primary" icon="el-icon-edit" style="padding:7px 7px" :disabled="settings.btnDisabledStatus.disabledUpdate" />
        <el-button type="danger" icon="el-icon-delete" style="padding:7px 7px" :disabled="settings.btnDisabledStatus.disabledDelete" />
      </el-button-group>
    </div>
    <div :style="{height: height + 'px'}" class="mytree">
      <el-tree
        ref="treeObject"
        :data="dataJson.treeData"
        :props="dataJson.defaultProps"
        :filter-node-method="filterNode"
        :expand-on-click-node="false"
        :indent="0"
        highlight-current
        node-key="id"
        default-expand-all
        class="tree"
        @current-change="handleCurrentChange"
      >
        <span slot-scope="{ node, data }" class="custom-tree-node">
          <span>{{ node.label }}</span>
          <span>[{{ data.type_text }}]</span>
        </span>
      </el-tree>
    </div>

    <!-- pop窗口 数据编辑:新增、修改、步骤窗体-->
    <el-dialog
      v-if="popSettingsData.dialogFormVisible"
      v-el-drag-dialog
      title="请选择添加下级节点类型"
      :visible="popSettingsData.dialogFormVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      destroy-on-close
      width="500px"
      top="5vh"
    >
      <el-form
        ref="dataForm"
        label-position="top"
        label-width="120px"
        status-icon
      >
        <el-form-item label="组织机构类型：" prop="org_type">
          <radio-dict
            v-model="dataJson.tempJson.org_type"
            :para="settings.para"
            :filter-para="settings.filterPara"
            @change="handleRadioDictChange"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-divider />
        <el-button plain :disabled="settings.listLoading" @click="popSettingsData.dialogFormVisible = false">取 消</el-button>
        <!-- <el-button plain type="primary" :disabled="settings.listLoading || popSettingsData.btnDisabledStatus.disabledOK " @click="doOk()">确 定</el-button> -->
      </div>
    </el-dialog>

    <group-dialog
      :visible="popSettingsData.searchDialogDataOne.dialogVisible"
      @closeMeOk="handleGroupCloseOk"
      @closeMeCancle="handleGroupCloseCancle"
    />

    <company-dialog
      :visible="popSettingsData.searchDialogDataTwo.dialogVisible"
      @closeMeOk="handleCompanyCloseOk"
      @closeMeCancle="handleCompanyCloseCancle"
    />

    <dept-dialog
      :visible="popSettingsData.searchDialogDataThree.dialogVisible"
      @closeMeOk="handleDeptCloseOk"
      @closeMeCancle="handleDeptCloseCancle"
    />

    <position-dialog
      :visible="popSettingsData.searchDialogDataFour.dialogVisible"
      @closeMeOk="handlePositionCloseOk"
      @closeMeCancle="handlePositionCloseCancle"
    />

    <staff-dialog
      :visible="popSettingsData.searchDialogDataFive.dialogVisible"
      @closeMeOk="handleStaffCloseOk"
      @closeMeCancle="handleStaffCloseCancle"
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
</style>

<style scoped>
.treeStyle {
  overflow: auto;
  border: 1px solid #ebeef5;
}
.filterInput {
  margin-bottom: 10px;
}

.leaf {
    width: 20px;
    background: #ddd
}

.folder {
    width: 20px;
    background: #888
}

.custom-tree-container {
    display: -ms-flexbox;
    display: flex;
    margin: -24px
}

.block {
    -ms-flex: 1;
    flex: 1;
    padding: 8px 24px 24px
}

.block>p {
    text-align: center;
    margin: 0;
    line-height: 4
}

.block:first-child {
    border-right: 1px solid #eff2f6
}

.custom-tree-node {
    -ms-flex: 1;
    flex: 1;
    display: -ms-flexbox;
    display: flex;
    -ms-flex-align: center;
    align-items: center;
    -ms-flex-pack: justify;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px
}

.el-tree-node:focus > .el-tree-node__content {
  background-color: transparent !important;
}
</style>

<style lang="scss" scoped>
.mytree /deep/{
    .el-tree > .el-tree-node:after {
    border-top: none;
  }
  .el-tree-node {
    position: relative;
    padding-left: 12px;
  }
  //节点有间隙，隐藏掉展开按钮就好了,如果觉得空隙没事可以删掉
  .el-tree-node__expand-icon.is-leaf{
    display: none;
  }
  .el-tree-node__children {
    padding-left: 12px;
  }

  .el-tree-node :last-child:before {
    height: 38px;
  }

  .el-tree > .el-tree-node:before {
    border-left: none;
  }

  .el-tree > .el-tree-node:after {
    border-top: none;
  }

  .el-tree-node:before {
    content: "";
    left: 2px;
    position: absolute;
    right: auto;
    border-width: 1px;
  }

  .el-tree-node:after {
    content: "";
    left: 2px;
    position: absolute;
    right: auto;
    border-width: 1px;
  }

  .el-tree-node:before {
    border-left: 1px solid #4386c6;
    bottom: 0px;
    height: 100%;
    top: -26px;
    width: 1px;
  }

  .el-tree-node:after {
    border-top: 1px solid #4386c6;
    height: 20px;
    top: 12px;
    width: 8px;
  }
}

</style>

<style >
  .buttonSearch{
    color: #FFFFFF;
    background-color: #1890ff;
    border-color: #1890ff;
  }
</style>

<script>
import { getTreeListApi, insertApi } from '@/api/10_master/org/org'
import event from '@/utils/event'
import elDragDialog from '@/directive/el-drag-dialog'
import RadioDict from '@/layout/components/00_common/RedioComponent/RadioDictComponent'
import groupDialog from '@/views/10_master/group/dialog/dialog'
import companyDialog from '@/views/10_master/company/dialog/dialog'
import deptDialog from '@/views/10_master/dept/dialog/dialog'
import positionDialog from '@/views/10_master/position/dialog/dialog'
import staffDialog from '@/views/10_master/staff/dialog/dialog'

export default {
  name: 'P00000171', // 页面id，和router中的name需要一致，作为缓存
  components: { RadioDict, groupDialog, companyDialog, deptDialog, positionDialog, staffDialog },
  directives: { elDragDialog },
  props: {
    height: {
      type: Number,
      default: 200
    }
  },
  data() {
    return {
      dataJson: {
        filterText: '',
        treeData: [{}],
        // 单条数据 json
        currentJson: null,
        tempJson: {
          org_type: ''
        },
        tempJsonOriginal: null
      },
      // 页面设置json
      settings: {
        para: this.CONSTANTS.DICT_ORG_SETTING_TYPE,
        filterPara: [],
        listLoading: true,
        // 按钮状态：是否可用
        btnDisabledStatus: {
          disabledInsert: true,
          disabledUpdate: true,
          disabledDelete: true
        },
        defaultProps: {
          children: 'children',
          label: 'label'
        }
      },
      popSettingsData: {
        dialogFormVisible: false,
        btnDisabledStatus: {
          disabledOK: false
        },
        // 弹出的搜索框参数设置
        searchDialogDataOne: {
          // 弹出框显示参数
          dialogVisible: false,
          // 点击确定以后返回的值
          selectedDataJson: {}
        },
        // 弹出的搜索框参数设置
        searchDialogDataTwo: {
          // 弹出框显示参数
          dialogVisible: false,
          // 点击确定以后返回的值
          selectedDataJson: {}
        },
        // 弹出的搜索框参数设置
        searchDialogDataThree: {
          // 弹出框显示参数
          dialogVisible: false,
          // 点击确定以后返回的值
          selectedDataJson: {}
        },
        // 弹出的搜索框参数设置
        searchDialogDataFour: {
          // 弹出框显示参数
          dialogVisible: false,
          // 点击确定以后返回的值
          selectedDataJson: {}
        },
        // 弹出的搜索框参数设置
        searchDialogDataFive: {
          // 弹出框显示参数
          dialogVisible: false,
          // 点击确定以后返回的值
          selectedDataJson: {}
        }
      }
    }
  },
  computed: {
  },
  watch: {
    'dataJson.filterText': {
      handler(newVal, oldVal) {
        this.$refs.treeObject.filter(newVal)
      }
    },
    'dataJson.currentJson': {
      handler(newVal, oldVal) {
        if (newVal !== null) {
          // 判断是否是第一个节点：第一个节点是租户，所以不能删除，修改，只能新增
          if (this.dataJson.currentJson.index === 0) {
            this.settings.btnDisabledStatus.disabledInsert = false
            this.settings.btnDisabledStatus.disabledUpdate = true
            this.settings.btnDisabledStatus.disabledDelete = true
          } else {
            this.settings.btnDisabledStatus.disabledInsert = false
            this.settings.btnDisabledStatus.disabledUpdate = false
            this.settings.btnDisabledStatus.disabledDelete = false
          }
        } else {
          this.settings.btnDisabledStatus.disabledInsert = true
          this.settings.btnDisabledStatus.disabledUpdate = true
          this.settings.btnDisabledStatus.disabledDelete = true
        }
      }
    },
    'popSettingsData.dialogFormVisible': {
      handler(newVal, oldVal) {
        if (newVal === true) {
          const arr = []
          arr.push(this.CONSTANTS.DICT_ORG_SETTING_TYPE_STAFF)
          arr.push(this.CONSTANTS.DICT_ORG_SETTING_TYPE_POSITION)
          switch (this.dataJson.currentJson.type) {
            case this.CONSTANTS.DICT_ORG_SETTING_TYPE_TENTANT:
              arr.push(this.CONSTANTS.DICT_ORG_SETTING_TYPE_TENTANT)
              break
            case this.CONSTANTS.DICT_ORG_SETTING_TYPE_GROUP:
              arr.push(this.CONSTANTS.DICT_ORG_SETTING_TYPE_TENTANT)
              break
            case this.CONSTANTS.DICT_ORG_SETTING_TYPE_COMPANY:
              arr.push(this.CONSTANTS.DICT_ORG_SETTING_TYPE_TENTANT)
              arr.push(this.CONSTANTS.DICT_ORG_SETTING_TYPE_GROUP)
              break
            case this.CONSTANTS.DICT_ORG_SETTING_TYPE_DEPT:
              arr.push(this.CONSTANTS.DICT_ORG_SETTING_TYPE_TENTANT)
              arr.push(this.CONSTANTS.DICT_ORG_SETTING_TYPE_GROUP)
              arr.push(this.CONSTANTS.DICT_ORG_SETTING_TYPE_COMPANY)
              break
            case this.CONSTANTS.DICT_ORG_SETTING_TYPE_POSITION:
              arr.push(this.CONSTANTS.DICT_ORG_SETTING_TYPE_TENTANT)
              arr.push(this.CONSTANTS.DICT_ORG_SETTING_TYPE_GROUP)
              arr.push(this.CONSTANTS.DICT_ORG_SETTING_TYPE_DEPT)
              arr.push(this.CONSTANTS.DICT_ORG_SETTING_TYPE_POSITION)
              break
            case this.CONSTANTS.DICT_ORG_SETTING_TYPE_STAFF:
              arr.push(this.CONSTANTS.DICT_ORG_SETTING_TYPE_TENTANT)
              arr.push(this.CONSTANTS.DICT_ORG_SETTING_TYPE_GROUP)
              arr.push(this.CONSTANTS.DICT_ORG_SETTING_TYPE_DEPT)
              arr.push(this.CONSTANTS.DICT_ORG_SETTING_TYPE_POSITION)
              arr.push(this.CONSTANTS.DICT_ORG_SETTING_TYPE_STAFF)
              break
          }
          this.settings.filterPara = arr
        }
      }
    },
    'settings.listLoading': {
      handler(newVal, oldVal) {
        switch (newVal) {
          case true:
            this.showLoading('正在查询，请稍后...')
            break
          case false:
            this.closeLoading()
            break
        }
      }
    }
  },
  created() {
    // 初始化查询
    this.getDataList()
  },
  mounted() {
    this.initSearchButton()
    // 和right开始绑定事件
    event.$on('handleDataChange', this.handleDataChange)
    // 描绘完成
    this.$on('global:getDataList_loading', _data => { this.settings.listLoading = true })
    this.$on('global:getDataList_loading_ok', _data => { this.settings.listLoading = false })
  },
  methods: {
    // 选择or重置按钮的初始化
    initSearchButton() {
      this.$nextTick(() => {
        this.$refs.buttonSearch.$el.parentElement.className = ' buttonSearch ' + this.$refs.buttonSearch.$el.parentElement.className
      })
    },
    // 获取行索引
    getRowIndex(row) {
      const _index = this.dataJson.treeData.lastIndexOf(row)
      return _index
    },
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    getDataList() {
      // 查询逻辑
      this.settings.listLoading = true
      getTreeListApi(this.dataJson.searchForm).then(response => {
        this.dataJson.treeData = response.data
        this.getListAfterProcess()
        this.settings.listLoading = false
        this.$nextTick(() => {
          let current_node = null
          if (this.dataJson.currentJson === null) {
            current_node = this.dataJson.treeData[0]
            this.$refs.treeObject.setCurrentKey(this.dataJson.treeData[0].id)
            this.$refs.treeObject.getCurrentNode(current_node)
          } else {
            current_node = this.dataJson.currentJson
            this.$refs.treeObject.setCurrentKey(this.dataJson.currentJson.currentkey)
            this.$refs.treeObject.getCurrentNode(current_node)
          }
          this.handleCurrentChange(current_node)
        })
      })
    },
    handleCurrentChange(row) {
      this.dataJson.currentJson = Object.assign({}, row) // copy obj
      this.dataJson.tempJsonOriginal = Object.assign({}, row) // copy obj
      this.dataJson.currentJson = this.$refs.treeObject.getCurrentNode()
      this.dataJson.currentJson.currentkey = this.$refs.treeObject.getCurrentKey()
      // 通知兄弟组件
      this.$off('global:getDataList')
      this.$emit('global:getDataList', row)
    },
    // 兄弟组件发过来的调用请求
    handleDataChange() {
      // 查询
      this.getDataList()
    },
    handleButtonSearch() {
      // 查询
      this.getDataList()
    },
    // 查询后处理
    getListAfterProcess() {
      if (Object.keys(this.dataJson.filterText).length !== 0) {
        this.$nextTick(() => {
          this.$refs.treeObject.filter(this.dataJson.filterText)
        })
      }
    },
    // 点击新增子结构按钮
    handleInsert() {
      this.popSettingsData.dialogFormVisible = true
    },
    handleRadioDictChange(val) {
      this.dataJson.tempJson.org_type = val
      this.doOk()
    },
    doOk() {
      this.popSettingsData.dialogFormVisible = false
      switch (this.dataJson.tempJson.org_type) {
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_GROUP:
          this.popSettingsData.searchDialogDataOne.dialogVisible = true
          break
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_COMPANY:
          this.popSettingsData.searchDialogDataTwo.dialogVisible = true
          break
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_DEPT:
          this.popSettingsData.searchDialogDataThree.dialogVisible = true
          break
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_POSITION:
          this.popSettingsData.searchDialogDataFour.dialogVisible = true
          break
        case this.CONSTANTS.DICT_ORG_SETTING_TYPE_STAFF:
          this.popSettingsData.searchDialogDataFive.dialogVisible = true
          break
      }
    },
    // --------------弹出查询框：开始--------------
    // 集团：关闭对话框：确定
    handleGroupCloseOk(val) {
      this.popSettingsData.searchDialogDataOne.selectedDataJson = val
      this.popSettingsData.searchDialogDataOne.dialogVisible = false
      this.settings.listLoading = true
      insertApi({
        serial_id: this.popSettingsData.searchDialogDataOne.selectedDataJson.id,
        type: this.CONSTANTS.DICT_ORG_SETTING_TYPE_GROUP,
        parent_id: this.dataJson.currentJson.id
      }).then((_data) => {
        this.$notify({
          title: '插入成功',
          message: _data.message,
          type: 'success',
          duration: this.settings.duration
        })
        // 查询
        this.getDataList()
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
    },
    // 集团：关闭对话框：取消
    handleGroupCloseCancle() {
      this.popSettingsData.searchDialogDataOne.dialogVisible = false
    },
    // 企业：关闭对话框：确定
    handleCompanyCloseOk(val) {
      this.popSettingsData.searchDialogDataTwo.selectedDataJson = val
      this.popSettingsData.searchDialogDataTwo.dialogVisible = false
      this.settings.listLoading = true
      insertApi({
        serial_id: this.popSettingsData.searchDialogDataTwo.selectedDataJson.id,
        type: this.CONSTANTS.DICT_ORG_SETTING_TYPE_COMPANY,
        parent_id: this.dataJson.currentJson.id
      }).then((_data) => {
        this.$notify({
          title: '插入成功',
          message: _data.message,
          type: 'success',
          duration: this.settings.duration
        })
        // 查询
        this.getDataList()
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
    },
    // 企业：关闭对话框：取消
    handleCompanyCloseCancle() {
      this.popSettingsData.searchDialogDataTwo.dialogVisible = false
    },
    // 部门：关闭对话框：确定
    handleDeptCloseOk(val) {
      this.popSettingsData.searchDialogDataThree.selectedDataJson = val
      this.popSettingsData.searchDialogDataThree.dialogVisible = false
      this.settings.listLoading = true
      insertApi({
        serial_id: this.popSettingsData.searchDialogDataThree.selectedDataJson.id,
        type: this.CONSTANTS.DICT_ORG_SETTING_TYPE_DEPT,
        parent_id: this.dataJson.currentJson.id
      }).then((_data) => {
        this.$notify({
          title: '插入成功',
          message: _data.message,
          type: 'success',
          duration: this.settings.duration
        })
        // 查询
        this.getDataList()
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
    },
    // 部门：关闭对话框：取消
    handleDeptCloseCancle() {
      this.popSettingsData.searchDialogDataThree.dialogVisible = false
    },
    // 部门：关闭对话框：确定
    handlePositionCloseOk(val) {
      this.popSettingsData.searchDialogDataFour.selectedDataJson = val
      this.popSettingsData.searchDialogDataFour.dialogVisible = false
    },
    // 部门：关闭对话框：取消
    handlePositionCloseCancle() {
      this.popSettingsData.searchDialogDataFour.dialogVisible = false
    },
    // 员工：关闭对话框：确定
    handleStaffCloseOk(val) {
      this.popSettingsData.searchDialogDataFive.selectedDataJson = val
      this.popSettingsData.searchDialogDataFive.dialogVisible = false
    },
    // 员工：关闭对话框：取消
    handleStaffCloseCancle() {
      this.popSettingsData.searchDialogDataFive.dialogVisible = false
    }
    // --------------弹出查询框：结束--------------
  }
}
</script>
