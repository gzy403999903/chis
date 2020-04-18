<template>
  <el-main>
    <transition name="move" mode="out-in">
      <router-view></router-view>
    </transition>
  </el-main>
</template>

<script>
import PubSub from 'pubsub-js'

export default {
  mounted () {
    PubSub.subscribe('renderView', (msg, index) => {
      this.$router.replace(index)
    })
  }
}
</script>

<style scoped>
  .el-main {
    overflow: hidden;
    padding: 0;
    background-color: rgba(245, 249, 249, 0.88);
  }

  /* mode="out-in" 先执行离开动画 在执行进入动画 */
  /* 离开动画的过度效果 */
  .move-leave-active {
    transition: all 0.5s;
  }
  /* 离开动画结束时的效果 */
  .move-leave-to {
    opacity: 0; /*设置不透明度 例如 0.5*/
    transform: translateX(70px);
    transition-delay: 0s; /*动画的等待时间 再进行下一个动画效果*/
  }

  /* 进入动画进入之前的效果 */
  .move-enter {
    opacity: 0;
    transform: translateX(-70px);
  }
  /* 进入动画的过度效果 */
  .move-enter-active {
    transition: all 0.5s; /*过渡效果*/
  }
  /* 进入动画结束时的效果 */
  .move-leave-to {
  }
</style>
