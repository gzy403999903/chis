<template>
  <div>
    <!--功能菜单-->
    <el-card
      shadow="never"
      body-style="padding: 5px;"
      class="el-card-menus">
      <el-row>
        <el-col :span="6" align="left">&nbsp;
          <span style="font-size: 16px; font-weight: 600; color: #3BB878;" v-show="interval.enabled">
            数据将在 {{interval.time}} 秒后刷新
          </span>
        </el-col>
        <el-col :span="18">
          <el-input v-model="searchWord" size="mini" placeholder="会员编码 / 会员手机 查找" clearable
                    @change="searchWordChange" style="width: 280px; padding-right: 10px;">
            <template slot="prepend"><i class="el-icon-search"></i></template>
          </el-input>
          <el-button type="default" size="mini" round icon="el-icon-refresh" @click="dataGridLoadData">查 询</el-button>
          <el-button type="default" size="mini" round icon="el-icon-time" @click="autoRefresh" :disabled="false">
            {{interval.enabled ? '结束' : '开启'}}自动刷新
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 数据表 -->
    <el-card
      shadow="never"
      body-style="padding: 0 0 30px 0;">
      <el-table
        :height="$store.getters.dataGridHeight"
        :data="dataGrid.data"
        stripe
        size="mini">
        <el-table-column fixed="left" type="index" width="50"/>
        <el-table-column fixed="left" label="操作" align="center" width="100">
          <template slot-scope="scope">
            <el-button size="mini" type="success" plain icon="el-icon-money" @click="dialogOpen(scope.row)">收 费</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="dwtSellPrescriptionDate" label="处方日期" width="150" :formatter="creationDateFormatter" show-overflow-tooltip/>
        <el-table-column prop="mrmMemberOid" label="会员编码" width="150" show-overflow-tooltip/>
        <el-table-column prop="mrmMemberName" label="姓名" width="100" show-overflow-tooltip/>
        <el-table-column prop="genderName" label="性别" width="100" show-overflow-tooltip/>
        <el-table-column prop="phone" label="电话" show-overflow-tooltip/>
        <!--<el-table-column prop="sysDoctorName" label="医生" width="150" show-overflow-tooltip/>-->
      </el-table>
    </el-card>

    <!-- 处方结算 -->
    <ChargeFeePrescriptionEdit :visible="dialog.visible" :mrmMemberId="mrmMemberId"
                               :dialogClose="dialogClose" :dataGridLoadData="dataGridLoadData"/>

    <!-- 班次验证 -->
    <WorkGroupCloseChecker ref="workGroupCloseChecker"/>

  </div>
</template>

<script>
import moment from 'moment'
import ChargeFeePrescriptionEdit from './ChargeFeePrescriptionEdit'
import WorkGroupCloseChecker from '../../financial_management/work_group_close/WorkGroupCloseChecker'
export default {
  components: {
    ChargeFeePrescriptionEdit,
    WorkGroupCloseChecker
  },

  data () {
    return {
      mrmMemberId: 0, // 选中会员ID
      searchWord: '',
      dataGrid: {
        data: []
      },
      dialog: {
        visible: false
      },
      interval: {
        id: '', // 调度器ID
        enabled: false, // 启动状态
        defaultTime: this.$store.getters.autoRefreshTime, // 默认倒计时时间
        time: this.$store.getters.autoRefreshTime // 倒计时时间
      }
    }
  }, // end data

  mounted () {
    // 验证是否在当前班结中
    this.$refs.workGroupCloseChecker.checkRegistration()
    // 加载页面载入数据
    this.dataGridLoadData()
  },

  destroyed () {
    // 结束自动自动刷新调度器的 ID
    clearInterval(this.interval.id)
  }, // end destroyed

  methods: {
    /* -------------------------------------------------------------------------------------------------------------- */
    /**
     * 格式化日期
     */
    creationDateFormatter (row, column, cellValue, index) {
      return moment(cellValue).format('YYYY-MM-DD')
    },
    /**
     * 数据载入
     */
    dataGridLoadData () {
      this.$loading()
      const url = `/chisAPI/sellRecord/getClinicMemberGroupListFromCache`
      this.$http.get(url).then((res) => {
        if (res.data.code === 200) {
          this.dataGrid.data = res.data.resultSet.list
        }
        this.$loading().close()
      })
    },

    /**
     * 自动刷新
     */
    autoRefresh () {
      this.interval.enabled = !this.interval.enabled
      clearInterval(this.interval.id)
      this.interval.time = this.interval.defaultTime

      if (this.interval.enabled) {
        this.interval.id = setInterval(() => {
          this.interval.time--
          if (this.interval.time < 1) {
            this.interval.time = this.interval.defaultTime
            this.dataGridLoadData()
          }
        }, 1000)
      }
    },

    /**
     * 过滤查找
     */
    searchWordChange (searchWord) {
      if (!searchWord.trim()) {
        this.dataGridLoadData()
      }
      this.dataGrid.data = this.dataGrid.data.filter(item => {
        return (item.mrmMemberOid.indexOf(searchWord) !== -1) || (item.phone.indexOf(searchWord) !== -1)
      })
    },

    /* -------------------------------------------------------------------------------------------------------------- */
    /**
     * 打开界面
     */
    dialogOpen (row) {
      this.mrmMemberId = row.mrmMemberId
      this.dialog.visible = true
    },

    /**
     * 关闭界面
     */
    dialogClose () {
      this.dialog.visible = false
    }

  } // end methods
}
</script>

<style scoped>
</style>
