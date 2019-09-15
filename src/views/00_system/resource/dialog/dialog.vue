<template>
  <el-dialog
    v-el-drag-dialog
    title="资源选择对话框"
    :visible="dataJson.settings.dialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    width="1000px"
    destroy-on-close
    top="5vh"
  >
    <P00000020 />
    <div slot="footer" class="dialog-footer">
      <el-divider />
      <el-button plain>取 消</el-button>
      <el-button @click="doOk()">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import P00000020 from '@/views/00_system/resource/resource'

export default {
  name: 'COM000000',
  components: { P00000020 },
  directives: { elDragDialog },
  props: {
    // 页面是否显示参数
    show: {
      type: Boolean,
      default: false
    },
    // 返回值参数
    selectedDataJson: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      dataJson: {
        // 页面设置json
        settings: {
          dialogVisible: this.isShow()
        }
      }
    }
  },
  computed: {
  },
  created() {
    // 设置当前打开的页面
    this.$store.dispatch('popUpSearchDialog/program', { programId: 'COM000000', status: 'open' })
    this.$store.dispatch('popUpSearchDialog/selectedDataJson', null)
  },
  methods: {
    isShow() {
      return this.show
    },
    // 插入逻辑
    doOk() {
      this.dataJson.settings.dialogVisible = false
      this.$store.dispatch('popUpSearchDialog/program', { programId: 'COM000000', status: 'closed' })
    }
  }
}
</script>
