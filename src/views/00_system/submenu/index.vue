<template>
  <!-- 过渡动画注释 by zxh -->
  <!-- <transition name="fade-transform" mode="out-in"> -->
  <transition>
    <keep-alive :include="cachedViews">
      <router-view />
    </keep-alive>
  </transition>
</template>

<script>
export default {
  name: 'M00000020',
  computed: {
    cachedViews() {
      console.log('submenu cacheviews:')
      console.log(this.$store.state.tagsView.cachedViews)
      this.$destroyKeepAlive(this.$store.state.tagsView.cachedViews, this.$store.state.tagsView.cachedKeys)
      return this.$store.state.tagsView.cachedViews
    },
    key() {
      return this.$route.fullPath
    }
  }
}
</script>
