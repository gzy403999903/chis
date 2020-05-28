<template>
  <div>
    <div class="home-body">
      <div class="home-bg"></div>
    </div> <!-- end home-body -->
  </div>
</template>

<script>
import jwtDecode from 'jwt-decode'
import accountPeriod from '../../../common/accountPeriod'
export default {
  data () {
    return {
      payload: jwtDecode(this.$store.getters.token)
    }
  }, // end data

  mounted () {
    this.executeRequest()
  }, // end mounted

  methods: {
    /**
     * 发起请求
     */
    executeRequest () {
      // 检查是否月结 (如果是总部就不进行检查了)
      if (this.payload.clinicId !== this.$store.getters.HQID) {
        this.hasUnClosedWorkMonthClose()
      }
      // 获取推送消息
      this.getMessageList()
    },

    /**
     * 当前账期之前是否有未月结的账期
     */
    hasUnClosedWorkMonthClose () {
      const url = `/chisAPI/workMonthClose/getUnClosedByYearAndMonth`
      let params = {
        year: accountPeriod.getYear(),
        month: accountPeriod.getMonth()
      }
      this.$http.get(url, {params}).then((res) => {
        if (res.data) {
          this.$loading({
            lock: true,
            text: '请先处理未月结的账期......',
            spinner: 'el-icon-warning',
            background: 'rgba(0, 0, 0, 0.5)'
          })
        }
      })
    },

    /**
     * 获取推送消息
     */
    getMessageList () {
      const url = `/chisAPI/messager/getMessageList`
      this.$http.get(url).then((res) => {
        if (res.data.length > 0) {
          res.data.forEach(msg => {
            this.$notify({type: msg.type, duration: 10000, dangerouslyUseHTMLString: true, title: msg.sender, message: msg.content})
          })
        }
      })
    }

  } // end methods
}
</script>

<style scoped>
  .home-body {
    /*background-color: rgba(59, 184, 120, 0.05);*/
    background: linear-gradient(white, #e9f2f9, white); /*#fdfeff*/
    /*background-color: #e9f2f9;*/
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
  }

  .home-bg {
    width: 100vw;
    height: 400px;
    background: url('../../../assets/images/home-bg.png') no-repeat 0 0; /*图片地址 重复 左距离 上距离*/
    background-size: 95%; /* 背景图片缩放比例*/
  }
  /*
  .nurse-wrapper img {
    width: 300px;
  }
  .nurse-wrapper {
    position: relative;
    bottom: 72%;
  }
  */
</style>
