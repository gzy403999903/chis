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
        <span>应付明细</span>
      </el-col>
      <el-col :span="19" style="text-align: right;">
        <el-button size="mini" type="primary" icon="el-icon-check" @click="submitData">提交</el-button>
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
        @row-dblclick="editRow"
        size="mini">
        <el-table-column fixed="left" type="index" width="50"/>
        <el-table-column prop="gsmGoodsOid" label="商品编码" width="100" show-overflow-tooltip/>
        <el-table-column prop="gsmGoodsName" label="名称" width="200" show-overflow-tooltip/>
        <el-table-column prop="gsmGoodsSpecs" label="规格" width="150" show-overflow-tooltip/>
        <el-table-column prop="goodsUnitsName" label="单位" width="80" show-overflow-tooltip/>
        <el-table-column prop="ph" label="批号" width="120" show-overflow-tooltip/>
        <el-table-column prop="pch" label="批次号" width="120" show-overflow-tooltip/>
        <el-table-column prop="costPrice" label="含税单价" width="100" show-overflow-tooltip/>
        <el-table-column prop="originName" label="产地" width="100" show-overflow-tooltip/>
        <el-table-column prop="manufacturerName" label="生产厂家" min-width="250" show-overflow-tooltip/>
        <el-table-column fixed="right" prop="quantity" label="进货数量" width="80" show-overflow-tooltip/>
        <el-table-column fixed="right" prop="payableQuantity" label="未付数量" width="80" show-overflow-tooltip/>
        <el-table-column fixed="right" label="本次付款数量" width="120" show-overflow-tooltip>
          <template slot-scope="props">
            <el-input-number v-model="props.row.paidQuantity" :controls="false" :max="Math.abs(props.row.payableQuantity)" :min="0" :precision="0"
                             size="small" :ref="'paidQuantity' + props.$index" v-show="props.row.editable"/>
            <span v-show="!props.row.editable">{{props.row.paidQuantity}}</span>
          </template>
        </el-table-column>
        <el-table-column fixed="right" prop="inventoryQuantity" label="剩余库存" width="80" show-overflow-tooltip/>
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
      dataGrid: {
        data: [],
        currentRow: {}
      }
    }
  },

  methods: {
    /**
     * 界面打开后执行的操作
     */
    dialogOpened () {
      if (this.row.lsh) {
        this.loadInventoryAddList()
      }
    },

    /**
     * 界面关闭后执行的操作
     */
    dialogClosed () {
      this.dataGrid.data = []
      this.dataGrid.currentRow = {}
    },

    /**
     * 载入入库记录
     */
    loadInventoryAddList () {
      this.$loading()
      let url = `/chisAPI/payableAccount/getByLsh`
      let params = {
        lsh: this.row.lsh
      }

      this.$http.get(url, {params}).then((res) => {
        if (res.data.code === 200) {
          // 添加可编辑属性
          res.data.resultSet.list.forEach(item => {
            item.editable = false
            item.paidQuantity = 0
          })
          this.dataGrid.data = res.data.resultSet.list
        }
        this.$loading().close()
      })
    },

    /**
     * 编辑一行
     * @param row
     * @param column
     * @param event
     */
    editRow (row, column, event) {
      // 如果目标行在编辑状态则不继续执行
      if (row.editable) {
        return
      }

      // 获取当前行
      this.dataGrid.currentRow = this.dataGrid.data.find(item => {
        return item.editable === true
      })

      // 如果当前行为空 则设置当前行并开启编辑
      if (!this.dataGrid.currentRow) {
        this.dataGrid.currentRow = row
        row.editable = true
        return
      }

      // 如果当前行未完成编辑则询问是否放弃
      if (parseInt(this.dataGrid.currentRow.paidQuantity).toString() === 'NaN') {
        this.$confirm('当前行尚未完成编辑, 确认要放弃编辑吗?', '提示', {
          confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', showClose: false
        }).then(() => {
          this.dataGrid.currentRow.paidQuantity = 0 // 重置本次付款数量
          this.dataGrid.currentRow.editable = false // 设置当前行不可编辑
          this.dataGrid.currentRow = row // 设置目标行为当前行
          this.dataGrid.currentRow.editable = true // 开启编辑
        }).catch(() => {})
      } else {
        // 如果当前完成编辑则开启下一行
        this.dataGrid.currentRow.editable = false // 设置当前行不可编辑
        this.dataGrid.currentRow = row // 设置目标行为当前行
        this.dataGrid.currentRow.editable = true // 开启编辑
      }
    },

    /**
     * 获取本次付款数量不为 0 的行
     */
    getSubmitData () {
      let paidAccountList = []
      this.dataGrid.data.forEach(item => {
        if (item.paidQuantity > 0) {
          let paidAccount = {}

          paidAccount.flmPayableAccountLsh = this.row.lsh
          paidAccount.gsmGoodsId = item.gsmGoodsId
          paidAccount.ph = item.ph
          paidAccount.pch = item.pch
          paidAccount.costPrice = item.costPrice
          paidAccount.quantity = item.quantity > 0 ? item.paidQuantity : (item.paidQuantity * -1)
          paidAccount.pemSupplierId = item.pemSupplierId
          paidAccount.iymInventoryAddId = item.iymInventoryAddId

          paidAccountList.push(paidAccount)
        }
      })
      return paidAccountList
    },

    /**
     * 提交数据
     */
    submitData () {
      let paidAccountList = this.getSubmitData()
      if (paidAccountList.length === 0) {
        return
      }

      if (parseInt(this.dataGrid.currentRow.paidQuantity).toString() === 'NaN') {
        this.$message.error('当前行未完成编辑, 不能进行提交')
        return
      } else {
        this.dataGrid.currentRow.editable = false // 设置当前行不可编辑
      }

      this.$confirm('确认提交吗?', '提示', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', showClose: false
      }).then(() => {
        // 提交数据
        this.$loading()
        const url = '/chisAPI/paidAccount/save'
        let method = 'POST'
        let data = {
          paidAccountListJson: JSON.stringify(paidAccountList)
        }

        this.$http({method, url, data}).then((res) => {
          if (res.data.code === 200) {
            this.$message.success(res.data.msg)
            this.dataGridLoadData()
            this.dialogClose()
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
