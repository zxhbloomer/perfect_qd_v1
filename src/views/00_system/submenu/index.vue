<template>
  <!-- 过渡动画注释 by zxh -->
  <!-- <transition name="fade-transform" mode="out-in"> -->
  <transition>
    <keep-alive :include="cachedViews">
      <router-view :key="key" />
    </keep-alive>
  </transition>
</template>

<script>
export default {
  name: 'M00000020',
  computed: {
    cachedViews() {
      return this.$store.state.tagsView.cachedViews
    },
    key() {
      return this.$route.name
    }
  }
}
</script>
