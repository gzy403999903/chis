<template>
  <el-container class="main-wrapper">
    <LeftBar/>
    <el-container direction="vertical">
      <TopBar/>
      <RightBar/>
    </el-container>
  </el-container>
</template>

<script>
import TopBar from './TopBar'
import LeftBar from './LeftBar'
import RightBar from './RightBar'

export default {
  components: {
    TopBar,
    LeftBar,
    RightBar
  }
}
</script>

<style scoped>
  .main-wrapper {
    height: 100%;
    background: url('../../assets/images/tengwan.png') no-repeat 100% 10px; /*图片地址 重复 左距离 上距离*/
    background-size: 47%; /* 背景图片缩放比例*/
  }
</style>
