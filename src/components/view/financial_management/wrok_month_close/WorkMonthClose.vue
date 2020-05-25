<template>
  <div>
    <!--功能菜单-->
    <el-card
      shadow="never"
      body-style="padding: 5px;"
      class="el-card-menus">
      <span style="font-size: 16px; font-weight: 600;">
          当前年度为: <span style="color: red;">{{accountPeriod.getYear()}}</span>,&nbsp;&nbsp;
          月度为: <span style="color: red;">{{accountPeriod.getMonth()}}</span>.&nbsp;&nbsp;
         <el-button type="success" round size="mini" icon="el-icon-link" @click="checkAndUpdateToClose">月 结</el-button>
      </span>
    </el-card>

    <!-- 数据表 -->
    <el-card
      shadow="never"
      body-style="padding: 0;">
      <el-table
        :height="$store.getters.dataGridHeight + 40"
        :data="dataGrid.data"
        border
        highlight-current-row
        size="mini">
        <el-table-column fixed="left" type="index" width="50"/>
        <el-table-column prop="msg" label="待处理的业务" min-width="300" show-overflow-tooltip/>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import moment from 'moment'
import accountPeriod from '../../../../common/accountPeriod'
export default {
  data () {
    return {
      accountPeriod,
      dataGrid: {
        data: []
      }
    }
  }, // end data

  methods: {
    /**
     * 检查和执行月结操作
     */
    async checkAndUpdateToClose () {
      await this.dataGridLoadData()
      if (this.dataGrid.data.length === 0) {
        this.updateToClose()
      }
    },

    /**
     * 载入数据
     */
    async dataGridLoadData () {
      this.$loading()
      let url = '/chisAPI/workMonthClose/getPendingMsgByDateAndSysClinicId'
      let params = {
        beginDate: accountPeriod.getBeginDate(),
        endDate: accountPeriod.getEndDate()
      }

      await this.$http.get(url, {params}).then((res) => {
        if (res.data.code === 200) {
          this.dataGrid.data = res.data.resultSet.list
        }
        this.$loading().close()
      })
    },

    /**
     * 月结操作
     */
    updateToClose () {
      this.$confirm(`确认执行月结操作吗?`, '提示', {
        dangerouslyUseHTMLString: true, confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', showClose: false
      }).then(() => {
        this.$loading()
        const url = `/chisAPI/workMonthClose/updateToClose`
        let method = 'PUT'
        let params = {
          userDate: moment(new Date()).format('YYYY-MM-DD')
        }
        this.$http({method, url, params}).then((res) => {
          if (res.data.code === 200) {
            this.$message.success(res.data.msg)
            this.dataGridLoadData()
          } else {
            this.$loading().close()
          }
        }) // end http
      }).catch(() => {}) // end confirm
    }

  } // end methods
}
</script>

<style scoped>
</style>
