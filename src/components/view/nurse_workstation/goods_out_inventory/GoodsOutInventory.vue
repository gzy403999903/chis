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
        <el-table-column fixed="left" label="操作" align="center" width="90">
          <template slot-scope="scope">
            <el-button size="mini" type="success" plain @click="dialogOpen(scope.row)">明 细</el-button>
           <!-- <el-button size="mini" type="success" plain @click="dialogOpen(scope.row)" :disabled="!scope.row.payState">发 药</el-button>-->
          </template>
        </el-table-column>
        <el-table-column prop="dwtSellPrescriptionLsh" label="流水号" width="240" show-overflow-tooltip/>
        <el-table-column prop="dwtSellPrescriptionDate" label="处方时间" width="160" show-overflow-tooltip/>
        <el-table-column fixed="right" prop="sysDoctorName" label="医生姓名" width="100" show-overflow-tooltip/>
        <el-table-column prop="mrmMemberOid" label="会员编码" width="120" show-overflow-tooltip/>
        <el-table-column prop="mrmMemberName" label="姓名" width="100" show-overflow-tooltip/>
        <el-table-column prop="genderName" label="性别" width="70" show-overflow-tooltip/>
        <el-table-column prop="phone" label="电话" width="120" show-overflow-tooltip/>
        <el-table-column prop="iymInventoryId" label="出库状态" min-width="100" show-overflow-tooltip>
          <template slot-scope="props">
            <span v-show="props.row.iymInventoryId" style="color: #67C23A;">已出库</span>
            <span v-show="!props.row.iymInventoryId" style="color: #F56C6C;">未出库</span>
          </template>
        </el-table-column>
        <!--<el-table-column prop="payState" label="付款状态" min-width="100" show-overflow-tooltip sortable>
          <template slot-scope="props">
            <span v-show="props.row.payState" style="color: #67C23A;">已付款</span>
            <span v-show="!props.row.payState" style="color: #F56C6C;">未付款</span>
          </template>
        </el-table-column>-->
      </el-table>
    </el-card>

    <!-- 处方划价 -->
    <GoodsOutInventoryEdit :visible="dialog.visible" :prescriptionLsh="prescriptionLsh"
                            :dialogClose="dialogClose" :dataGridLoadData="dataGridLoadData"/>

  </div>
</template>

<script>
import GoodsOutInventoryEdit from './GoodsOutInventoryEdit'

export default {
  components: {
    GoodsOutInventoryEdit
  },

  data () {
    return {
      prescriptionLsh: '', // 选中行的处方流水号
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
     * 数据载入
     */
    dataGridLoadData () {
      this.$loading()
      const url = `/chisAPI/sellRecord/getClinicDrugsPrescriptionGroupListFromCache`
      this.$http.get(url).then((res) => {
        if (res.data.code === 200) {
          this.dataGrid.data = res.data.resultSet.list
        } else {
          this.$message.error(res.data.msg)
        }
        this.$loading().close()
      })
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

    /* -------------------------------------------------------------------------------------------------------------- */
    /**
     * 打开接诊界面
     */
    dialogOpen (row) {
      this.prescriptionLsh = row.dwtSellPrescriptionLsh
      this.dialog.visible = true
    },

    /**
     * 关闭接诊界面
     */
    dialogClose () {
      this.dialog.visible = false
    }

  } // end methods
}
</script>

<style scoped>
</style>
