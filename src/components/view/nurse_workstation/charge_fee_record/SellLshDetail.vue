<template>
  <el-dialog
    width="75%"
    :show-close="false"
    :close-on-click-modal="false"
    :visible="visible"
    @opened="dialogOpened"
    @closed="dialogClosed">
    <!-- 模态框标题栏与功能按钮 -->
    <el-row slot="title">
      <el-col :span="5" style="font-size: 20px;">
        <span>销售流水明细</span>
      </el-col>
      <el-col :span="19" style="text-align: right;">
        <el-button size="mini" type="default" icon="el-icon-printer" @click="reprintChargeFeeBill">补打收费小票</el-button>
        <el-button size="mini" type="warning" icon="el-icon-right" @click="dialogClose">返 回</el-button>
      </el-col>
    </el-row>

    <!-- 销售明细 -->
    <el-card
      shadow="never"
      body-style="padding: 0;">
      <el-table
        height="55vh"
        :data="dataGrid.sellRecordList"
        stripe
        size="mini">
        <el-table-column fixed="left" type="index" width="50"/>
        <el-table-column prop="entityTypeName" label="销售类型" width="100" show-overflow-tooltip/>
        <el-table-column prop="entityOid" label="编码" width="120" show-overflow-tooltip/>
        <el-table-column prop="entityName" label="名称" width="200" show-overflow-tooltip/>
        <el-table-column prop="specs" label="规格" width="150" show-overflow-tooltip/>
        <el-table-column prop="unitsName" label="销售单位" width="100" show-overflow-tooltip/>
        <el-table-column prop="quantity" label="销售数量" width="100" show-overflow-tooltip/>
        <el-table-column prop="actualRetailPrice" label="实收单价" width="100" show-overflow-tooltip/>
        <el-table-column label="实收小计(含税)" width="120" show-overflow-tooltip>
          <template slot-scope="props">
            {{(props.row.actualRetailPrice * props.row.quantity).toFixed(2)}}
          </template>
        </el-table-column>
        <el-table-column prop="originName" label="产地" width="100" show-overflow-tooltip/>
        <el-table-column prop="manufacturerName" label="生产厂家" width="250" show-overflow-tooltip/>
        <el-table-column prop="ph" label="批号" width="150" show-overflow-tooltip/>
        <el-table-column prop="pch" label="批次号" width="150" show-overflow-tooltip/>
        <el-table-column prop="expiryDate" label="有效期至" width="120" show-overflow-tooltip/>
        <el-table-column prop="invoiceTypeName" label="发票类型" width="120" show-overflow-tooltip/>
        <el-table-column prop="invoiceNo" label="发票号" width="150" show-overflow-tooltip/>
        <el-table-column prop="sellerName" label="销售人" width="100" show-overflow-tooltip/>
        <el-table-column prop="operatorName" label="出库人" width="100" show-overflow-tooltip/>
        <el-table-column prop="cashierName" label="收银员" width="100" show-overflow-tooltip/>
      </el-table>
    </el-card>

    <!-- 补打收费小票 -->
    <ChargeFeeBillRecord :sell-record-list="dataGrid.sellRecordList"
                         :payment-record="dataGrid.paymentRecord"
                         :points="!dataGrid.points ? 0 : dataGrid.points"/>
  </el-dialog>
</template>

<script>
import PubSub from 'pubsub-js'
import ChargeFeeBillRecord from '../../print_page/ChargeFeeBillRecord'
export default {
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    row: {
      type: Object,
      required: true
    },
    dialogClose: {
      type: Function,
      required: true
    }
  },

  components: {
    ChargeFeeBillRecord
  },

  data () {
    return {
      dataGrid: {
        sellRecordList: [],
        paymentRecord: {},
        points: 0
      }
    }
  },

  methods: {
    /**
     * 界面打开后执行的操作
     */
    dialogOpened () {
      if (this.row.lsh) {
        this.loadChargeFeeRecord()
      }
    },

    /**
     * 界面关闭后执行的操作
     */
    dialogClosed () {
      this.dataGrid.sellRecordList = []
      this.dataGrid.paymentRecord = {}
      this.dataGrid.points = 0
    },

    /**
     * 载入收费记录
     */
    loadChargeFeeRecord () {
      this.$loading()
      let url = `/chisAPI/chargeFee/getChargeFeeRecordByLsh`
      let params = {
        lsh: this.row.lsh
      }

      this.$http.get(url, {params}).then((res) => {
        if (res.data.code === 200) {
          let chargeFeeRecord = res.data.resultSet.chargeFeeRecord
          this.dataGrid.sellRecordList = chargeFeeRecord.sellRecordList
          this.dataGrid.paymentRecord = chargeFeeRecord.paymentRecord
          this.dataGrid.points = chargeFeeRecord.points
        } else {
          this.$message.error(res.data.msg)
        }
        this.$loading().close()
      })
    },

    /**
     * 重打收费小票
     */
    reprintChargeFeeBill () {
      this.$loading()
      let url = `/chisAPI/chargeFee/printChargeFeeBill`
      this.$http.get(url).then((res) => {
        if (res.data.code === 200) {
          PubSub.publish('reprintChargeFeeBill')
        } else {
          this.$message.error(res.data.msg)
        }
        this.$loading().close()
      })
    }

  } // end methods
}
</script>

<style scoped>
</style>
