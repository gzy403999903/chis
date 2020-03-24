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
        <span>报损申请单</span>
        <span style="font-size: 13px; padding-left: 20px;">提示: 只能从退货库报损</span>
      </el-col>
      <el-col :span="19" style="text-align: right;">
        <el-button size="mini" icon="el-icon-remove-outline" @click="deleteAllRow">清 空</el-button>
        <el-button size="mini" icon="el-icon-circle-plus-outline" @click="insertRow">插入一行</el-button>
        <el-button size="mini" type="primary" icon="el-icon-check" @click="submitData">提 交</el-button>
        <el-button size="mini" type="warning" icon="el-icon-right" @click="dialogCloseConfirm">返 回</el-button>
      </el-col>
    </el-row>

    <!--数据表-->
    <el-card
      shadow="never"
      body-style="padding: 0;">
      <el-table
        :height="$store.getters.dialogDataGridHeight"
        :data="dataGrid.data"
        :row-class-name="tableRowClassName"
        @row-dblclick="editRow"
        size="mini">
        <el-table-column fixed="left" type="index" width="50"/>
        <el-table-column fixed="left" label="操作" align="center" width="60">
          <template slot-scope="scope">
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteRow(scope.row)"/>
          </template>
        </el-table-column>
        <el-table-column fixed="left" prop="gsmGoodsOid" label="药品编码" width="100" show-overflow-tooltip/>
        <el-table-column fixed="left" label="药品名称" width="200" show-overflow-tooltip>
          <template slot-scope="props">
            <el-select
              v-show="props.row.editable"
              :ref="'id' + props.$index"
              v-model.trim="props.row.id"
              placeholder="输入 商品名称 / 助记码"
              :remote-method="queryInventory"
              :loading="selectData.loading"
              remote
              @keyup.enter.native="validateToNextFocus('id','quantity' + props.$index)"
              @change="inventorySelected"
              filterable
              default-first-option
              size="small">
              <el-option class="custom-el-option" :value="null"  v-if="selectData.inventories.length > 0" disabled>
                <span class="select-option-top" style="width: 100px;">商品编码</span>
                <span class="select-option-top" style="width: 150px;">名称</span>
                <span class="select-option-top" style="width: 50px;">单位</span>
                <span class="select-option-top" style="width: 150px;">规格</span>
                <span class="select-option-top" style="width: 120px;">批号</span>
                <span class="select-option-top" style="width: 120px;">批次</span>
                <span class="select-option-top" style="width: 100px;">含税进价</span>
                <span class="select-option-top" style="width: 100px;">库存数量</span>
                <span class="select-option-top" style="width: 100px;">有效期至</span>
                <span class="select-option-top" style="width: 100px;">产地</span>
                <span class="select-option-top">生产厂家</span>
              </el-option>
              <el-option class="custom-el-option" v-for="item in selectData.inventories" :key="item.id" :value="item.id" :label="item.gsmGoodsName">
                <span class="select-option-text" style="width: 100px;">{{item.gsmGoodsOid}}</span>
                <span class="select-option-text" style="width: 150px;">{{item.gsmGoodsName}}</span>
                <span class="select-option-text" style="width: 50px;">{{item.goodsUnitsName}}</span>
                <span class="select-option-text" style="width: 150px;">{{item.gsmGoodsSpecs}}</span>
                <span class="select-option-text" style="width: 120px;">{{item.ph}}</span>
                <span class="select-option-text" style="width: 120px;">{{item.pch}}</span>
                <span class="select-option-text" style="width: 100px;">{{item.costPrice}}</span>
                <span class="select-option-text" style="width: 100px;">{{item.quantity}}</span>
                <span class="select-option-text" style="width: 100px;">{{item.expiryDate}}</span>
                <span class="select-option-text" style="width: 100px;">{{item.originName}}</span>
                <span class="select-option-text">{{item.manufacturerName}}</span>
              </el-option>
            </el-select>
            <span v-show="!props.row.editable">{{props.row.gsmGoodsName}}</span>
          </template>
        </el-table-column>
        <el-table-column fixed="left" prop="gsmGoodsSpecs" label="规格" width="150" show-overflow-tooltip/>
        <el-table-column fixed="left" prop="goodsUnitsName" label="单位" width="80" show-overflow-tooltip/>
        <el-table-column fixed="left" prop="quantity" label="报损数量" width="100" show-overflow-tooltip>
          <template slot-scope="props">
            <el-input-number v-model="props.row.quantity" :controls="false" :max="30000" :min="1" :precision="0"
                             size="small" :ref="'quantity' + props.$index" v-show="props.row.editable"
                             @keyup.enter.native="validateToNextFocus('quantity','notes' + props.$index)"/>
            <span v-show="!props.row.editable">{{props.row.quantity}}</span>
          </template>
        </el-table-column>
        <el-table-column fixed="left" prop="notes" label="备注" width="200" show-overflow-tooltip>
          <template slot-scope="props">
            <el-input v-model="props.row.notes" size="small" v-show="props.row.editable"
                             :ref="'notes' + props.$index" @keyup.enter.native="insertRow"/>
            <span v-show="!props.row.editable">{{props.row.notes}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="inventoryQuantity" label="库存数量" width="80" show-overflow-tooltip/>
        <el-table-column prop="ph" label="批号" width="130" show-overflow-tooltip/>
        <el-table-column prop="costPrice" label="含税成本" width="80" show-overflow-tooltip/>
        <el-table-column prop="originName" label="产地" width="100" show-overflow-tooltip/>
        <el-table-column prop="manufacturerName" label="生产厂家" min-width="200" show-overflow-tooltip/>
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
      inventoryType: this.$store.getters.inventoryType, // 仓库ID
      dataGrid: {
        data: [],
        currentRow: {},
        index: 0
      },
      selectData: {
        inventories: [],
        loading: false
      }
    }
  }, // end data

  methods: {
    /**
     * 界面打开后执行的操作
     */
    dialogOpened () {
    },

    /**
     * 界面关闭后执行的操作
     */
    dialogClosed () {
      this.dataGrid.data = []
      this.dataGrid.currentRow = {}
      this.dataGrid.index = 0
      this.selectData.inventories = []
    },

    /**
     * 退出确认
     */
    dialogCloseConfirm () {
      if (this.dataGrid.data.length > 0) {
        this.$confirm('确认要丢弃当前编辑的数据吗?', '提示', {
          confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', showClose: false
        }).then(() => {
          this.dialogClose()
        }).catch(() => {})
      } else {
        this.dialogClose()
      }
    },

    /**
     * 验证当前焦点通过后获取下一个焦点
     */
    validateToNextFocus (currentField, nextRef) {
      if (this.dataGrid.currentRow[currentField]) {
        this.$refs[nextRef].focus()
      }
    },

    /**
     * 为数据表行添加对应样式
     */
    tableRowClassName ({row, rowIndex}) {
      if (this.hasRepeatRow(row)) {
        return 'danger-row'
      }
      if (row.editable) {
        return 'info-row'
      }
      return ''
    },

    /**
     * 验证一行是否有效
     * @row 要进行验证的 row
     * @showMsg 是否显示错误消息, 不传参数显示，传任何参数则不显示
     */
    validateRow (row, showMsg) {
      if (!row.id || !row.quantity) {
        if (showMsg === undefined) {
          this.$message.error('当前行尚未完成编辑, 不能进行其他操作')
        }
        return false
      }
      if (row.inventoryQuantity < row.quantity) {
        if (showMsg === undefined) {
          this.$message.error('当前行库存数量不足')
        }
        return false
      }
      if (row.notes.length > 30) {
        if (showMsg === undefined) {
          this.$message.error('备注长度不能超过30个字符')
        }
        return false
      }
      return true
    },

    /**
     * 验证是否重复录入
     */
    hasRepeatRow (row) {
      let repeatList = this.dataGrid.data.filter(item => {
        return item.id === row.id
      })
      return repeatList.length > 1
    },

    /**
     * 插入一行
     */
    insertRow () {
      if (this.dataGrid.data.length > 50) {
        this.$message.error('录入数据已上限[50]')
        return false
      }

      // 如果当前行无效则不继续执行
      if (this.dataGrid.data.length > 0 && !this.validateRow(this.dataGrid.currentRow)) {
        return
      }
      // 判断是否已经录入
      if (this.hasRepeatRow(this.dataGrid.currentRow)) {
        this.$message.error('当前记录已存在, 不能重复录入')
        return
      }
      // 停止编辑当前行
      if (this.dataGrid.data.length > 0) {
        this.dataGrid.currentRow.editable = false
      }

      // 初始化一行数据
      let row = {}
      row.index = ++this.dataGrid.index // 行ID 仅作为唯一标识
      row.editable = true // 该行是否可编辑
      row.gsmGoodsId = '' // 商品ID
      row.gsmGoodsOid = '' // 商品OID
      row.gsmGoodsName = '' // 商品名称
      row.gsmGoodsSpecs = '' // 商品规格
      row.retailPrice = '' // 零售价
      row.goodsUnitsName = '' // 销售单位
      row.originName = '' // 产地
      row.manufacturerName = '' // 生产厂家
      row.id = '' // 库存ID
      row.ph = '' // 批号
      row.pch = '' // 批次号
      row.splitQuantity = 1 // 拆分系数
      row.inventoryQuantity = '' // 库存数量
      row.quantity = '' // 出库数量
      row.costPrice = '' // 成本价
      row.averageCostPrice = '' // 平均成本价
      row.purchaseTaxRate = '' // 进货税率
      row.sellTaxRate = '' // 销售税率
      row.producedDate = '' // 生产日期
      row.expiryDate = '' // 有效期至
      row.pemSupplierId = '' // 供应商ID
      row.iymInventoryAddId = '' // 入库ID
      row.notes = '' // 备注

      // 将新建行指向当前行
      this.dataGrid.currentRow = row
      // 插入数据
      this.dataGrid.data.push(this.dataGrid.currentRow)
      // 延迟处理
      setTimeout(() => {
        // 清空已经查询的数据
        this.selectData.inventories = []
        // 下一行获取焦点
        this.$refs['id' + (this.dataGrid.data.length - 1)].focus()
      }, 100)
    },

    /**
     * 检索库存
     * 做一个0.5秒的延迟查询, 避免用户输入速度过慢时的频发查询
     * 查询结果不为 0 时, 才会有 0.5 秒的延迟查询
     * @param name
     */
    queryInventory (name) {
      if (name.trim()) {
        this.selectData.loading = true
        setTimeout(() => {
          const url = `/chisAPI/inventory/getClinicPchEnabledLikeByCriteria`
          let params = {
            iymInventoryTypeId: this.inventoryType.SUBTRACT_INVENTORY,
            gsmGoodsName: name
          }
          this.$http.get(url, {params}).then((res) => {
            this.selectData.inventories = res.data
            this.selectData.loading = false
          })
        }, (this.selectData.inventories ? 0 : 500))
      }
    },

    /**
     * 选中库存后执行的操作
     */
    inventorySelected (id) {
      const inventory = this.selectData.inventories.find(item => {
        return item.id === id
      })
      this.dataGrid.currentRow.gsmGoodsId = inventory.gsmGoodsId // 商品ID
      this.dataGrid.currentRow.gsmGoodsOid = inventory.gsmGoodsOid // 商品OID
      this.dataGrid.currentRow.gsmGoodsName = inventory.gsmGoodsName // 商品名称
      this.dataGrid.currentRow.gsmGoodsSpecs = inventory.gsmGoodsSpecs // 商品规格
      this.dataGrid.currentRow.retailPrice = inventory.retailPrice // 零售价
      this.dataGrid.currentRow.goodsUnitsName = inventory.goodsUnitsName // 销售单位
      this.dataGrid.currentRow.originName = inventory.originName // 产地
      this.dataGrid.currentRow.manufacturerName = inventory.manufacturerName // 生产厂家
      // this.dataGrid.currentRow.id = inventory. // 库存ID [已在编辑时赋值]
      this.dataGrid.currentRow.ph = inventory.ph // 批号
      this.dataGrid.currentRow.pch = inventory.pch // 批次号
      this.dataGrid.currentRow.splitQuantity = inventory.splitQuantity // 拆分系数
      this.dataGrid.currentRow.inventoryQuantity = inventory.quantity // 库存数量
      // this.dataGrid.currentRow.quantity = inventory. // 出库数量 [已在编辑时赋值]
      this.dataGrid.currentRow.costPrice = inventory.costPrice // 成本价
      this.dataGrid.currentRow.averageCostPrice = inventory.averageCostPrice // 平均成本价
      this.dataGrid.currentRow.purchaseTaxRate = inventory.purchaseTaxRate // 进货税率
      this.dataGrid.currentRow.sellTaxRate = inventory.sellTaxRate // 销售税率
      this.dataGrid.currentRow.producedDate = inventory.producedDate // 生产日期
      this.dataGrid.currentRow.expiryDate = inventory.expiryDate // 有效期至
      this.dataGrid.currentRow.pemSupplierId = inventory.pemSupplierId // 供应商ID
      this.dataGrid.currentRow.iymInventoryAddId = inventory.iymInventoryAddId // 入库ID
      // this.dataGrid.currentRow.notes = '' // 备注 [已在编辑时赋值]
    },

    /**
     * 编辑一行
     */
    editRow (row, column, event) {
      // 如果目标行在编辑状态则不继续执行
      if (row.editable) {
        return
      }
      // 如果目标行无未完成编辑则询问是否放弃该行
      if (!this.validateRow(this.dataGrid.currentRow, false)) {
        this.$confirm('当前行尚未完成编辑, 确认要放弃编辑吗?', '提示', {
          confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', showClose: false
        }).then(() => {
          this.deleteRow(this.dataGrid.currentRow) // 删除当前行
          this.dataGrid.currentRow = row // 设置目标为当前行
          this.dataGrid.currentRow.editable = true // 开启编辑
        }).catch(() => {})
      } else {
        this.dataGrid.currentRow.editable = false // 设置当前行不可编辑
        this.dataGrid.currentRow = row // 设置目标行为当前行
        this.dataGrid.currentRow.editable = true // 开启编辑
      }
    },

    /**
     * 删除一行
     * @param row
     */
    deleteRow (row) {
      this.dataGrid.data = this.dataGrid.data.filter(item => {
        return item.index !== row.index
      })
      // 设置当前行
      this.dataGrid.currentRow = this.dataGrid.data[this.dataGrid.data.length - 1]
    },

    /**
     * 删除所有行
     */
    deleteAllRow () {
      if (this.dataGrid.data.length === 0) {
        return
      }
      this.$confirm('确认删除吗?', '提示', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', showClose: false
      }).then(() => {
        this.dataGrid.data = []
      }).catch(() => {})
    },

    /**
     * 验证数据
     */
    validateSubmitData () {
      // 删除空行 并验证所有行是否有效
      for (let i = 0; i < this.dataGrid.data.length; i++) {
        let row = this.dataGrid.data[i]
        // 如果 id 为空则删除该行
        if (!row.id) {
          this.deleteRow(row)
          continue
        }
        // 如果该行无效则终止执行
        if (!this.validateRow(row)) {
          return false
        }
        // 如果该行验证通过则停止编辑状态
        row.editable = false
      }

      // 判断是否有可提交数据
      return this.dataGrid.data.length > 0
    },

    /**
     * 获取提交数据
     */
    getSubmitData () {
      let lossRecordList = []
      this.dataGrid.data.forEach(item => {
        let lossRecord = {}
        lossRecord.iymInventoryId = item.id
        lossRecord.gsmGoodsId = item.gsmGoodsId // 商品ID
        lossRecord.ph = item.ph // 批号
        lossRecord.pch = item.pch // 批次号
        lossRecord.splitQuantity = item.splitQuantity // 拆分系数
        lossRecord.quantity = item.quantity // 出库数量
        lossRecord.costPrice = item.costPrice // 成本价
        lossRecord.averageCostPrice = item.averageCostPrice // 平均成本价
        lossRecord.purchaseTaxRate = item.purchaseTaxRate // 进货税率
        lossRecord.sellTaxRate = item.sellTaxRate // 销售税率
        lossRecord.producedDate = item.producedDate // 生产日期
        lossRecord.expiryDate = item.expiryDate // 有效期至
        lossRecord.pemSupplierId = item.pemSupplierId // 供应商ID
        lossRecord.iymInventoryAddId = item.iymInventoryAddId // 入库ID
        lossRecord.notes = item.notes // 备注

        lossRecordList.push(lossRecord)
      })
      return lossRecordList
    },

    /**
     * 提交数据
     */
    submitData () {
      if (!this.validateSubmitData()) {
        return false
      }

      this.$confirm('确认提交吗?', '提示', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', showClose: false
      }).then(() => {
        // 提交数据
        this.$loading()
        const url = `/chisAPI/lossRecord/saveList`
        let method = 'POST'
        let data = {
          lossRecordListJson: JSON.stringify(this.getSubmitData())
        }

        this.$http({method, url, data}).then((res) => {
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
