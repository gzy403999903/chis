<template>
  <div class="login-wrapper">
    <div class="login-top">
      <!--<img src="../../assets/images/company-logo.png"/>-->
    </div>
    <div class="login-left">
      <img src="../../assets/images/system-logo.png"/>
      <div class="system-name-1">
        雨思社区卫生信息系统
        <span style="margin-left: 5px; font-size: 12px;"><!--<i>开发版 1.1.35 Bate</i>--></span>
      </div>
      <div class="system-name-2">
        ⚘ Community Health Information System (CHIS)
      </div>
    </div>
    <div class="login-right">
      <LoginForm/>
    </div>
  </div>
</template>

<script>
import LoginForm from './LoginForm'

export default {
  components: {
    LoginForm
  }
}
</script>

<style scoped>
  .login-wrapper {
    width: 100vw;
    height: 100vh;
    background-color: #3BB878;
    border-bottom-right-radius: 45%;
  }
  .login-top {
    text-align: right;
    height: 40px;
    /*background: linear-gradient(to right, #3BB878 , rgba(255, 255, 255, 0.3));*/ /* 从左到右渐变 */
  }
  .login-top img {
    height: 100%;
  }
  .login-left {
    height: 110px;
    position: fixed;
    top: 8%;
    left: 5%;
  }
  .login-left img {
    height: 100%;
  }
  .login-left div {
    padding: 10px 0 0 20px;
    font-weight: 900;
    color: white;
  }
  .system-name-1 {
    font-size: 20px;
  }
  .system-name-2 {
    font-size: 15px;
  }
  .login-right {
    position: absolute;
    top: 28vh;
    right: 15vw;
  }
</style>
