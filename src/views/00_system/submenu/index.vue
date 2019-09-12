<template>
  <!-- 过渡动画注释 by zxh -->
  <!-- <transition name="fade-transform" mode="out-in"> -->
  <keep-alive :include="cachedViews">
    <router-view :key="key" />
  </keep-alive>
</template>

<script>
export default {
  name: 'M00000020',
  computed: {
    cachedViews() {
      return this.$store.state.tagsView.cachedViews
    },
    key() {
      return this.$route.path
    }
  }
}
</script>
