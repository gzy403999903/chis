<template>
  <div class="user-panel">
    <div class="user-image">
      <img src="../../../assets/images/butterfly.png"/>
    </div>
    <div class="user-info">
      <div>姓名: <b>{{payload.userName}}</b></div><hr/>
      <div>角色: <b>{{payload.roleName}}</b></div><hr/>
      <div>{{payload.clinicName}}</div>
    </div>
    <div class="user-menu">
      <span @click="testFn">帮助</span>
      <el-divider direction="vertical"></el-divider>
      <span @click="testFn">关于系统</span>
      <el-divider direction="vertical"></el-divider>
      <span @click="showUpdatePasswordPanel">修改密码</span>
      <el-divider direction="vertical"></el-divider>
      <span @click="logout">退出登录</span>
    </div>
  </div>
</template>

<script>
import jwtDecode from 'jwt-decode'

export default {

  data () {
    return {
      payload: jwtDecode(this.$store.getters.token)
    }
  },

  methods: {
    // 显示修改密码面板
    showUpdatePasswordPanel () {
      this.$store.dispatch('passwordPanelVisible', true)
    },

    // 退出系统
    logout () {
      const url = '/chisAPI/logout'
      this.$http.get(url).then(res => {
        if (res.data.code === 401) {
          this.$message.success('您已退出系统')
        }
      })
    },

    // 测试功能
    testFn () {
      alert('开发中......')
    }
  }
}
</script>

<style scoped>
  .user-panel {
    width: 400px;
    height: 125px;
    padding: 10px;
  }
  .user-image {
    width: 90px;
    position: absolute;
    /*
    top: -10px;
    left: -10px;
    */
  }
  .user-image img {
    width: 100%;
  }
  .user-info {
    font-size: 14px;
    font-weight: 600;
    position: absolute;
    left: 30%;
    right: 5%;
  }
  .user-info b {
    padding-left: 5px;
    color: #3BB878;
  }
  .user-info hr {
    border: none;
    height: 2px;
    /*background-image: linear-gradient(to right, rgba(59, 184, 120, 1), rgba(0, 0, 0, 0));*/
    background-color: #3BB878;
    margin-bottom: 5px;
  }
  .user-clinic {
    font-size: 14px;
    font-weight: 600;
    text-align: right;
    word-break: keep-all;
    overflow: hidden;
    text-overflow: ellipsis;
    position: absolute;
    bottom: 30px;
  }
  .user-menu {
    position: absolute;
    bottom: 0;
    width: 100%;
    left: 0;
    /*border-radius: 25px;*/
    background-color: #3BB878;
    color: white;
    cursor: pointer; /* 指针样式 */
    padding: 0 15px;
    text-align: center;
    font-size: 14px;
  }
  .user-menu span:hover {
    color: #666666;
  }
</style>
