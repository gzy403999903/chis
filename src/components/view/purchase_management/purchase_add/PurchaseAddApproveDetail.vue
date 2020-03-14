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
        } else {
          this.$message.error(res.data.msg)
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
