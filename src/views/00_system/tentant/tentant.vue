<template>
  <div class="app-container">
    <el-row :gutter="10">
      <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6">
        <left :height="leftHeight" />
      </el-col>
      <el-col :xs="18" :sm="18" :md="18" :lg="18" :xl="18">
        <!-- <right class="grid-content bg-purple" :height="rightHeight" /> -->
      </el-col>
    </el-row>
  </div>
</template>
<script>
import resizeMixin from './tentantResizeHandlerMixin'

export default {
  name: 'P00000080', // 页面id，和router中的name需要一致，作为缓存
  components: {
    left: () => import('./left/left') // 左侧tree
    // right: () => import('./right/right') // 右侧list
    // UserList: () => import('./userList') // 右侧list
  },
  mixins: [resizeMixin],
  props: {
  },
  data() {
    return {

    }
  },
  computed: {
    leftHeight() {
      return this.setUIheight()
    },
    rightHeight() {
      return this.setUIheight()
    }
  },
  // 监听器
  watch: {
  },
  created() {
  },
  mounted() {
  },
  methods: {
  }
}
</script>
