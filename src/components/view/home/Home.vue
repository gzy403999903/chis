<template>
  <div>
    <div class="home-body" :style="`height: ${$store.getters.dialogDataGridHeight + 35}px;`">

      <div class="epidemic-situation-wrapper">
        <div style="padding: 20px 0 20px 20px; background: linear-gradient(to bottom, #e9f2f9 , white);">
          <div style="float: left;"><h3>疫情要闻实时播报</h3></div>
          <div style="font-size: 14px; text-align: right; padding-right: 40px;">
            <a class="el-icon-refresh" @click="getEpidemicSituations">刷新</a>
          </div>
        </div>
        <div style="display: flex; height: 82%; ">
          <div style="padding: 18% 30px 0 30px;">
            <img src="../../../assets/images/nurse.png" style="width: 240px;"/>
          </div>
          <div style="overflow-y: auto;">
            <div v-if="epidemicData.length === 0" style="font-size: 16px;">
              <i class="el-icon-loading"></i>
              <span>数据正在加载, 请稍后......</span>
            </div>
            <el-timeline>
              <el-timeline-item v-for="(item, index) in epidemicData" :key="index" placement="top" color="#3BB878" :timestamp="'发布日期: ' + parseTimestamp(item.pubDate)">
                <el-card shadow="hover" body-style="padding: 10px;">
                  <h4>{{item.title}}</h4>
                  <p>{{item.summary}}</p>
                  <a :href="item.sourceUrl" target="_blank" style="font-size: 12px;display: block; text-align: right; padding: 10px 10px 0 0;">信息来源: {{item.infoSource}}</a>
                </el-card>
              </el-timeline-item>
            </el-timeline>
          </div>
        </div>
        <div style="height: 50px; background: linear-gradient(to bottom, white, #e9f2f9);"></div>
      </div> <!-- end bottom-div -->
    </div> <!-- end home-body -->
  </div>
</template>

<script>
import jwtDecode from 'jwt-decode'
import moment from 'moment'
export default {
  data () {
    return {
      payload: jwtDecode(this.$store.getters.token),
      epidemicData: [] // 疫情数据
    }
  }, // end data

  mounted () {
    // 获取肺炎疫情状况
    this.getEpidemicSituations()
    // 获取推送消息
    this.getMessageList()
  }, // end mounted

  methods: {
    /**
     * 解析时间戳
     * @param timestamp
     */
    parseTimestamp (timestamp) {
      return moment(timestamp).format('YYYY-MM-DD HH:mm:ss')
    },

    /**
     * 获取肺炎疫情状况
     * 取消该功能后需在 main.js 中的 axios拦截器中删除对应的代码(对以下 url 不添加请求头)
     */
    getEpidemicSituations () {
      // this.$loading()
      this.epidemicData = []
      const url = `https://file1.dxycdn.com/2020/0130/492/3393874921745912795-115.json`
      let params = {
        t: new Date().getTime()
      }
      this.$http.get(url, {params}).then((res) => {
        if (res.data.data.length > 50) {
          for (let i = 0; i < 50; i++) {
            this.epidemicData.push(res.data.data[i])
          }
        } else {
          this.epidemicData = res.data.data
        }
        // this.$loading().close()
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
    background-color: white;
    width: 100%;
    position: relative;
  }

  .epidemic-situation-wrapper {
    height: 100%;
  }

  .nurse-wrapper img {
    width: 300px;
  }
  .nurse-wrapper {
    position: relative;
    bottom: 72%;
  }
</style>
