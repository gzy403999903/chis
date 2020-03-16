<template>
  <div>
    <div class="home-body" :style="`height: ${$store.getters.dialogDataGridHeight}px;`">
      <div class="top-div">
        <el-row>
          <el-col :span="4">
            <i class="el-icon-user-solid" style="color: #409EFF;">0</i>
            <p>会员数量</p>
          </el-col>
          <el-col :span="4">
            <i class="el-icon-star-on" style="color: #F56C6C;">0</i>
            <p>近期生日会员</p>
          </el-col>
          <el-col :span="4">
            <i class="el-icon-s-comment" style="color: #E6A23C;">0</i>
            <p>待回访会员</p>
          </el-col>
          <el-col :span="4">
            <i class="el-icon-s-management" style="color: #67C23A;">0</i>
            <p>健康档案</p>
          </el-col>
          <el-col :span="4">
            <i class="el-icon-s-shop" style="color: #995e83;">0</i>
            <p>今日客单</p>
          </el-col>
          <el-col :span="4"></el-col>
        </el-row>
      </div> <!-- end top-div -->

      <div class="bottom-div" :style="`height: ${$store.getters.dialogDataGridHeight - 120}px;`">
        <div style="padding: 20px 0 20px 20px; background: linear-gradient(to bottom, #e9f2f9 , white);">
          <div style="float: left;"><h3>疫情要闻实时播报</h3></div>
          <div style="font-size: 14px; text-align: right; padding-right: 40px;">
            <a class="el-icon-refresh" @click="getEpidemicSituations">刷新</a>
          </div>
        </div>
        <div style="height: 82%; padding-left: 20px; overflow-y: auto;">
          <div v-if="epidemicData.length === 0" style="font-size: 16px;">
            <i class="el-icon-loading"></i>
            <span>数据正在加载, 请稍后......</span>
          </div>
          <el-timeline>
            <el-timeline-item v-for="(item, index) in epidemicData" :key="index" placement="top" color="#3BB878" :timestamp="'发布日期: ' + parseTimestamp(item.pubDate)">
              <el-card shadow="hover" body-style="padding: 10px;">
                <h4>{{item.title}}</h4>
                <p>{{item.summary}}</p>
                <a :href="item.sourceUrl" target="_blank" style="font-size: 12px;display: block; text-align: right; padding-right: 10px;">信息来源: {{item.infoSource}}</a>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>
        <div style="height: 50px; background: linear-gradient(to bottom, white, #e9f2f9);"></div>
      </div> <!-- end bottom-div -->
    </div> <!-- end home-body -->
  </div>
</template>

<script>
import moment from 'moment'
export default {
  data () {
    return {
      epidemicData: []
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
        res.data.forEach(msg => {
          this.$notify({type: msg.type, duration: 10000, dangerouslyUseHTMLString: true, title: msg.sender, message: msg.content})
        })
      })
    }

  } // end methods
}
</script>

<style scoped>
  .home-body {
    background-color: white;
  }
  .top-div {
    height: 110px;
    text-align: center;
    padding-top: 25px;
  }
  .top-div i {
    font-size: 3.5em;
  }
  .top-div p {
    font-size: 1.2em;
    font-weight: 600;
  }
  .bottom-div {
    /*border: #3BB878 1px solid;*/
    margin: 0 10px;
  }
</style>
