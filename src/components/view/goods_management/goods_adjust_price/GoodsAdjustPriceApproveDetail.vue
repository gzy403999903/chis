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
        <span>收费项目调价明细</span>
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
        <el-table-column prop="creationDate" label="单据日期" width="100" show-overflow-tooltip/>
        <el-table-column prop="lsh" label="流水号" width="220" show-overflow-tooltip/>
        <el-table-column prop="gsmGoodsTypeName" label="商品类型" width="100" show-overflow-tooltip/>
        <el-table-column prop="gsmGoodsOid" label="商品编码" width="100" show-overflow-tooltip/>
        <el-table-column prop="gsmGoodsName" label="商品名称" width="200" show-overflow-tooltip/>
        <el-table-column prop="gsmGoodsSpecs" label="规格" width="130" show-overflow-tooltip/>
        <el-table-column prop="goodsUnitsName" label="销售单位" width="80" show-overflow-tooltip/>
        <el-table-column prop="originalRetailPrice" label="原零售价" width="80" show-overflow-tooltip/>
        <el-table-column prop="newRetailPrice" label="新零售价" width="80" show-overflow-tooltip/>
        <el-table-column prop="originalSplitPrice" label="原拆零价" width="80" show-overflow-tooltip/>
        <el-table-column prop="newSplitPrice" label="新拆零价" width="80" show-overflow-tooltip/>
        <el-table-column label="可拆零" width="80" show-overflow-tooltip>
          <template slot-scope="props">
            {{props.row.splitable ? '是' : '否'}}
          </template>
        </el-table-column>
        <el-table-column prop="originName" label="产地" width="100" show-overflow-tooltip/>
        <el-table-column prop="manufacturerName" label="生产厂家" width="250" show-overflow-tooltip/>
        <el-table-column prop="explains" label="调价说明" min-width="250" show-overflow-tooltip/>
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
      const url = `/chisAPI/goodsAdjustPrice/getByLsh`
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
     * 执行对应操作
     * @param action
     */
    executeAction (action) {
      this.$confirm('确认执行该操作吗?', '提示', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', showClose: false
      }).then(() => {
        this.$loading()
        const url = `/chisAPI/goodsAdjustPrice/${action}`
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
