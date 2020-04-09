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
        <span>采购入库单审批</span>
      </el-col>
      <el-col :span="19" style="text-align: right;">
        <el-button size="mini" type="danger" icon="el-icon-circle-close"
                   @click="dataGridDoAction('unapproved')" v-if="row.approveState === approveState.PENDING">驳 回</el-button>
        <el-button size="mini" type="success" icon="el-icon-circle-check"
                   @click="dataGridDoAction('approved')" v-if="row.approveState === approveState.PENDING">通 过</el-button>
        <el-button size="mini" type="default" icon="el-icon-printer" @click="printPurchaseAddBill">打 印</el-button>
        <el-button size="mini" type="warning" icon="el-icon-right" @click="dialogClose">返 回</el-button>
      </el-col>
    </el-row>

    <!-- 数据表 -->
    <el-table
      :height="$store.getters.dialogDataGridHeight"
      :data="dataGrid.data"
      highlight-current-row
      size="mini">
      <el-table-column fixed="left" type="index" width="50"/>
      <el-table-column prop="gsmGoodsTypeName" label="商品类型" width="110"/>
      <el-table-column prop="gsmGoodsOid" label="编码" width="100"/>
      <el-table-column prop="gsmGoodsName" label="名称" width="200" show-overflow-tooltip sortable/>
      <el-table-column prop="goodsUnitsName" label="单位" width="90"/>
      <el-table-column prop="gsmGoodsSpecs" label="规格" width="130" show-overflow-tooltip/>
      <el-table-column prop="quantity" label="入库数量" width="80"/>
      <el-table-column prop="costPrice" label="入库单价" width="80"/>
      <el-table-column prop="ph" label="批号" width="120" show-overflow-tooltip/>
      <el-table-column prop="producedDate" label="生产日期" width="100"/>
      <el-table-column prop="expiryDate" label="有效期至" width="100"/>
      <el-table-column prop="originName" label="产地" width="120" show-overflow-tooltip sortable/>
      <el-table-column prop="manufacturerName" label="生产厂家" min-width="250" show-overflow-tooltip sortable/>
    </el-table>

    <!-- 打印组件 -->
    <PurchaseAddBill :data="dataGrid.data" ref="PurchaseAddBill"/>

  </el-dialog>
</template>

<script>
import PurchaseAddBill from '../../print_page/PurchaseAddBill'
import jwtDecode from 'jwt-decode'
export default {
  components: {
    PurchaseAddBill
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
      payload: jwtDecode(this.$store.getters.token),
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
        this.$message.error('载入入库单明细失败')
        return false
      }

      this.$loading()
      const url = `/chisAPI/inventoryAdd/getByLsh`
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
        const url = `/chisAPI/inventoryAdd/${action}`
        let method = 'PUT'
        let params = {
          lsh: this.row.lsh
        }
        this.$http({method, url, params}).then((res) => {
          if (res.data.code === 200) {
            this.$message.success(res.data.msg)
            this.dialogClose()
            this.dataGridLoadData()
            // 如果为通过操作则执行对应的操作
            /*
            if (action === 'approved') {
              this.afterApproved()
            }
            */
          } else {
            this.$loading().close()
          }
        })
      }).catch(() => {})
    },

    /**
     * 审核通过后执行的操作
     */
    afterApproved () {
      // 将当前所有数据变为通过状态
      this.dataGrid.data.forEach(item => {
        item.approveState = this.approveState.APPROVED
        item.approverId = this.payload.userId
        item.approverName = this.payload.userName
      })

      // 执行打印
      this.printPurchaseAddBill()
    },

    /**
     * 打印采购入库单
     */
    printPurchaseAddBill () {
      // 如果单据为非审核通过状态则终止
      if (this.dataGrid.data[0].approveState !== this.approveState.APPROVED) {
        this.$message.error('单据审核通过后方可进行打印')
        return
      }

      // 获取权限打印
      this.$loading()
      const url = '/chisAPI/inventoryAdd/printPurchaseAddBill'
      this.$http.get(url).then((res) => {
        if (res.data.code === 200) {
          this.$refs.PurchaseAddBill.printPage()
        }
        this.$loading().close()
      })
    }

  } // end methods
}
</script>

<style scoped>
</style>
