<template>
  <div>
    <el-form class="login-from-body" :model="loginForm" ref="loginForm" :rules="loginFormRules">
      <el-form-item prop="username">
        <i class="el-icon-qn-mine_fill"></i>
        <el-input type="text" placeholder="请输入登录账户" v-model="loginForm.username" autocomplete="off"
                  ref="username" @change="$refs.password.focus()" />
      </el-form-item>
      <el-form-item prop="password">
        <i class="el-icon-qn-lock_fill"></i>
        <el-input :type="passwordType" placeholder="请输入登录密码" v-model="loginForm.password" autocomplete="off"
                  ref="password" @keyup.enter.native="submitForm"/>
        <i class="el-icon-qn-browse_fill" @click="showPassword"></i>
      </el-form-item>
      <el-form-item>
        <el-button type="default" round @click="submitForm">登&nbsp;&nbsp;录</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  data () {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      loginFormRules: {
        username: [
          {required: true, message: '登录账户不能为空'},
          {max: 20, message: '长度为1-20个字符', trigger: 'blur'}
        ],
        password: [
          {required: true, message: '登录密码不能为空'},
          {min: 6, message: '不能小于6个字符', trigger: 'blur'}
        ]
      },
      passwordType: 'password',
      isShowPassword: false
    }
  },
  mounted () {
    this.$refs.username.focus()
  },
  methods: {
    showPassword () {
      this.isShowPassword = !this.isShowPassword
      if (this.isShowPassword) {
        this.passwordType = 'text'
      } else {
        this.passwordType = 'password'
      }
    },
    submitForm () {
      this.$refs.loginForm.validate((validate) => {
        if (validate) {
          this.$loading()
          let method = 'POST'
          let url = '/chisAPI/login'
          let params = this.loginForm
          this.$http({method, url, params}).then((res) => {
            if (res.data.code === 226) {
              // 在本地存储 Access_token
              this.$store.dispatch('setToken', res.data.resultSet.Authorization)
              // 路由跳转视图
              this.$router.replace('/main/home')
              this.$message.success('登陆成功')
            } else {
              this.$store.dispatch('removeToken')
            }
            this.$loading().close()
          }).catch((error) => {
            console.log('登录错误' + error)
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
  .el-icon-qn-mine_fill, .el-icon-qn-lock_fill {
    color: #666666;
    position: absolute;
    font-size: 32px;
    top: 5px;
    left: -40px;
  }
  .el-icon-qn-browse_fill {
    color: #666666;
    position: absolute;
    font-size: 25px;
    top: 9px;
    right: 15px;
    cursor:pointer;
  }
  .el-button{
    width: 300px;
    display: flex;
    justify-content: center;
    font-weight: 600;
    font-size: 14px;
  }
</style>
<style>
  .login-from-body input.el-input__inner {
    border: 0;
    outline: none;
    border-radius: 10px; /*边角弧度*/
  }
</style>
