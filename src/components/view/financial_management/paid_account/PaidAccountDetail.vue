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
    }
  },

  data () {
    return {
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
      let url = `/chisAPI/paidAccount/getByLsh`
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
    }

  } // end methods
}
</script>

<style scoped>
</style>
