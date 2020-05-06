<template>
  <el-dialog
    class="fullscreen-dialog"
    fullscreen
    :show-close="false"
    :close-on-click-modal="false"
    :visible="visible"
    @opened="dialogOpened"
    @closed="dialogClosed">

    <!-- 模态框标题栏与功能按钮-->
    <el-row slot="title">
      <el-col :span="5" style="font-size: 20px;">
        <span>采购入库单审批</span>
      </el-col>
      <el-col :span="19" style="text-align: right;">
        <el-button size="mini" type="danger" icon="el-icon-circle-close"
                   @click="dataGridDoAction('unapproved')" v-if="row.approveState === approveState.PENDING">驳 回</el-button>
        <el-button size="mini" type="success" icon="el-icon-circle-check"
                   @click="dataGridDoAction('approved')" v-if="row.approveState === approveState.PENDING">通 过</el-button>
        <el-button size="mini" type="default" icon="el-icon-printer" @click="printPurchaseSubtractBill">打 印</el-button>
        <el-button size="mini" type="warning" icon="el-icon-right" @click="dialogClose">返 回</el-button>
      </el-col>
    </el-row>

    <!-- 数据表 -->
    <el-table
      :height="$store.getters.dialogDataGridHeight"
      :data="dataGrid.data"
      stripe
      size="mini">
      <el-table-column fixed="left" type="index" width="50"/>
      <el-table-column prop="gsmGoodsTypeName" label="商品类型" width="110" show-overflow-tooltip/>
      <el-table-column prop="gsmGoodsOid" label="编码" width="100" show-overflow-tooltip/>
      <el-table-column prop="gsmGoodsName" label="名称" width="200" show-overflow-tooltip sortable/>
      <el-table-column prop="goodsUnitsName" label="单位" width="90"/>
      <el-table-column prop="gsmGoodsSpecs" label="规格" width="150" show-overflow-tooltip/>
      <el-table-column prop="quantity" label="退货数量" width="100" show-overflow-tooltip/>
      <el-table-column prop="costPrice" label="退货单价" width="100" show-overflow-tooltip/>
      <el-table-column prop="ph" label="批号" width="120" show-overflow-tooltip/>
      <el-table-column prop="pch" label="批次" width="120" show-overflow-tooltip/>
      <el-table-column prop="producedDate" label="生产日期" width="100"/>
      <el-table-column prop="expiryDate" label="有效期至" width="100"/>
      <el-table-column prop="originName" label="产地" width="120" show-overflow-tooltip sortable/>
      <el-table-column prop="manufacturerName" label="生产厂家" min-width="250" show-overflow-tooltip sortable/>
    </el-table>

    <!-- 采购退货打印模板 -->
    <PurchaseBill title="退货" :data="dataGrid.data" ref="PurchaseBill"/>

  </el-dialog>
</template>

<script>
import PurchaseBill from '../../print_page/PurchaseBill'
export default {
  components: {
    PurchaseBill
  },

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

  data () {
    return {
      approveState: this.$store.getters.approveState,
      dataGrid: {
        data: []
      }
    }
  },

  methods: {
    /* -------------------------------------------------------------------------------------------------------------- */
    /**
     * 打开界面载入入库明细
     */
    dialogOpened () {
      if (!this.row.lsh) {
        this.$message.error('载入退货单明细错误, 请关闭重试')
        return false
      }

      this.$loading()
      const url = `/chisAPI/inventorySubtract/getByLsh`
      let params = {
        lsh: this.row.lsh
      }

      this.$http.get(url, {params}).then((res) => {
        if (res.data.length > 0) {
          this.dataGrid.data = res.data
        } else {
          this.$message.error('未能获取退货单明细')
        }
        this.$loading().close()
      })
    },

    /**
     * 界面关闭后执行的操作
     */
    dialogClosed () {
      this.dataGrid.data = []
    },

    /**
     * 执行对应操作
     * @param action
     */
    dataGridDoAction (action) {
      this.$confirm('确认执行该操作吗?', '提示', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', showClose: false
      }).then(() => {
        this.$loading()
        const url = `/chisAPI/inventorySubtract/${action}`
        let method = 'PUT'
        let params = {
          lsh: this.row.lsh
        }
        this.$http({method, url, params}).then((res) => {
          if (res.data.code === 200) {
            this.$message.success(res.data.msg)
            this.dialogClose()
            this.dataGridLoadData()
          } else {
            this.$loading().close()
          }
        })
      }).catch(() => {})
    },

    /**
     * 打印采购退货单
     */
    printPurchaseSubtractBill () {
      // 如果单据为非审核通过状态则终止
      if (this.dataGrid.data[0].approveState !== this.approveState.APPROVED) {
        this.$message.error('单据审核通过后方可进行打印')
        return
      }

      // 获取权限打印
      this.$loading()
      const url = '/chisAPI/inventorySubtract/printPurchaseSubtractBill'
      this.$http.get(url).then((res) => {
        if (res.data.code === 200) {
          this.$refs.PurchaseBill.printPage()
        }
        this.$loading().close()
      })
    }

  } // end methods
}
</script>

<style scoped>
</style>
