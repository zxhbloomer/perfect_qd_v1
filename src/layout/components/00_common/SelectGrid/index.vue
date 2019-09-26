<template>
  <div>
    <el-input
      ref="refSelectGrid"
      v-popover:popover
      :placeholder="placeholder"
      readonly
      style="cursor:pointer"
      :suffix-icon="dataJson.settings.suffixIcon"
      @click.native="handleClick"
    />
    <el-popover
      ref="popover"
      v-model="dataJson.settings.visible"
      title="标题"
      width="900"
      trigger="manual"
      content="这是一段内容,这是一段内容,这是一段内容,这是一段内容。"
    >
      <el-table
        :data="dataJson.tableData"
        style="width: 100%"
      >
        <el-table-column
          prop="date"
          label="日期"
          width="180"
        />
        <el-table-column
          prop="name"
          label="姓名"
          width="180"
        />
        <el-table-column
          prop="address"
          label="地址"
        />
      </el-table>
    </el-popover>
  </div>
</template>

<style>
  .pointer_cursor {
    cursor:pointer
  }
</style>

<script>

export default {
  name: 'SelectGrid', // 页面id，和router中的name需要一致，作为缓存
  components: { },
  mixins: [],
  props: {
    // 接受上传的文件类型
    placeholder: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      dataJson: {
        // 页面设置json
        settings: {
          suffixIcon: 'el-icon-arrow-up',
          visible: false
        }
      }
    }
  },
  // 监听器
  watch: {
    'dataJson.settings.visible': {
      handler(newVal, oldVal) {
        if (newVal) {
          // 显示popover
          this.dataJson.settings.suffixIcon = 'el-icon-arrow-up'
        } else {
          // 隐藏popover
          this.dataJson.settings.suffixIcon = 'el-icon-arrow-down'
        }
      },
      immediate: true
    }
  },
  created() {
    // 页面初始化
    this.initCreated()
    // 点击其他不在的区域触发事件
    document.addEventListener('click', (e) => {
      if (this.dataJson.settings.visible !== false) {
        if (!this.$el.contains(e.target)) {
          this.dataJson.settings.visible = false
        }
      }
    })
  },
  mounted() {
    // 描绘完成
    const originalClass = this.$refs['refSelectGrid'].$el.children[0].className
    const newClass = originalClass + ' , pointer_cursor '
    this.$refs['refSelectGrid'].$el.children[0].className = newClass
  },
  methods: {
    // 页面初始化
    initCreated() {
    },
    // 单击事件
    handleClick() {
      this.dataJson.settings.visible = true
    }
  }
}
</script>
