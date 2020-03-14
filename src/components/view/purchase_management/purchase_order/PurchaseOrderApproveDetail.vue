<template>
  <el-dialog
    class="fullscreen-dialog"
    fullscreen
    append-to-body
    :show-close="false"
    :close-on-click-modal="false"
    :visible="visible"
    @opened="dialogOpened"
    @closed="dialogClosed">

    <!-- 模态框标题栏与功能按钮-->
    <el-row slot="title">
      <el-col :span="5" style="font-size: 20px;">
        <span>采购订单明细</span>
      </el-col>
      <el-col :span="19" style="text-align: right;">
        <el-button size="mini" type="danger" icon="el-icon-circle-close"
                   @click="dataGridDoAction('unapproved')" v-if="row.approveState === approveState.PENDING">驳 回</el-button>
        <el-button size="mini" type="success" icon="el-icon-circle-check"
                   @click="dataGridDoAction('approved')" v-if="row.approveState === approveState.PENDING">通 过</el-button>
        <el-button size="mini" type="warning" icon="el-icon-right" @click="dialogClose">返 回</el-button>
      </el-col>
    </el-row>

    <!-- 数据表 -->
    <el-card
      shadow="hover"
      body-style="padding:0;">
      <el-table
        :height="$store.getters.dialogDataGridHeight"
        :data="dataGrid.data"
        stripe
        size="mini">
        <el-table-column fixed="left" type="index" width="50"/>
        <el-table-column prop="gsmGoodsTypeName" label="商品类型" width="110" show-overflow-tooltip/>
        <el-table-column prop="gsmGoodsOid" label="商品编码" width="100" show-overflow-tooltip/>
        <el-table-column prop="gsmGoodsName" label="商品名称" width="220" show-overflow-tooltip sortable/>
        <el-table-column prop="gsmGoodsSpecs" label="规格" width="150" show-overflow-tooltip/>
        <el-table-column prop="goodsUnitsName" label="单位" width="90" show-overflow-tooltip/>
        <el-table-column prop="planQuantity" label="计划数量" width="90"/>
        <el-table-column prop="purchaseQuantity" label="采购数量" width="90"/>
        <el-table-column prop="purchasePrice" label="采购单价" width="90"/>
        <el-table-column prop="totalPurchasePrice" label="采购小计" width="90"/>
        <el-table-column prop="originName" label="产地" width="100" show-overflow-tooltip sortable/>
        <el-table-column prop="manufacturerName" label="生产厂家" min-width="250" show-overflow-tooltip sortable/>
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
     * 打开界面载入采购订单明细
     */
    dialogOpened () {
      if (!this.row.lsh) {
        this.$message.error('载入采购订单明细错误, 请关闭重试')
        return false
      }

      this.$loading()
      const url = `/chisAPI/purchaseOrder/getGoodsGroupListByLsh`
      let params = {
        lsh: this.row.lsh
      }
      this.$http.get(url, {params}).then((res) => {
        if (res.data.code === 200) {
          this.dataGrid.data = res.data.resultSet.list
        } else {
          this.$message.error(res.data.msg)
        }
        this.$loading().close()
      })
    },

    /***
     * 关闭界面清空数据表
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
        const url = `/chisAPI/purchaseOrder/${action}`
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
            this.$message.error(res.data.msg)
            this.$loading().close()
          }
        })
      }).catch(() => {})
    }

  } // end methods
}
</script>

<style scoped>
</style>
