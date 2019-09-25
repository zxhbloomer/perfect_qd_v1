<template>
  <div>
    <el-input
      ref="refSelectGrid"
      placeholder="请选择"
      readonly
      style="cursor:pointer"
    />
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
