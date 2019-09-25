<template>
  <div>
    <el-input
      ref="refSelectGrid"
      v-popover:popover
      placeholder="请选择"
      readonly
      style="cursor:pointer"
    />
    <el-popover
      ref="popover"
      title="标题"
      width="900"
      trigger="focus"
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
  directives: { },
  mixins: [],
  data() {
    return {
      dataJson: {
      }
    }
  },
  // 监听器
  watch: {
  },
  created() {
  },
  mounted() {
    // 描绘完成
    const originalClass = this.$refs['refSelectGrid'].$el.children[0].className
    const newClass = originalClass + ' , pointer_cursor '
    this.$refs['refSelectGrid'].$el.children[0].className = newClass
  },
  methods: {
    // 修改手势

  }
}
</script>
