<template>
  <div>
    <div class="home-body" :style="`height: ${$store.getters.dialogDataGridHeight}px;`">
      <!--
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
      </div> --><!-- end top-div -->

      <div class="info-card-wrapper">
        <div class="info-card info-card-danger">
          <div>本月指标</div>
          <hr/>
          <div>{{sellSituation.yzb}}元</div>
        </div>

        <div class="info-card info-card-info">
          <div>本月已完成</div>
          <hr/>
          <div>{{parseInt(sellSituation.yxs)}}元</div>
        </div>

        <div class="info-card info-card-warning">
          <div>今日指标</div>
          <hr/>
          <div>{{daySellTarget}}元</div>
        </div>

        <div class="info-card info-card-success">
          <div>今日已完成</div>
          <hr/>
          <div>{{parseInt(sellSituation.rxs)}}元</div>
        </div>

        <div class="info-card info-card-primary">
          <div>本月完成进度</div>
          <hr/>
          <div>{{sellSituation.wcl}}%</div>
        </div>
      </div>

      <div class="bottom-div" :style="`height: ${$store.getters.dialogDataGridHeight - 140}px;`">
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
import jwtDecode from 'jwt-decode'
import moment from 'moment'
import accountPeriod from '../../../common/accountPeriod'
export default {
  data () {
    return {
      payload: jwtDecode(this.$store.getters.token),
      epidemicData: [], // 疫情数据
      sellSituation: {}, // 销售概况
      daySellTarget: 0 // 日销售目标
    }
  }, // end data

  mounted () {
    // 获取肺炎疫情状况
    this.getEpidemicSituations()
    // 获取推送消息
    this.getMessageList()
    // 获取销售概况
    this.getSellSituation()
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
    },

    /**
     * 获取销售概况
     */
    getSellSituation () {
      let url = '/chisAPI/sellRecordReport/getSellRecordDailyByCreationDate'
      let params = {
        creationDate: [accountPeriod.getBeginDate(), accountPeriod.getCurrentDate()],
        queryMonth: accountPeriod.getCurrentMonth()
      }
      params.pageNum = 1
      params.pageSize = 30

      this.$http.get(url, {params}).then((res) => {
        if (res.data.code === 200) {
          let data = res.data.resultSet.page.list
          // 如果当前人员所属机构为总部则显示合计行数据(sysClinicId = 0) 否则显示对应门店数据
          let sysClinicId = this.payload.clinicId === this.$store.getters.HQID ? 0 : this.payload.clinicId
          this.sellSituation = data.find(row => row.sysClinicId === sysClinicId)
          // 计算今日销售指标
          let surplusTarget = this.sellSituation.yzb - this.sellSituation.yxs
          this.daySellTarget = surplusTarget <= 0 ? 0 : parseInt(surplusTarget / accountPeriod.getSurplusDays())
        }
      })
    }

  } // end methods
}
</script>

<style scoped>
  .home-body {
    background-color: white;
  }

  .info-card-wrapper {
    padding: 10px;
    display: flex;
    justify-content: space-around;
  }
  .info-card {
    width: 250px;
    height: 100px;
    border-radius: 8px;
    color: white;
    text-align: center;
  }
  .info-card div:nth-child(1) {
    padding: 5px 0;
    font-size: 1.3em;
  }
  .info-card div:nth-child(3) {
    font-size: 2.5em;
    padding-top: 10px;
  }
  .info-card hr {
    border:none;
    border-top: 1px solid white;
    width: 150px;
    margin: 0 auto;
  }
  .info-card-primary {
    background-color: rgb(100, 190, 243);
  }
  .info-card-success {
    background-color: rgb(103, 205, 166);
  }
  .info-card-warning {
    background-color: rgb(243, 197, 99);
  }
  .info-card-danger {
    background-color: rgb(255, 149 ,110);
  }
  .info-card-info {
    background-color: rgb(75, 196, 207);
  }

  /*style="width: 100px; height:1px; text-align: center; border:none;border-top:1px solid white;"*/
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
