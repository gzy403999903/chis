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
        <span>销售退费</span>
      </el-col>
      <el-col :span="19" style="text-align: right;">
        <el-button size="mini" type="danger" icon="el-icon-money" @click="payDialogOpen">退 费</el-button>
        <el-button size="mini" type="warning" icon="el-icon-right" @click="dialogClose">返 回</el-button>
      </el-col>
    </el-row>

    <!-- 销售明细 -->
    <el-card
      shadow="never"
      body-style="padding: 0;">
      <el-table
        ref="sellRecordTable"
        @selection-change="tableSelectionChange"
        height="55vh"
        :data="dataGrid.data"
        stripe
        size="mini">
        <el-table-column fixed="left" type="index" width="50"/>
        <el-table-column fixed="left" type="selection" :selectable="tableSelectable" width="55"/>
        <el-table-column prop="returnable" label="是否可退" width="100" show-overflow-tooltip>
          <template slot-scope="props">
            <span v-show="props.row.returnable" style="color: green;">是</span>
            <span v-show="!props.row.returnable" style="color: red;">否</span>
          </template>
        </el-table-column>
        <el-table-column prop="entityTypeName" label="销售类型" width="100" show-overflow-tooltip/>
        <el-table-column prop="entityOid" label="编码" width="120" show-overflow-tooltip/>
        <el-table-column prop="entityName" label="名称" width="200" show-overflow-tooltip/>
        <el-table-column prop="specs" label="规格" width="150" show-overflow-tooltip/>
        <el-table-column prop="unitsName" label="销售单位" width="100" show-overflow-tooltip/>
        <el-table-column prop="quantity" label="销售数量" width="100" show-overflow-tooltip/>
        <el-table-column prop="actualRetailPrice" label="实收单价" width="100" show-overflow-tooltip/>
        <el-table-column label="实收小计(含税)" width="120" show-overflow-tooltip>
          <template slot-scope="props">
            {{(props.row.actualRetailPrice * props.row.quantity).toFixed(4)}}
          </template>
        </el-table-column>
        <el-table-column prop="originName" label="产地" width="100" show-overflow-tooltip/>
        <el-table-column prop="manufacturerName" label="生产厂家" width="250" show-overflow-tooltip/>
        <el-table-column prop="ph" label="批号" width="150" show-overflow-tooltip/>
        <el-table-column prop="pch" label="批次号" width="150" show-overflow-tooltip/>
        <el-table-column prop="expiryDate" label="有效期至" width="120" show-overflow-tooltip/>
        <el-table-column prop="sellerName" label="销售人" width="100" show-overflow-tooltip/>
        <el-table-column prop="operatorName" label="出库人" width="100" show-overflow-tooltip/>
        <el-table-column prop="cashierName" label="收银员" width="100" show-overflow-tooltip/>
      </el-table>
      <div class="bottom-div">
        退费合计: {{totalPrice}}
      </div>
    </el-card>

    <!-- 退费结算 -->
    <SellReturnedPay :visible="dialog.payVisible" :mrmMemberId="mrmMemberId"
                     :totalPrice="totalPrice" :sellRecordData="dataGrid.selectedData"
                     :dialogClose="payDialogClose" :allDialogClose="allDialogClose"/>

  </el-dialog>
</template>

<script>
import SellReturnedPay from './SellReturnedPay'
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
    },
    dataGridLoadData: {
      type: Function,
      required: true
    }
  },

  components: {
    SellReturnedPay
  },

  data () {
    return {
      mrmMemberId: 0, // 会员ID
      totalPrice: 0, // 合计退费金额
      dataGrid: {
        data: [],
        selectedData: []
      },
      dialog: {
        payVisible: false
      }
    }
  },

  methods: {
    /**
     * 界面打开后执行的操作
     */
    dialogOpened () {
      if (this.row.lsh) {
        this.loadSellRecord()
      }
    },

    /**
     * 界面关闭后执行的操作
     */
    dialogClosed () {
      this.mrmMemberId = 0
      this.totalPrice = 0
      this.dataGrid.data = []
      this.dataGrid.sellRecordData = []
    },

    /**
     * 载入未退费的销售记录明细
     */
    loadSellRecord () {
      this.$loading()
      let url = `/chisAPI/sellRecord/getClinicUnreturnedListByLshForInvoice`
      let params = {
        lsh: this.row.lsh
      }

      this.$http.get(url, {params}).then((res) => {
        if (res.data.code === 200) {
          this.dataGrid.data = res.data.resultSet.list
        }
        this.$loading().close()
      })
    },

    /**
     * 设置选择框是否可选
     */
    tableSelectable (row, rowIndex) {
      return !row.returned && row.returnable
    },

    /**
     * 当勾选发生改变时执行的操作
     * @param selection
     */
    tableSelectionChange (selection) {
      // 计算退费合计金额
      const values = selection.map(item => (item.quantity * item.actualRetailPrice))
      this.totalPrice = values.reduce((prev, curr) => {
        const value = Number(curr)
        if (!isNaN(value)) {
          return prev + curr
        } else {
          return prev
        }
      }, 0)
      this.totalPrice = this.totalPrice.toFixed(2) * 1

      // 保存选中的数据行
      this.dataGrid.selectedData = selection
    },

    /**
     * 打开结算界面
     */
    payDialogOpen () {
      if (this.dataGrid.selectedData.length === 0) {
        return
      }

      if (this.dataGrid.selectedData[0].mrmMemberId) {
        this.mrmMemberId = this.dataGrid.selectedData[0].mrmMemberId
      }

      this.dialog.payVisible = true
    },

    /**
     * 关闭结算界面
     */
    payDialogClose () {
      this.dialog.payVisible = false
    },

    /**
     * 关闭所有界面
     */
    allDialogClose () {
      this.payDialogClose()
      this.dialogClose()
      this.dataGridLoadData()
    }

  } // end methods
}
</script>

<style scoped>
  .bottom-div {
    height: 30px;
    font-size: 14px;
    font-weight: 600;
    color: red;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 30px;
  }
</style>
