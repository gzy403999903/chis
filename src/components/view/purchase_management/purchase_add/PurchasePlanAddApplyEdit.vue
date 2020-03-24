<template>
  <div>
    <!-- 入库单明细界面 -->
    <el-dialog
      class="fullscreen-dialog"
      fullscreen
      append-to-body
      :show-close="false"
      :close-on-click-modal="false"
      :visible="visible">

      <!-- 模态框标题栏与功能按钮-->
      <el-row slot="title">
        <el-col :span="5" style="font-size: 20px;">
          <span>计划入库单</span>
        </el-col>
        <el-col :span="19" style="text-align: right;">
          <el-button size="mini" type="default" icon="el-icon-plus" @click="orderDialogOpen">载入订单</el-button>
          <el-button size="mini" type="primary" icon="el-icon-check" @click="dataGridSubmit">提 交</el-button>
          <el-button size="mini" type="warning" icon="el-icon-right" @click="dialogCloseConfirm">返 回</el-button>
        </el-col>
      </el-row>

      <!-- 数据表 -->
      <el-table
        :height="$store.getters.dialogDataGridHeight"
        ref="purchaseAddIneventoryTable"
        :data="dataGrid.data"
        highlight-current-row
        @row-click="dataGridSelectRow"
        @row-dblclick="dataGridDblclick"
        :row-class-name="dataGridRowClassName"
        size="mini">
        <el-table-column fixed="left" type="index" width="40"/>
        <el-table-column fixed="left" label="操作" align="center" width="200">
          <template slot-scope="scope">
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="dataGridDeleteRow(scope.$index, scope.row)"/>
            <el-button size="mini" type="default" @click="dataGridSplitRow(scope.$index, scope.row)" :disabled="scope.row.purchaseQuantity <= 1">拆分</el-button>
            <el-button size="mini" type="default" @click="editDialogOpen">编 辑</el-button>
          </template>
        </el-table-column>
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-form label-position="left">
              <el-row>
                <el-col :span="3">
                  <el-form-item label="入库仓库">
                    <span>{{ getInventoryTypeName(props.row.iymInventoryTypeId) }}</span>
                  </el-form-item>
                </el-col>
                <el-col :span="3">
                  <el-form-item label="入库数量">
                    <span>{{ props.row.quantity }}</span>
                  </el-form-item>
                </el-col>
                <el-col :span="3">
                  <el-form-item label="入库单价">
                    <span>{{ props.row.costPrice }}</span>
                  </el-form-item>
                </el-col>
                <el-col :span="3">
                  <el-form-item label="批号">
                    <span>{{ props.row.ph }}</span>
                  </el-form-item>
                </el-col>
                <el-col :span="3">
                  <el-form-item label="生产日期">
                    <span>{{ props.row.producedDate }}</span>
                  </el-form-item>
                </el-col>
                <el-col :span="3">
                  <el-form-item label="有效期至">
                    <span>{{ props.row.expiryDate }}</span>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="备注">
                    <span>{{ props.row.notes }}</span>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column prop="gsmGoodsTypeName" label="商品类型" width="120"/>
        <el-table-column prop="gsmGoodsOid" label="编码" width="100" show-overflow-tooltip/>
        <el-table-column prop="gsmGoodsName" label="名称" width="180" show-overflow-tooltip sortable/>
        <el-table-column prop="goodsUnitsName" label="单位" width="90"/>
        <el-table-column prop="gsmGoodsSpecs" label="规格" width="150" show-overflow-tooltip/>
        <el-table-column prop="purchaseQuantity" label="采购数量" width="100"/>
        <el-table-column prop="purchasePrice" label="采购单价" width="100"/>
        <el-table-column prop="originName" label="产地" width="120" show-overflow-tooltip sortable/>
        <el-table-column prop="manufacturerName" label="生产厂家" min-width="250" show-overflow-tooltip sortable/>
      </el-table>
    </el-dialog>

    <!-- *********************************************************************************************************** -->
    <!-- 订单界面 -->
    <el-dialog
      class="fullscreen-dialog"
      width="80%"
      :show-close="false"
      :close-on-click-modal="false"
      :visible="dialog.orderVisible">

      <!-- 模态框标题栏与功能按钮-->
      <el-row slot="title">
        <el-col :span="5" style="font-size: 20px;">
          <span>未入库订单</span>
        </el-col>
        <el-col :span="19" style="text-align: right;">
          <el-button size="mini" type="warning" icon="el-icon-right" @click="orderDialogClose">返 回</el-button>
        </el-col>
      </el-row>

      <!-- 未入库订单数据表 -->
      <el-table
        height="50vh"
        :data="dataGrid.orderData"
        @row-dblclick="orderDataGridDblclick"
        size="mini">
        <el-table-column fixed="left" type="index" width="40"/>
        <el-table-column fixed="left" label="操作" align="center" width="80">
          <template slot-scope="scope">
            <el-button size="mini" @click="loadOrderByLsh(scope.row.lsh)">载入</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="creationDate" label="订单日期" width="110"/>
        <el-table-column prop="lsh" label="流水号" width="220"/>
        <el-table-column prop="pemSupplierName" label="供应商名称" width="300" show-overflow-tooltip sortable/>
        <el-table-column prop="totalPurchasePrice" label="采购总额" width="110" sortable/>
        <el-table-column prop="creatorName" label="采购人" width="110" sortable/>
        <el-table-column prop="sysClinicName" label="配送机构" show-overflow-tooltip/>
      </el-table>
    </el-dialog>

    <!-- *********************************************************************************************************** -->
    <!-- 编辑界面 -->
    <el-dialog
      title="入库信息"
      width="80%"
      :show-close="false"
      :close-on-click-modal="false"
      :visible="dialog.editVisible"
      @opened="editDialogOpened">

      <!-- 编辑表单 -->
      <el-form :model="editForm" ref="editForm" :rules="editFormRules" size="small" label-width="100px">
        <el-row>
          <el-col :span="5">
            <el-form-item label="入库仓库" prop="iymInventoryTypeId">
              <el-select
                ref="iymInventoryTypeId"
                v-model.trim="editForm.iymInventoryTypeId"
                @keyup.enter.native="editFormValidateToNextFocus('iymInventoryTypeId', 'quantity')"
                filterable
                default-first-option
                placeholder="请选择">
                <el-option label="药品库" :value="inventoryType.WESTERN_DRUGS_INVENTORY"/>
                <el-option label="药材库" :value="inventoryType.CHINESE_DRUGS_INVENTORY"/>
                <el-option label="物资库" :value="inventoryType.HYGIENIC_MATERIAL_INVENTORY"/>
                <el-option label="退货库" :value="inventoryType.SUBTRACT_INVENTORY"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="采购数量" prop="purchaseQuantity">
              {{dataGrid.row.purchaseQuantity}}
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="入库数量" prop="quantity">
              <el-input-number size="mini" v-model.trim="editForm.quantity" :controls="false" :max="dataGrid.row.purchaseQuantity * 1" :min="1" :precision="0"
                               ref="quantity" @keyup.enter.native="editFormValidateToNextFocus('quantity', 'costPrice')"/>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="采购单价" prop="purchasePrice">
              {{dataGrid.row.purchasePrice}} &nbsp;&nbsp;元
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="入库单价" prop="costPrice">
              <el-input-number size="mini" v-model.trim="editForm.costPrice" :controls="false" :max="dataGrid.row.purchasePrice * 1" :min="0" :precision="4"
                               ref="costPrice" @keyup.enter.native="editFormValidateToNextFocus('costPrice', 'ph')" style="width: 70%;"/>&nbsp;&nbsp;元
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="9">
            <el-form-item label="生产批号" prop="ph">
              <el-input v-model.trim="editForm.ph" ref="ph" @keyup.enter.native="editFormValidateToNextFocus('ph', 'producedDate')"/>
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="生产日期" prop="producedDate">
              <el-date-picker
                ref="producedDate"
                @change="editFormValidateToNextFocus('producedDate', 'expiryDate')"
                v-model="editForm.producedDate"
                type="date"
                placeholder="选择日期"
                :picker-options="pickerOptionsBefore"
                value-format="yyyy-MM-dd"
                style="width: 100%;"/>
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="有效期至" prop="expiryDate">
              <el-date-picker
                ref="expiryDate"
                @change="editFormValidateToNextFocus('expiryDate', 'notes')"
                v-model="editForm.expiryDate"
                type="date"
                placeholder="选择日期"
                :picker-options="pickerOptionsAfter"
                value-format="yyyy-MM-dd"
                style="width: 100%;"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="16">
            <el-form-item label="备注" prop="notes">
              <el-input v-model.trim="editForm.notes" ref="notes" @keydown.enter.native="editFormUpdateRow"/>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span style="color: #F56C6C;">注意: 当入库单价大于采购单价时, 系统会自动重置入库单价为采购单价</span>
      <span slot="footer">
        <el-button type="default" size="small" round icon="el-icon-close" @click="editDialogClose">取 消</el-button>
        <el-button type="primary" size="small" round icon="el-icon-check" @click="editFormUpdateRow">更新一行</el-button>
      </span>
    </el-dialog>
  </div>
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
      inventoryType: this.$store.getters.inventoryType, // 仓库类型
      pickerOptionsBefore: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        }
      },
      pickerOptionsAfter: {
        disabledDate (time) {
          return time.getTime() < Date.now()
        }
      },
      dataGrid: {
        data: [],
        row: {},
        orderData: []
      },
      editForm: {
        iymInventoryTypeId: '', // 仓库ID
        quantity: 0, // 入库数量
        costPrice: 0,
        ph: '',
        producedDate: '',
        expiryDate: '',
        billNo: '',
        notes: ''
      },
      editFormRules: {
        iymInventoryTypeId: [
          {required: true, message: '不能为空'}
        ],
        quantity: [
          {required: true, message: '不能为空'}
        ],
        costPrice: [
          {required: true, message: '不能为空'}
        ],
        ph: [
          {required: true, message: '不能为空'},
          {max: 30, message: '长度不合法[1-30]'}
        ],
        producedDate: [
          {required: true, message: '不能为空'}
        ],
        expiryDate: [
          {required: true, message: '不能为空'}
        ],
        notes: [
          {max: 50, message: '长度不合法[1-50]'}
        ]
      },
      dialog: {
        orderVisible: false,
        editVisible: false
      }
    }
  }, // end data

  methods: {
    /**
     * 关闭订单界面
     */
    orderDialogClose () {
      this.dialog.orderVisible = false
      this.dataGrid.orderData = []
    },

    /**
     * 打开订单界面并载入为入库的订单汇总记录
     */
    orderDialogOpen () {
      this.$loading()
      const url = `/chisAPI/purchaseOrder/getClinicLshGroupListByInventoryState`
      this.$http.get(url).then((res) => {
        // 载入数据并打开界面
        this.dataGrid.orderData = res.data
        this.dialog.orderVisible = true
        this.$loading().close()
      })
    },

    /**
     * 根据流水号载入订单明细
     * @param lsh
     */
    loadOrderByLsh (lsh) {
      this.$loading()
      const url = `/chisAPI/purchaseOrder/getClinicListByLsh`
      let params = {lsh}
      this.$http.get(url, {params}).then((res) => {
        if (res.data.code === 200) {
          // 添加入库数量、入库单价默认与采购数量和采购单价一致
          res.data.resultSet.list.forEach((item) => {
            item.quantity = item.purchaseQuantity
            item.costPrice = item.purchasePrice
          })
          // 载入数据并关闭界面
          this.dataGrid.data = res.data.resultSet.list
          this.orderDialogClose()
        }
        this.$loading().close()
      })
    },

    /**
     * 双击一行载入对应的订单明细
     */
    orderDataGridDblclick (row, column, event) {
      this.loadOrderByLsh(row.lsh)
    },

    /* -------------------------------------------------------------------------------------------------------------- */
    /**
     * 关闭采购入库单界面
     */
    dialogCloseConfirm () {
      if (this.dataGrid.data.length > 0) {
        this.$confirm('该操作会清空列表中的内容, 确认这样做吗?', '提示', {
          confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', showClose: false
        }).then(() => {
          this.dialogClose()
          this.dataGrid.data = []
        }).catch(() => {})
      } else {
        this.dialogClose()
      }
    },

    /**
     * 选中一行
     */
    dataGridSelectRow (row, column, event) {
      // 获取选中行
      this.dataGrid.row = row
    },

    /**
     * 拆分一行
     */
    dataGridSplitRow (index, row) {
      this.$prompt('', '请输入拆分数量', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        closeOnClickModal: false,
        showClose: false,
        inputType: 'text',
        inputValidator: this.dataGridSplitRowValidator,
        inputErrorMessage: ''
      }).then(({ value }) => {
        let copyRow = {}
        for (let key in row) {
          copyRow[key] = row[key]
        }
        // 更新当前行
        row.purchaseQuantity = row.purchaseQuantity - value
        this.dataGrid.row = row
        // 插入拆分行
        copyRow.iymInventoryTypeId = ''
        copyRow.purchaseQuantity = value
        copyRow.quantity = value
        copyRow.ph = ''
        copyRow.producedDate = ''
        copyRow.expiryDate = ''
        copyRow.notes = ''
        this.dataGrid.data.splice((index + 1), 0, copyRow)
      }).catch(() => {})
    },

    /**
     * 拆分数量验证
     */
    dataGridSplitRowValidator (value) {
      if (parseInt(value).toString() === 'NaN') {
        return '拆分数量必须是一个正整数'
      }

      if (value <= 0) {
        return '拆分数量必须大于0'
      }

      let row = this.dataGrid.row
      if (this.dataGridValidateRow(row) && ((row.purchaseQuantity - value) < row.quantity)) {
        return '剩余采购数量不能小于入库数量' + row.quantity
      }
      if (value > (row.purchaseQuantity - 1)) {
        return '拆分数量不能大于' + (row.purchaseQuantity - 1)
      }
    },

    /**
     * 删除一行
     */
    dataGridDeleteRow (index, row) {
      // 如果该行有拆分行, 则选中一行进行数量还原
      for (let i = 0; i < this.dataGrid.data.length; i++) {
        let inventory = this.dataGrid.data[i]
        if (i !== index && inventory.gsmGoodsId === row.gsmGoodsId) {
          inventory.quantity = inventory.purchaseQuantity = inventory.purchaseQuantity * 1 + row.purchaseQuantity * 1
          break
        }
      }
      // 删除该行
      this.dataGrid.data.splice(index, 1)
      setTimeout(() => {
        // 更新当前行
        this.dataGrid.row = {}
      }, 50)
    },

    /**
     * 双击一行显示编辑界面
     */
    dataGridDblclick (row, column, event) {
      this.editDialogOpen()
    },

    /**
     * 获取仓库名称
     */
    getInventoryTypeName (id) {
      switch (id) {
        case this.inventoryType.WESTERN_DRUGS_INVENTORY: return '药品库'
        case this.inventoryType.CHINESE_DRUGS_INVENTORY: return '药材库'
        case this.inventoryType.HYGIENIC_MATERIAL_INVENTORY: return '物资库'
        case this.inventoryType.SUBTRACT_INVENTORY: return '退货库'
        default: return '未知'
      }
    },

    /**
     * 数据行入库信息编辑完整则改变该行的颜色
     */
    dataGridRowClassName ({row, rowIndex}) {
      if (this.dataGridValidateRow(row)) {
        return 'success-row'
      }
      return ''
    },

    /**
     * 验证一行是否有效
     */
    dataGridValidateRow (row) {
      return row.iymInventoryTypeId && row.quantity && row.costPrice && row.ph && row.producedDate && row.expiryDate
    },

    /**
     * 提交入库数据
     */
    dataGridSubmit () {
      if (this.dataGrid.data.length === 0) {
        return false
      }

      if (!this.dataGrid.data.every(row => this.dataGridValidateRow(row))) {
        this.$message.error('有商品未填写入库信息, 不能进行提交操作')
        return false
      }

      this.$loading()
      const url = '/chisAPI/inventoryAdd/save'
      let method = 'POST'
      let data = {
        inventoryAddJson: this.dataGridGetSubmitJson(),
        orderLsh: this.dataGrid.data[0].lsh
      }
      this.$http({method, url, data}).then((res) => {
        if (res.data.code === 200) {
          this.$message.success(res.data.msg)
          this.dataGrid.data = []
          this.dialogClose()
          this.dataGridLoadData()
        } else {
          this.$loading().close()
        }
      })
    },

    /**
     * 获得提交数据的 JSON
     */
    dataGridGetSubmitJson () {
      let inventoryArray = []
      for (let i = 0; i < this.dataGrid.data.length; i++) {
        let row = this.dataGrid.data[i]
        let inventory = {}

        inventory.pemPurchaseOrderId = row.id // 订单ID
        inventory.gsmGoodsId = row.gsmGoodsId // 商品ID
        inventory.quantity = row.quantity // 入库数量
        inventory.costPrice = row.costPrice // 入库单价
        inventory.purchaseTaxRate = row.purchaseTaxRate // 进货税率
        inventory.sellTaxRate = row.sellTaxRate // 销售税率
        inventory.ph = row.ph // 批号
        inventory.producedDate = row.producedDate // 生产日期
        inventory.expiryDate = row.expiryDate // 有效期至
        inventory.iymInventoryTypeId = row.iymInventoryTypeId // 入库仓库
        inventory.notes = row.notes // 备注
        inventory.pemSupplierId = row.pemSupplierId // 供应商ID

        inventoryArray.push(inventory)
      }

      return JSON.stringify(inventoryArray)
    },

    /* -------------------------------------------------------------------------------------------------------------- */
    /**
     * 关闭编辑界面
     */
    editDialogClose () {
      this.dialog.editVisible = false
      this.$refs.editForm.resetFields()
    },

    /**
     * 显示编辑界面
     */
    editDialogOpen () {
      // 显示编辑界面
      this.dialog.editVisible = true
    },

    /**
     * 显示编辑界面后填充编辑信息
     */
    editDialogOpened () {
      let row = this.dataGrid.row
      // 填充编辑信息
      if (row.iymInventoryTypeId) {
        this.editForm.iymInventoryTypeId = row.iymInventoryTypeId
      }
      if (row.quantity) {
        this.editForm.quantity = row.quantity
      }
      if (row.costPrice) {
        this.editForm.costPrice = row.costPrice
      }
      if (row.ph) {
        this.editForm.ph = row.ph
      }
      if (row.producedDate) {
        this.editForm.producedDate = row.producedDate
      }
      if (row.expiryDate) {
        this.editForm.expiryDate = row.expiryDate
      }
      if (row.notes) {
        this.editForm.notes = row.notes
      }
      // 获取默认焦点
      // this.$refs.iymInventoryTypeId.focus()
    },

    /**
     * 验证通过后获取下一个焦点
     */
    editFormValidateToNextFocus (currentProp, nextRef) {
      this.$refs.editForm.validateField(currentProp, (valid) => {
        if (!valid) {
          this.$refs[nextRef].focus()
        } else {
          return false
        }
      })
    },

    /**
     * 是否有重复行
     */
    hasRepeatRow (gsmGoodsId, ph) {
      let repeatArray = this.dataGrid.data.filter(item => {
        return item.gsmGoodsId === gsmGoodsId && item.ph === ph
      })

      return repeatArray.length > 0
    },

    /**
     * 更新一行
     */
    editFormUpdateRow () {
      this.$refs.editForm.validate((valid) => {
        if (valid) {
          let row = this.dataGrid.row

          if (this.hasRepeatRow(row.gsmGoodsId, this.editForm.ph)) {
            this.$message.error('该批号已存在, 不能重复录入')
            return false
          }

          // 判断批准文号是否过期
          let date1 = new Date(this.editForm.producedDate)
          let date2 = new Date(row.approvalNumExpiryDate)

          if (date1 > date2) {
            this.$message.error('批准文号已过期')
            return
          }

          // 更新编辑信息
          row.iymInventoryTypeId = this.editForm.iymInventoryTypeId
          row.quantity = this.editForm.quantity
          row.costPrice = this.editForm.costPrice
          row.ph = this.editForm.ph
          row.producedDate = this.editForm.producedDate
          row.expiryDate = this.editForm.expiryDate
          row.notes = this.editForm.notes
          // 关闭编辑界面
          this.editDialogClose()
          // 清空当前行
          this.dataGrid.row = {}
          // 当前行取消高亮
          this.$refs.purchaseAddIneventoryTable.setCurrentRow({})
        } else {
          return false
        }
      })
    }

  } // end methods
}
</script>

<style scoped>
</style>
