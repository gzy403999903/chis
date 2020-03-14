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
        <span>采购退货单</span>
      </el-col>
      <el-col :span="19" style="text-align: right;">
        <el-button size="mini" icon="el-icon-remove-outline" @click="dataGrid.data = []">清 空</el-button>
        <el-button size="mini" icon="el-icon-circle-plus-outline" @click="dataGridInsertRow">插入一行</el-button>
        <el-button size="mini" type="primary" icon="el-icon-check" @click="dataGridSubmit">提 交</el-button>
        <el-button size="mini" type="warning" icon="el-icon-right" @click="dialogCloseConfirm">返 回</el-button>
      </el-col>
    </el-row>

    <!-- 退货编辑表单 -->
    <el-card style="background-color: #f5f9f9;">
      <el-form :model="editForm" ref="editForm" :rules="editFormRules" size="small" label-width="100px">
        <el-row >
          <el-col :span="6">
            <el-form-item label="供应商名称" prop="pemSupplierId">
              <el-select
                ref="pemSupplierId"
                :disabled="dataGrid.data.length > 0"
                v-model.trim="editForm.pemSupplierId"
                placeholder="输入 供应商名称 / 助记码 搜索"
                :remote-method="editFormQuerySupplier"
                :loading="select.loading"
                remote
                @change="editFormSupplierChange"
                filterable>
                <el-option class="custom-el-option" :value="null" v-if="select.suppliers.length > 0" disabled>
                  <span class="select-option-top" style="width: 120px;">供应商编码</span>
                  <span class="select-option-top" style="width: 300px;">名称</span>
                  <span class="select-option-top" style="width: 100px;">联系人</span>
                  <span class="select-option-top" style="width: 120px;">联系电话</span>
                </el-option>
                <el-option class="custom-el-option" v-for="item in select.suppliers" :key="item.id" :value="item.id" :label="item.name">
                  <span class="select-option-text" style="width: 120px;">{{item.oid}}</span>
                  <span class="select-option-text" style="width: 300px;">{{item.name}}</span>
                  <span class="select-option-text" style="width: 100px;">{{item.contacter}}</span>
                  <span class="select-option-text" style="width: 120px;">{{item.contacterPhone}}</span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="联系人" prop="supplier">
              {{editForm.supplier.contacter}}
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="联系电话" prop="supplier">
              {{editForm.supplier.contacterPhone}}
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="结算类型" prop="supplier">
              {{editForm.supplier.paymentTypeName}}
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="退货合计" prop="supplier">
              {{getSummaries()}}
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="6">
            <el-form-item label="商品名称" prop="iymInventoryId">
              <el-select
                ref="iymInventoryId"
                v-model.trim="editForm.iymInventoryId"
                placeholder="输入 商品名称 / 助记码 搜索"
                :remote-method="editFormQueryInventory"
                :loading="select.loading"
                remote
                @change="editFormInventoryChange"
                filterable>
                <el-option class="custom-el-option" :value="null" v-if="select.inventories.length > 0" disabled>
                  <span class="select-option-top" style="width: 80px;">编码</span>
                  <span class="select-option-top" style="width: 150px;">名称</span>
                  <span class="select-option-top" style="width: 50px;">单位</span>
                  <span class="select-option-top" style="width: 100px;">规格</span>
                  <span class="select-option-top" style="width: 120px;">批号</span>
                  <span class="select-option-top" style="width: 120px;">批次</span>
                  <span class="select-option-top" style="width: 100px;">含税进价</span>
                  <span class="select-option-top" style="width: 100px;">库存数量</span>
                  <span class="select-option-top" style="width: 90px;">有效期至</span>
                  <span class="select-option-top" style="width: 80px;">产地</span>
                  <span class="select-option-top">生产厂家</span>
                </el-option>
                <el-option v-for="item in select.inventories" :key="item.id" :value="item.id" :label="item.gsmGoodsName" class="custom-el-option">
                  <span class="select-option-text" style="width: 80px;">{{item.gsmGoodsOid}}</span>
                  <span class="select-option-text" style="width: 150px;">{{item.gsmGoodsName}}</span>
                  <span class="select-option-text" style="width: 50px;">{{item.goodsUnitsName}}</span>
                  <span class="select-option-text" style="width: 100px;">{{item.gsmGoodsSpecs}}</span>
                  <span class="select-option-text" style="width: 120px;">{{item.ph}}</span>
                  <span class="select-option-text" style="width: 120px;">{{item.pch}}</span>
                  <span class="select-option-text" style="width: 100px;">{{item.costPrice}}</span>
                  <span class="select-option-text" style="width: 100px;">{{item.quantity}}</span>
                  <span class="select-option-text" style="width: 90px;">{{item.expiryDate}}</span>
                  <span class="select-option-text" style="width: 80px;">{{item.originName}}</span>
                  <span class="select-option-text">{{item.manufacturerName}}</span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="可退数量" prop="inventory">
              {{editForm.inventory.quantity}}
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="退货数量" prop="quantity">
              <el-input-number v-model.trim="editForm.quantity" :controls="false" :max="editForm.inventory.quantity" :min="0" :precision="0"
                               ref="quantity" @change="editFormToNextFocus('quantity', 'notes')"/>
            </el-form-item>
          </el-col>
          <el-col :span="9">
            <el-form-item label="退货原因" prop="notes">
              <el-input ref="notes" v-model="editForm.notes" @keydown.enter.native="dataGridInsertRow"/>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <hr/>

    <el-table
      :height="$store.getters.dialogDataGridHeight - 147"
      :data="dataGrid.data"
      size="mini"
      :row-class-name="dataGridRowClassName">
      <el-table-column fixed="left" type="index" width="45"/>
      <el-table-column fixed="left" label="操作" align="center" width="60">
        <template slot-scope="scope">
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="dataGridDeleteRow(scope.row)"/>
        </template>
      </el-table-column>
      <el-table-column prop="gsmGoodsOid" label="商品编码" width="100" show-overflow-tooltip sortable/>
      <el-table-column prop="gsmGoodsName" label="商品名称" width="200" show-overflow-tooltip sortable/>
      <el-table-column prop="gsmGoodsSpecs" label="规格" width="120" show-overflow-tooltip/>
      <el-table-column prop="goodsUnitsName" label="单位" width="80" show-overflow-tooltip/>
      <el-table-column prop="ph" label="批号" width="150" show-overflow-tooltip/>
      <el-table-column prop="pch" label="批次号" width="150" show-overflow-tooltip/>
      <el-table-column prop="costPrice" label="含税进价" width="120" show-overflow-tooltip/>
      <el-table-column prop="expiryDate" label="有效期至" width="120" show-overflow-tooltip/>
      <el-table-column prop="quantity" label="退货数量" width="100" show-overflow-tooltip/>
      <el-table-column prop="originName" label="产地" width="100" show-overflow-tooltip sortable/>
      <el-table-column prop="manufacturerName" label="生产厂家" width="250" show-overflow-tooltip sortable/>
      <el-table-column prop="notes" label="退货原因" min-width="200" show-overflow-tooltip/>
      <el-table-column prop="smallSum" width="120" label="小计"/>
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
    let validateQuantity = (rule, value, callback) => {
      if (!value || value < 1) {
        callback(new Error('最小值为 1'))
      } else {
        callback()
      }
    }

    let hasRepeatRow = (rule, value, callback) => {
      if (this.dataGrid.data.every(row => row.id !== value)) {
        callback()
      } else {
        callback(new Error('该数据已存在, 无需重复录入'))
      }
    }

    return {
      editForm: {
        pemSupplierId: '',
        supplier: {},
        iymInventoryId: '',
        inventory: {},
        quantity: 0,
        notes: ''
      },
      editFormRules: {
        pemSupplierId: [
          {required: true, message: '不能为空'}
        ],
        iymInventoryId: [
          {required: true, message: '不能为空'},
          {validator: hasRepeatRow, trigger: 'blur'}
        ],
        quantity: [
          {validator: validateQuantity, trigger: 'blur'}
        ],
        notes: [
          {max: 30, message: '长度不合法[1-30]'}
        ]
      },
      dataGrid: {
        data: []
      },
      select: {
        loading: false,
        suppliers: [],
        inventories: []
      }
    }
  }, // end data

  methods: {
    dialogOpened () {
    },

    dialogClosed () {
      // 清空查询供应商
      this.select.suppliers = []
      // 清空查询的库存
      this.select.inventories = []
      // 清空编辑表单
      this.$refs.editForm.resetFields()
      // 清空插入的数据
      this.dataGrid.data = []
    },

    dialogCloseConfirm () {
      if (this.dataGrid.data.length > 0) {
        this.$confirm('该操作会清空列表中的内容, 确认这样做吗?', '提示', {
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
    editFormToNextFocus (currentProp, nextRef) {
      this.$refs.editForm.validateField(currentProp, (valid) => {
        if (!valid) {
          this.$refs[nextRef].focus()
        } else {
          return false
        }
      })
    },

    /**
     * 检索供应商
     */
    editFormQuerySupplier (name) {
      if (name.trim()) {
        this.select.loading = true
        // 做一个0.5秒的延迟查询, 避免用户输入速度过慢时的频发查询
        setTimeout(() => {
          const url = `/chisAPI/supplier/getEnabledLikeByName`
          let params = {
            name: name
          }
          this.$http.get(url, {params}).then((res) => {
            this.select.suppliers = res.data
            this.select.loading = false
          })
        }, (this.select.suppliers ? 0 : 500)) // 当查询结果不为0时, 才会有 0.5 秒的延迟查询
      }
    },

    /**
     * 选取供应商操作
     */
    editFormSupplierChange (id) {
      // 获取选取的供应商
      this.editForm.supplier = this.select.suppliers.find((item) => {
        return item.id === id
      })

      // 选中下个焦点
      setTimeout(() => {
        this.editFormToNextFocus('pemSupplierId', 'iymInventoryId')
      }, 100)
    },

    /**
     * 查询退货批号库存
     * @param name
     */
    editFormQueryInventory (name) {
      if (this.editForm.pemSupplierId === '') {
        this.$message.error('请先选择供应商')
        return
      }
      if (name.trim()) {
        this.select.loading = true
        // 做一个0.5秒的延迟查询, 避免用户输入速度过慢时的频发查询
        setTimeout(() => {
          const url = `/chisAPI/inventory/getClinicSubtractPchLikeByCriteria`
          let params = {
            iymInventoryTypeId: this.$store.getters.inventoryType.SUBTRACT_INVENTORY,
            pemSupplierId: this.editForm.pemSupplierId,
            gsmGoodsName: name
          }
          this.$http.get(url, {params}).then((res) => {
            this.select.inventories = res.data
            this.select.loading = false
          })
        }, (this.select.inventories ? 0 : 500)) // 当查询结果不为0时, 才会有 0.5 秒的延迟查询
      }
    },

    /**
     * 选取库存
     */
    editFormInventoryChange (id) {
      this.editForm.inventory = this.select.inventories.find((item) => {
        return item.id === id
      })

      // 选中下个焦点
      setTimeout(() => {
        this.editFormToNextFocus('iymInventoryId', 'quantity')
      }, 100)
    },

    /**
     * 向数据表插入一行
     */
    dataGridInsertRow () {
      this.$refs.editForm.validate((valid) => {
        if (this.dataGrid.data.length > 50) {
          this.$message.error('录入数据已上限[50]')
          return false
        }

        if (!valid) {
          return false
        }
        // 获取数据
        let row = {}
        row.id = this.editForm.inventory.id
        row.iymInventoryTypeId = this.editForm.inventory.iymInventoryTypeId // 1
        row.gsmGoodsId = this.editForm.inventory.gsmGoodsId // 2
        row.gsmGoodsOid = this.editForm.inventory.gsmGoodsOid
        row.gsmGoodsName = this.editForm.inventory.gsmGoodsName
        row.gsmGoodsSpecs = this.editForm.inventory.gsmGoodsSpecs
        row.goodsUnitsName = this.editForm.inventory.goodsUnitsName
        row.purchaseTaxRate = this.editForm.inventory.purchaseTaxRate // 3
        row.sellTaxRate = this.editForm.inventory.sellTaxRate // 4
        row.ph = this.editForm.inventory.ph
        row.pch = this.editForm.inventory.pch
        row.costPrice = this.editForm.inventory.costPrice
        row.producedDate = this.editForm.inventory.producedDate // 5
        row.expiryDate = this.editForm.inventory.expiryDate
        row.pemSupplierId = this.editForm.inventory.pemSupplierId // 6
        row.iymInventoryAddId = this.editForm.inventory.iymInventoryAddId // 7
        row.originName = this.editForm.inventory.originName
        row.manufacturerName = this.editForm.inventory.manufacturerName
        row.quantity = this.editForm.quantity
        row.notes = this.editForm.notes
        row.smallSum = (this.editForm.inventory.costPrice * this.editForm.quantity).toFixed(4)

        // 插入
        this.dataGrid.data.push(row)
        // 保存供应信息
        let supplier = this.editForm.supplier
        // 清空查询的库存
        this.select.inventories = []
        // 清空编辑表单
        this.$refs.editForm.resetFields()
        // 恢复被清空的供应商
        this.editForm.pemSupplierId = supplier.id
        this.editForm.supplier = supplier
        // 商品名称获取焦点
        this.$refs.iymInventoryId.focus()
      })
    },

    /**
     * 重复行标记红色
     * @param row
     * @param rowIndex
     * @returns {string}
     */
    dataGridRowClassName ({row, rowIndex}) {
      if (row.id === this.editForm.inventory.id) {
        return 'danger-row'
      } else {
        return ''
      }
    },

    /**
     * 删除一行
     * @param row
     */
    dataGridDeleteRow (row) {
      this.dataGrid.data = this.dataGrid.data.filter((item) => {
        return item.id !== row.id
      })
    },

    /**
     * 获取退货数量合计
     */
    getSummaries () {
      const smallSumArray = this.dataGrid.data.map(item => item.costPrice * item.quantity)
      return (smallSumArray.reduce((prev, curr) => {
        if (Number(curr)) {
          return prev + curr
        } else {
          return prev
        }
      }, 0)).toFixed(2)
    },

    /**
     * 提交数据
     */
    dataGridSubmit () {
      if (this.dataGrid.data.length === 0) {
        return false
      }

      this.$loading()
      let method = 'POST'
      const url = '/chisAPI/inventorySubtract/save'
      let data = {
        inventorySubtractJson: this.getSubmitJson(this.dataGrid.data)
      }
      this.$http({method, url, data}).then((res) => {
        if (res.data.code === 200) {
          this.$message.success(res.data.msg)
          this.dialogClose()
          this.dataGridLoadData()
        } else {
          this.$message.error(res.data.msg)
          this.$loading().close()
        }
      })
    },

    getSubmitJson (data) {
      let inventoryArray = []
      for (let i = 0; i < data.length; i++) {
        let row = data[i]
        let inventory = {}
        inventory.iymInventoryId = row.id
        inventory.iymInventoryTypeId = row.iymInventoryTypeId
        inventory.gsmGoodsId = row.gsmGoodsId
        inventory.costPrice = row.costPrice
        inventory.purchaseTaxRate = row.purchaseTaxRate
        inventory.sellTaxRate = row.sellTaxRate
        inventory.ph = row.ph
        inventory.pch = row.pch
        inventory.producedDate = row.producedDate
        inventory.expiryDate = row.expiryDate
        inventory.pemSupplierId = row.pemSupplierId
        inventory.iymInventoryAddId = row.iymInventoryAddId
        inventory.quantity = row.quantity
        inventory.notes = row.notes

        inventoryArray.push(inventory)
      }
      return JSON.stringify(inventoryArray)
    }

  } // end methods
}
</script>

<style scoped>
</style>
