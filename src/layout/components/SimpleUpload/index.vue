<template>
  <el-upload
    class="el-button-group"
    :action="getActionUrl()"
    :show-file-list="false"
  >
    <el-button type="primary"><i class="el-icon-upload el-icon--right" />上传</el-button>
  </el-upload>
</template>
<script>
export default {
  name: 'SimpleUpload',
  data() {
    return {
    }
  },
  methods: {
    getActionUrl() {
      const _url = process.env.VUE_APP_FILE_SYSTEM_UPLOAD_URL
      return _url
    }
  }
}
</script>
