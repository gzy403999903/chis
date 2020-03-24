<template>
  <!-- append-to-body 防止遮罩层在界面上边 -->
  <el-dialog
    class="fullscreen-dialog"
    fullscreen
    append-to-body
    :show-close="false"
    :close-on-click-modal="false"
    :visible="visible"
    @opened="dialogOpened"
    @closed="dialogClosed">

    <!-- 模态框标题栏与功能按钮 -->
    <el-row slot="title">
      <el-col :span="5" style="font-size: 20px;">
        <span>领用明细</span>
      </el-col>
      <el-col :span="19" style="text-align: right;">
        <el-button size="mini" type="danger" icon="el-icon-circle-close"
                   @click="executeAction('unapproved')" v-if="row.approveState === approveState.PENDING">驳 回</el-button>
        <el-button size="mini" type="success" icon="el-icon-circle-check"
                   @click="executeAction('approved')" v-if="row.approveState === approveState.PENDING">通 过</el-button>
        <el-button size="mini" type="warning" icon="el-icon-right" @click="dialogClose">返 回</el-button>
      </el-col>
    </el-row>

    <!--数据表-->
    <el-card
      shadow="never"
      body-style="padding: 0;">
      <el-table
        :height="$store.getters.dialogDataGridHeight"
        :data="dataGrid.data"
        stripe
        size="mini">
        <el-table-column fixed="left" type="index" width="50"/>
        <el-table-column prop="creationDate" label="单据日期" width="160" show-overflow-tooltip/>
        <el-table-column prop="lsh" label="流水号" width="230" show-overflow-tooltip/>
        <el-table-column prop="gsmGoodsTypeName" label="商品类型" width="110" show-overflow-tooltip/>
        <el-table-column prop="gsmGoodsOid" label="商品编码" width="100" show-overflow-tooltip/>
        <el-table-column prop="gsmGoodsName" label="名称" width="150" show-overflow-tooltip/>
        <el-table-column prop="gsmGoodsSpecs" label="规格" width="150" show-overflow-tooltip/>
        <el-table-column prop="goodsUnitsName" label="单位" width="80" show-overflow-tooltip/>
        <el-table-column prop="quantity" label="出库数量" width="80" show-overflow-tooltip/>
        <el-table-column prop="ph" label="批号" width="150" show-overflow-tooltip/>
        <el-table-column prop="expiryDate" label="有效期至" width="100" show-overflow-tooltip/>
        <el-table-column prop="originName" label="产地" width="100" show-overflow-tooltip/>
        <el-table-column prop="manufacturerName" label="生产厂家" width="250" show-overflow-tooltip/>
        <el-table-column prop="notes" label="备注" min-width="200" show-overflow-tooltip/>
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
  }, // end data

  methods: {
    /**
     * 界面打开后执行的操作
     */
    dialogOpened () {
      if (this.row.lsh) {
        this.loadSelfUsedRecord()
      } else {
        this.$message.error('获取流水号失败')
      }
    },

    /**
     * 界面关闭后执行的操作
     */
    dialogClosed () {
      this.dataGrid.data = []
    },

    /**
     * 载入领用记录
     */
    loadSelfUsedRecord () {
      this.$loading()
      const url = `/chisAPI/lossRecord/getByLsh`
      let params = {
        lsh: this.row.lsh
      }

      this.$http.get(url, {params}).then((res) => {
        if (res.data.code === 200) {
          this.dataGrid.data = res.data.resultSet.list
        } else {
          this.$message.error('获取领用明细失败')
        }
        this.$loading().close()
      })
    },

    /**
     * 执行对应操作
     * @param action
     */
    executeAction (action) {
      this.$confirm('确认执行该操作吗?', '提示', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', showClose: false
      }).then(() => {
        this.$loading()
        const url = `/chisAPI/lossRecord/${action}`
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
    }

  } // end methods
}
</script>

<style scoped>
</style>
