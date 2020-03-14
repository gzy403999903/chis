<template>
  <el-dialog
    class="fullscreen-dialog"
    width="75%"
    :show-close="false"
    :close-on-click-modal="false"
    :visible="visible"
    @opened="dialogOpened"
    @closed="dialogClosed">
    <!-- 模态框标题栏与功能按钮 -->
    <el-row slot="title">
      <el-col :span="5" style="font-size: 20px;">
        <span>付款明细</span>
      </el-col>
      <el-col :span="19" style="text-align: right;">
        <!--
        <el-button size="mini" type="danger" icon="el-icon-circle-close"
                   @click="executeAction('unapproved')" v-if="row.approveState === approveState.PENDING">驳 回</el-button>
        -->
        <el-button size="mini" type="success" icon="el-icon-circle-check"
                   @click="executeAction('approved')" v-if="row.approveState === approveState.PENDING">通 过</el-button>
        <el-button size="mini" type="warning" icon="el-icon-right" @click="dialogClose">返 回</el-button>
      </el-col>
    </el-row>

    <!-- 销售明细 -->
    <el-card
      shadow="never"
      body-style="padding: 0;">
      <el-table
        height="65vh"
        :data="dataGrid.data"
        stripe
        highlight-current-row
        size="mini">
        <el-table-column fixed="left" type="index" width="50"/>
        <el-table-column prop="gsmGoodsOid" label="商品编码" width="100" show-overflow-tooltip/>
        <el-table-column prop="gsmGoodsName" label="名称" width="200" show-overflow-tooltip/>
        <el-table-column prop="gsmGoodsSpecs" label="规格" width="150" show-overflow-tooltip/>
        <el-table-column prop="goodsUnitsName" label="单位" width="80" show-overflow-tooltip/>
        <el-table-column prop="ph" label="批号" width="120" show-overflow-tooltip/>
        <el-table-column prop="pch" label="批次号" width="120" show-overflow-tooltip/>
        <el-table-column prop="costPrice" label="含税单价" width="100" show-overflow-tooltip/>
        <el-table-column fixed="right" prop="quantity" label="付款数量" width="100" show-overflow-tooltip/>
        <el-table-column fixed="right" label="付款金额/元" width="100" show-overflow-tooltip>
          <template slot-scope="props">
            {{(props.row.costPrice * props.row.quantity).toFixed(4)}}
          </template>
        </el-table-column>
        <el-table-column prop="originName" label="产地" width="100" show-overflow-tooltip/>
        <el-table-column prop="manufacturerName" label="生产厂家" min-width="250" show-overflow-tooltip/>
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
    /**
     * 界面打开后执行的操作
     */
    dialogOpened () {
      if (this.row.lsh) {
        this.loadPaidAccountList()
      }
    },

    /**
     * 界面关闭后执行的操作
     */
    dialogClosed () {
      this.dataGrid.data = []
    },

    /**
     * 载入入库记录
     */
    loadPaidAccountList () {
      this.$loading()
      let url = `/chisAPI/paidAccount/getByPaymentNo`
      let params = {
        paymentNo: this.row.paymentNo
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

    /**
     * 执行对应操作
     * @param action
     */
    executeAction (action) {
      // 计算应付金额是否为负数
      let values = this.dataGrid.data.map(item => item.quantity * item.costPrice)
      let total = values.reduce((prev, curr) => {
        return prev + curr
      }, 0)

      if (total < 0) {
        this.$message.error('应付金额不能小于 0')
        return
      }

      // 确认提交
      this.$confirm('确认执行该操作吗?', '提示', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', showClose: false
      }).then(() => {
        this.$loading()
        const url = `/chisAPI/paidAccount/${action}`
        let method = 'PUT'
        let params = {
          paymentNo: this.row.paymentNo
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
