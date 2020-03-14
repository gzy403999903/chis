<template>
  <el-dialog
    class="purchase-order-detail"
    fullscreen
    :show-close="false"
    :close-on-click-modal="false"
    :visible="visible"
    @opened="dialogOpened"
    @closed="dialogClosed">

    <!-- 模态框标题栏与功能按钮-->
    <el-row slot="title">
      <el-col :span="5" style="font-size: 20px;">
        <span>采购订单追踪明细</span>
      </el-col>
      <el-col :span="19" style="text-align: right;">
        <el-button size="mini" type="warning" icon="el-icon-right" @click="dialogClose">返 回</el-button>
      </el-col>
    </el-row>

    <!-- 数据表 -->
    <el-card
      shadow="hover"
      body-style="padding: 0;">
      <el-table
        :height="$store.getters.dialogDataGridHeight"
        :data="dataGrid.data"
        stripe
        highlight-current-row
        size="mini">
        <el-table-column fixed="left" type="index" width="40"/>
        <el-table-column prop="gsmGoodsTypeName" label="商品类型" width="110"/>
        <el-table-column prop="gsmGoodsOid" label="商品编码" width="100" show-overflow-tooltip/>
        <el-table-column prop="gsmGoodsName" label="商品名称" width="150" show-overflow-tooltip sortable/>
        <el-table-column prop="gsmGoodsSpecs" label="规格" width="120" show-overflow-tooltip/>
        <el-table-column prop="goodsUnitsName" label="单位" width="100" show-overflow-tooltip/>
        <el-table-column prop="originName" label="产地" width="100" show-overflow-tooltip sortable/>
        <el-table-column prop="manufacturerName" label="生产厂家" width="250" show-overflow-tooltip sortable/>
        <el-table-column prop="addQuantity" label="入库数量" width="100" show-overflow-tooltip/>
        <el-table-column prop="inventoryQuantity" label="剩余数量" width="100" show-overflow-tooltip/>
        <el-table-column prop="addCostPrice" label="入库单价" width="100" show-overflow-tooltip/>
        <el-table-column prop="ph" label="批号" width="130" show-overflow-tooltip/>
        <el-table-column prop="pch" label="批次号" width="130" show-overflow-tooltip/>
        <el-table-column prop="expiryDate" label="有效期" width="100" show-overflow-tooltip/>
        <el-table-column prop="sysClinicName" label="机构名称" min-width="400" show-overflow-tooltip/>

      </el-table>
    </el-card>

  </el-dialog>
</template>

<script>
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
     * 打开界面载入采购订单明细
     */
    dialogOpened () {
      if (!this.row.lsh) {
        this.$message.error('获取订单流水号失败')
        return false
      }

      this.$loading()
      const url = `/chisAPI/purchaseOrder/getTrackListByLsh`
      let params = {
        lsh: this.row.lsh
      }
      this.$http.get(url, {params}).then((res) => {
        this.dataGrid.data = res.data
        this.$loading().close()
      })
    },

    /***
     * 关闭界面清空数据表
     */
    dialogClosed () {
      this.dataGrid.data = []
    }

  } // end methods
}
</script>

<style scoped>
</style>
<style>
  .purchase-order-detail .el-dialog__body {
    padding: 0;
  }
</style>
