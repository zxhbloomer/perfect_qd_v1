<template>
  <el-upload
    class="el-button-group"
    action="/api/v1/file/upload"
    :on-preview="handlePreview"
    :on-remove="handleRemove"
    :before-remove="beforeRemove"
    :show-file-list="false"
    :on-exceed="handleExceed"
  >
    <el-button type="primary"><i class="el-icon-upload el-icon--right" />上传</el-button>
  </el-upload>
</template>
<script>
export default {
  name: 'MyUpload',
  data() {
    return {
    }
  },
  methods: {
    handleRemove(file, fileList) {
      console.log(file, fileList)
    },
    handlePreview(file) {
      console.log(file)
    },
    handleExceed(files, fileList) {
      this.$message.warning(`当前限制选择 3 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`)
    },
    beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${file.name}？`)
    }
  }
}
</script>
