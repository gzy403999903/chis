<template>
  <el-dialog
    title="修改密码"
    width="45%"
    :show-close="false"
    :close-on-click-modal="false"
    :visible="passwordPanelVisible"
    @opened="dialogOpened"
    @closed="dialogClosed">
    <el-form :model="passwordForm" ref="passwordForm" :rules="passwordFormRules" size="mini" label-width="80px">
      <el-form-item label="原密码" prop="oldPass">
        <el-input type="password" v-model.trim="passwordForm.oldPass" autocomplete="off"
                  ref="oldPass" @keyup.enter.native="editFormValidateField('oldPass', 'pass')"/>
      </el-form-item>
      <el-form-item label="新密码" prop="pass">
        <el-input type="password" v-model.trim="passwordForm.pass" autocomplete="off"
                  ref="pass" @keyup.enter.native="editFormValidateField('pass', 'checkPass')"/>
      </el-form-item>
      <el-form-item label="确认密码" prop="checkPass">
        <el-input type="password" v-model.trim="passwordForm.checkPass" autocomplete="off"
                  ref="checkPass"/>
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button type="default" size="small" round icon="el-icon-close" @click="$store.dispatch('passwordPanelVisible', false)">取 消</el-button>
      <el-button type="primary" size="small" round icon="el-icon-check" @click="editFormSubmit">确 定</el-button>
    </span>
    <el-alert
      title="请尽量使用一个较为复杂的密码, 您的密码会被加密成密文, 任何人都不可能看到您的原始密码"
      type="info"
      :closable="false">
    </el-alert>
  </el-dialog>
</template>

<script>
export default {

  data () {
    let validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else {
        if (this.passwordForm.checkPass !== '') {
          this.$refs.passwordForm.validateField('checkPass')
        }
        callback()
      }
    }
    let validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.passwordForm.pass) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      passwordForm: {
        oldPass: '',
        pass: '',
        checkPass: ''
      },
      passwordFormRules: {
        oldPass: [
          {required: true, message: '不能为空'},
          {min: 6, message: '不能小于6个字符', trigger: 'blur'}
        ],
        pass: [
          {required: true, message: '不能为空'},
          {validator: validatePass, trigger: 'blur'},
          {min: 6, message: '不能小于6个字符', trigger: 'blur'}
        ],
        checkPass: [
          {required: true, message: '不能为空'},
          {validator: validatePass2, trigger: 'blur'},
          {min: 6, message: '不能小于6个字符', trigger: 'blur'}
        ]
      }
    }
  },

  computed: {
    passwordPanelVisible: function () {
      return this.$store.getters.passwordPanelVisible
    }
  },

  methods: {
    dialogOpened () {
      this.$refs.oldPass.focus() // 打开编辑界面后自动获取焦点的位置
    },

    dialogClosed () {
      this.$refs.passwordForm.resetFields()
    },

    editFormValidateField (currentProp, nextRef) {
      this.$refs.passwordForm.validateField(currentProp, (valid) => {
        if (!valid) {
          this.$refs[nextRef].focus()
        } else {
          return false
        }
      })
    },

    editFormSubmit () {
      this.$refs.passwordForm.validate((valid) => {
        if (valid) {
          this.$loading()
          let url = '/chisAPI/user/updatePassword'
          let method = 'PUT'
          let params = {
            oldPass: this.passwordForm.oldPass,
            pass: this.passwordForm.pass
          }
          this.$http({method, url, params}).then((res) => {
            if (res.data.code === 200) {
              this.$message.success(res.data.msg)
              this.$store.dispatch('passwordPanelVisible', false)
            }
            this.$loading().close()
          }).catch((error) => {
            console.log('修改密码错误')
            console.log(error)
          })
        } else {
          return false
        }
      })
    }
  }
}
</script>

<style scoped>
</style>
