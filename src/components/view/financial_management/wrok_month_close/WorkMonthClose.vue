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

    <el-card
      shadow="never"
      body-style="padding: 0;">
      <!-- 待处理业务数据表 -->
      <el-table
        height="53vh"
        :data="dataGrid.msgData"
        border
        highlight-current-row
        size="mini">
        <el-table-column fixed="left" type="index" width="50"/>
        <el-table-column prop="msg" label="待处理的业务" min-width="300" show-overflow-tooltip/>
      </el-table>

      <!-- 月结数据 -->
      <el-table
        height="35vh"
        :data="dataGrid.monthData"
        border
        highlight-current-row
        size="mini">
        <el-table-column fixed="left" type="index" width="50"/>
        <el-table-column prop="apYear" label="年度" width="100" show-overflow-tooltip/>
        <el-table-column prop="apMonth" label="月度" width="100" show-overflow-tooltip/>
        <el-table-column label="期初成本" align="center">
          <el-table-column prop="hsQccb" label="含税" width="100" show-overflow-tooltip/>
          <el-table-column prop="wsQccb" label="无税" width="100" show-overflow-tooltip/>
          <el-table-column label="进项税" width="100" show-overflow-tooltip>
            <template slot-scope="props">
              {{(props.row.hsQccb - props.row.wsQccb).toFixed(2)}}
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column label="采购成本" align="center">
          <el-table-column prop="hsCgcb" label="含税" width="100" show-overflow-tooltip/>
          <el-table-column prop="wsCgcb" label="无税" width="100" show-overflow-tooltip/>
          <el-table-column label="进项税" width="100" show-overflow-tooltip>
            <template slot-scope="props">
              {{(props.row.hsCgcb - props.row.wsCgcb).toFixed(2)}}
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column label="退货成本" align="center">
          <el-table-column prop="hsThcb" label="含税" width="100" show-overflow-tooltip/>
          <el-table-column prop="wsThcb" label="无税" width="100" show-overflow-tooltip/>
          <el-table-column label="进项税" width="100" show-overflow-tooltip>
            <template slot-scope="props">
              {{(props.row.hsThcb - props.row.wsThcb).toFixed(2)}}
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column label="销售成本" align="center">
          <el-table-column prop="hsXscb" label="含税" width="100" show-overflow-tooltip/>
          <el-table-column prop="wsXscb" label="无税" width="100" show-overflow-tooltip/>
          <el-table-column label="进项税" width="100" show-overflow-tooltip>
            <template slot-scope="props">
              {{(props.row.hsXscb - props.row.wsXscb).toFixed(2)}}
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column label="领用成本" align="center">
          <el-table-column prop="hsLycb" label="含税" width="100" show-overflow-tooltip/>
          <el-table-column prop="wsLycb" label="无税" width="100" show-overflow-tooltip/>
          <el-table-column label="进项税" width="100" show-overflow-tooltip>
            <template slot-scope="props">
              {{(props.row.hsLycb - props.row.wsLycb).toFixed(2)}}
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column label="报损成本" align="center">
          <el-table-column prop="hsBscb" label="含税" width="100" show-overflow-tooltip/>
          <el-table-column prop="wsBscb" label="无税" width="100" show-overflow-tooltip/>
          <el-table-column label="进项税" width="100" show-overflow-tooltip>
            <template slot-scope="props">
              {{(props.row.hsBscb - props.row.wsBscb).toFixed(2)}}
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column label="期末成本" align="center">
          <el-table-column prop="hsQmcb" label="含税" width="100" show-overflow-tooltip/>
          <el-table-column prop="wsQmcb" label="无税" width="100" show-overflow-tooltip/>
          <el-table-column label="进项税" width="100" show-overflow-tooltip>
            <template slot-scope="props">
              {{(props.row.hsQmcb - props.row.wsQmcb).toFixed(2)}}
            </template>
          </el-table-column>
        </el-table-column>
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
        msgData: [],
        monthData: []
      }
    }
  }, // end data

  methods: {
    /**
     * 检查和执行月结操作
     */
    async checkAndUpdateToClose () {
      await this.dataGridLoadMsgData()
      await this.dataGridLoadMonthData()
      if (this.dataGrid.msgData.length === 0) {
        this.updateToClose()
      }
    },

    /**
     * 载入待处理业务数据
     */
    async dataGridLoadMsgData () {
      this.$loading()
      let url = '/chisAPI/workMonthClose/getPendingMsgByDateAndSysClinicId'
      let params = {
        beginDate: accountPeriod.getBeginDate(),
        endDate: accountPeriod.getEndDate()
      }

      await this.$http.get(url, {params}).then((res) => {
        if (res.data.code === 200) {
          this.dataGrid.msgData = res.data.resultSet.list
        }
        // this.$loading().close()
      })
    },

    /**
     * 载入月结数据
     */
    async dataGridLoadMonthData () {
      // this.$loading()
      let url = '/chisAPI/workMonthClose/getClinicWorkMonthCloseData'
      let params = {
        userDate: moment(new Date()).format('YYYY-MM-DD')
      }

      await this.$http.get(url, {params}).then((res) => {
        if (res.data.code === 200) {
          this.dataGrid.monthData = res.data.resultSet.list
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
          }
          this.$loading().close()
        }) // end http
      }).catch(() => {}) // end confirm
    }

  } // end methods
}
</script>

<style scoped>
</style>
