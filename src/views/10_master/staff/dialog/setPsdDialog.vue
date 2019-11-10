<template>
  <el-dialog
    v-el-drag-dialog
    title="设置密码"
    :visible="visible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    width="600px"
    destroy-on-close
    top="5vh"
  >
    <div class="login-container">
      <el-form
        ref="refLoginForm"
        :model="dataJson.loginForm"
        :rules="dataJson.loginRules"
        class="login-form"
        auto-complete="on"
        label-position="left"
      >
        <el-tooltip v-model="dataJson.capsTooltip" content="Caps lock is On" placement="right" manual>
          <el-form-item prop="password">
            <span class="svg-container">
              <svg-icon icon-class="password" />
            </span>
            <el-input
              :key="dataJson.passwordType"
              ref="password"
              v-model="dataJson.loginForm.password"
              :type="dataJson.passwordType"
              placeholder="密码"
              name="password"
              tabindex="2"
              auto-complete="on"
              @keyup.native="checkCapslock"
              @blur="dataJson.capsTooltip = false"
              @keyup.enter.native="handleLogin"
            />
            <span class="show-pwd" @click="showPwd">
              <svg-icon :icon-class="dataJson.passwordType === 'password' ? 'eye' : 'eye-open'" />
            </span>
          </el-form-item>
        </el-tooltip>

      </el-form>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-divider />
      <el-button plain @click="handleDoCancel()">取 消</el-button>
      <el-button :disabled="dataJson.settings.btnDisabledStatus.disabledOk" @click="handleDoOk()">确 定</el-button>
    </div>
  </el-dialog>
</template>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    // height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      // height: 47px;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px ;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(220, 223, 230, 1);
    background: rgba(255, 255, 255, 1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style lang="scss" scoped>

.login-container {
  min-height: 100%;
  width: 100%;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    margin: 0 auto;
    overflow: hidden;
  }

  .tips {
    font-size: 14px;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 0px 5px 0px 15px;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .show-pwd {
    padding: 0px 5px 0px 15px;
    font-size: 16px;
    cursor: pointer;
    user-select: none;
  }

  .thirdparty-button {
    position: absolute;
    right: 0;
    bottom: 6px;
  }

  @media only screen and (max-width: 470px) {
    .thirdparty-button {
      display: none;
    }
  }
}
</style>

<script>
import elDragDialog from '@/directive/el-drag-dialog'
import { getUsrPsdStringApi } from '@/api/user'

export default {
  name: 'COM000010',
  components: { },
  directives: { elDragDialog },
  props: {
    // 页面是否显示参数
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dataJson: {
        loginForm: {
          password: '',
          encodePsd: ''
        },
        capsTooltip: false,
        passwordType: 'password',
        // 页面设置json
        settings: {
          // 按钮状态：是否可用
          btnDisabledStatus: {
            disabledOk: true
          }
        },
        loginRules: {
          password: [{ required: true, trigger: 'blur', validator: this.validatePassword }]
        }
      }
    }
  },
  computed: {
    listenVisible() {
      return this.visible
    }
  },
  // 监听器
  watch: {
    // 监听页面上面是否有选择
    'dataJson.loginForm.password': {
      handler(newVal, oldVal) {
        if (newVal === undefined || newVal === null) {
          this.dataJson.settings.btnDisabledStatus.disabledOk = true
        } else {
          this.dataJson.settings.btnDisabledStatus.disabledOk = false
        }
      },
      deep: true
    },
    // 监听页面是否打开
    listenVisible: {
      handler(newVal, oldVal) {
        if (newVal) {
          // dialog打开后初始化
          this.$store.dispatch('popUpSearchDialog/program', { programId: 'COM000010', status: 'open' })
          this.$store.dispatch('popUpSearchDialog/selectedDataJson', null)
        }
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    // 设置当前打开的页面

  },
  methods: {
    checkCapslock({ shiftKey, key } = {}) {
      if (key && key.length === 1) {
        if (shiftKey && (key >= 'a' && key <= 'z') || !shiftKey && (key >= 'A' && key <= 'Z')) {
          this.dataJson.capsTooltip = true
        } else {
          this.dataJson.capsTooltip = false
        }
      }
      if (key === 'CapsLock' && this.dataJson.capsTooltip === true) {
        this.dataJson.capsTooltip = false
      }
    },
    showPwd() {
      if (this.dataJson.passwordType === 'password') {
        this.dataJson.passwordType = ''
      } else {
        this.dataJson.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    // 确定
    handleDoOk() {
      this.$refs['refLoginForm'].validate((valid) => {
        if (valid) {
          this.getUsrPsdString()
          this.$store.dispatch('popUpSearchDialog/selectedDataJson', this.dataJson.loginForm.password)
          this.$store.dispatch('popUpSearchDialog/program', { programId: 'COM000010', status: 'closed' })
          this.$emit('closeMeOk', this.$store.getters.selectedDataJson)
        }
      })
    },
    // 取消
    handleDoCancel() {
      this.$store.dispatch('popUpSearchDialog/program', { programId: 'COM000010', status: 'closed' })
      this.$store.dispatch('popUpSearchDialog/selectedDataJson', null)
      this.$emit('closeMeCancle')
    },
    validatePassword(rule, value, callback) {
      if (value.length < 6) {
        callback(new Error('密码长度不能小于6位'))
      } else {
        callback()
      }
    },
    getUsrPsdString() {
      getUsrPsdStringApi({ pwd: this.dataJson.loginForm.password }).then(response => {
        this.dataJson.loginForm.encodePsd = Object.assign({}, response.data)
      })
    }
  }
}
</script>
