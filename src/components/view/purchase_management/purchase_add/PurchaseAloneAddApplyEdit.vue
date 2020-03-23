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
        <span>自采入库单</span>
      </el-col>
      <el-col :span="19" style="text-align: right;">
        <el-button size="mini" type="default" icon="el-icon-refresh" @click="pageResetConfirm">重置</el-button>
        <el-button size="mini" type="default" icon="el-icon-plus" @click="insertRow">插入一行</el-button>
        <el-button size="mini" type="primary" icon="el-icon-check" @click="submitData">提 交</el-button>
        <el-button size="mini" type="warning" icon="el-icon-right" @click="dialogClose">返 回</el-button>
      </el-col>
    </el-row>

    <!-- 编辑表单 -->
    <el-card style="background-color: #f5f9f9;">
      <el-form :model="editForm" ref="editForm" :rules="editFormRules" size="small" label-width="100px">
        <el-row>
          <el-col :span="6">
            <el-form-item label="供应商" prop="pemSupplierId">
              <el-select
                ref="pemSupplierId"
                @keyup.enter.native="validateToNextFocus('pemSupplierId', 'billNo')"
                @change="supplierChange"
                :disabled="dataGrid.data.length > 0"
                v-model.trim="editForm.pemSupplierId"
                placeholder="输入 供应商名称 / 助记码 搜索"
                :remote-method="querySupplier"
                :loading="selectData.loading"
                default-first-option
                remote
                filterable>
                <el-option class="custom-el-option" :value="null" v-if="selectData.supplierList.length > 0" disabled>
                  <span class="select-option-top" style="width: 120px;">供应商编码</span>
                  <span class="select-option-top" style="width: 300px;">名称</span>
                  <span class="select-option-top" style="width: 100px;">联系人</span>
                  <span class="select-option-top" style="width: 120px;">联系电话</span>
                </el-option>
                <el-option class="custom-el-option" v-for="item in selectData.supplierList" :key="item.id" :value="item.id" :label="item.name">
                  <span class="select-option-text" style="width: 120px;">{{item.oid}}</span>
                  <span class="select-option-text" style="width: 300px;">{{item.name}}</span>
                  <span class="select-option-text" style="width: 100px;">{{item.contacter}}</span>
                  <span class="select-option-text" style="width: 120px;">{{item.contacterPhone}}</span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="随货同行" prop="billNo">
              <el-input v-model.trim="editForm.billNo" :disabled="dataGrid.data.length > 0"
                        ref="billNo" @keyup.enter.native="validateToNextFocus('billNo', 'iymInventoryTypeId')"/>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="入库仓库" prop="iymInventoryTypeId">
              <el-select
                ref="iymInventoryTypeId"
                :disabled="dataGrid.data.length > 0"
                @keyup.enter.native="validateToNextFocus('iymInventoryTypeId', 'gsmGoodsId')"
                v-model.trim="editForm.iymInventoryTypeId"
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
          <el-col :span="6">
            <el-form-item label="成本合计">
              {{(totalAmount).toFixed(4)}} &nbsp;元
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="6">
            <el-form-item label="商品名称" prop="gsmGoodsId">
              <el-select
                ref="gsmGoodsId"
                @keyup.enter.native="validateToNextFocus('gsmGoodsId', 'ph')"
                v-model.trim="editForm.gsmGoodsId"
                placeholder="输入 商品名称 / 助记码 搜索"
                :remote-method="queryGoods"
                :loading="selectData.loading"
                remote
                filterable
                @change="goodsChange">
                <el-option class="custom-el-option" :value="null" v-if="selectData.goodsList.length > 0" disabled>
                  <span class="select-option-top" style="width: 120px;">商品编码</span>
                  <span class="select-option-top" style="width: 200px;">商品名称</span>
                  <span class="select-option-top" style="width: 100px;">单位</span>
                  <span class="select-option-top" style="width: 150px;">规格</span>
                  <span class="select-option-top" style="width: 100px;">零售单价(元)</span>
                  <span class="select-option-top" style="width: 100px;">产地</span>
                  <span class="select-option-top">生产厂家</span>
                </el-option>
                <el-option class="custom-el-option" v-for="item in selectData.goodsList" :key="item.id" :value="item.id" :label="item.name">
                  <span class="select-option-text" style="width: 120px;">{{item.oid}}</span>
                  <span class="select-option-text" style="width: 200px;">{{item.name}}</span>
                  <span class="select-option-text" style="width: 100px;">{{item.goodsUnitsName}}</span>
                  <span class="select-option-text" style="width: 150px;">{{item.specs}}</span>
                  <span class="select-option-text" style="width: 100px;">{{item.retailPrice}}</span>
                  <span class="select-option-text" style="width: 100px;">{{item.originName}}</span>
                  <span class="select-option-text">{{item.manufacturerName}}</span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="生产批号" prop="ph">
              <el-input v-model.trim="editForm.ph"
                        ref="ph"  @keyup.enter.native="validateToNextFocus('ph', 'producedDate')"/>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="生产日期" prop="producedDate">
              <el-date-picker
                ref="producedDate"
                @change="validateToNextFocus('producedDate', 'expiryDate')"
                v-model="editForm.producedDate"
                type="date"
                placeholder="选择日期"
                :picker-options="pickerOptionsBefore"
                value-format="yyyy-MM-dd"
                style="width: 100%;"/>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="有效期至" prop="expiryDate">
              <el-date-picker
                ref="expiryDate"
                @change="validateToNextFocus('expiryDate', 'costPrice')"
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
          <el-col :span="4">
            <el-form-item label="零售单价" prop="retailPrice">
              <el-input v-model="selectData.selectedGoods.retailPrice" readonly style="width: 80%;"/>&nbsp;&nbsp;元
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="入库单价" prop="costPrice">
              <el-input-number v-model.trim="editForm.costPrice" :controls="false" :max="999999" :min="0" :precision="4"
                               ref="costPrice"
                               @focus="editForm.costPrice === 0 ? editForm.costPrice=undefined : editForm.costPrice"
                               @keyup.enter.native="validateToNextFocus('costPrice', 'quantity')" style="width: 80%;"/>&nbsp;&nbsp;元
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="入库数量" prop="quantity">
              <el-input-number v-model.trim="editForm.quantity" :controls="false" :max="30000" :min="0" :precision="0"
                               ref="quantity"
                               @focus="editForm.quantity === 0 ? editForm.quantity=undefined : editForm.quantity"
                               @keyup.enter.native="validateToNextFocus('quantity', 'notes')"/>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="备注" prop="notes">
              <el-input v-model.trim="editForm.notes"
                        ref="notes" @keydown.enter.native="insertRow"/>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <hr/>

    <!-- 数据表 --> <!-- :row-class-name="dataGridRowClassName" -->
    <el-table
      :height="$store.getters.dialogDataGridHeight - 195"
      :data="dataGrid.data"
      highlight-current-row
      stripe
      size="mini">
      <el-table-column fixed="left" type="index" width="50"/>
      <el-table-column fixed="left" label="操作" align="center" width="80">
        <template slot-scope="scope">
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteRow(scope.row)"/>
        </template>
      </el-table-column>
      <el-table-column prop="gsmGoodsTypeName" label="商品类型" width="120" show-overflow-tooltip/>
      <el-table-column prop="gsmGoodsOid" label="编码" width="100" show-overflow-tooltip/>
      <el-table-column prop="gsmGoodsName" label="名称" width="250" show-overflow-tooltip/>
      <el-table-column prop="goodsUnitsName" label="单位" width="80" show-overflow-tooltip/>
      <el-table-column prop="gsmGoodsSpecs" label="规格" width="150" show-overflow-tooltip/>
      <el-table-column prop="retailPrice" label="零售价" width="100" show-overflow-tooltip/>
      <el-table-column prop="costPrice" label="入库单价" width="100" show-overflow-tooltip/>
      <el-table-column prop="quantity" label="入库数量" width="100" show-overflow-tooltip/>
      <el-table-column label="小计/元" width="100" show-overflow-tooltip>
        <template slot-scope="props">
          {{(props.row.costPrice * props.row.quantity).toFixed(4)}}
        </template>
      </el-table-column>
      <el-table-column prop="ph" label="批号" width="150" show-overflow-tooltip/>
      <el-table-column prop="producedDate" label="生产日期" width="100" show-overflow-tooltip/>
      <el-table-column prop="expiryDate" label="有效期至" width="100" show-overflow-tooltip/>
      <el-table-column prop="originName" label="产地" width="120" show-overflow-tooltip/>
      <el-table-column prop="manufacturerName" label="生产厂家" width="250" show-overflow-tooltip/>
      <el-table-column prop="billNo" label="随货同行" width="150" show-overflow-tooltip/>
      <el-table-column prop="notes" label="备注" min-width="250" show-overflow-tooltip/>
    </el-table>

  </el-dialog>
</template>

<script>
import jwtDecode from 'jwt-decode'
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
    let validateCostPrice = (rule, value, callback) => {
      // 如果不可倒挂 并且成本单价大于零售单价则抛出错误
      if (!this.selectData.selectedGoods.lossable && (value > this.selectData.selectedGoods.retailPrice)) {
        callback(new Error('入库单价不能大于零售单价'))
      } else {
        callback()
      }
    }
    let validateQuantity = (rule, value, callback) => {
      // 如果不可倒挂 并且成本单价大于零售单价则抛出错误
      if (value <= 0) {
        callback(new Error('入库数量不能为 0'))
      } else {
        callback()
      }
    }
    return {
      payload: jwtDecode(this.$store.getters.token),
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
        index: 0
      },
      editForm: {
        pemSupplierId: '',
        billNo: '',
        iymInventoryTypeId: '',
        gsmGoodsId: '',
        ph: '',
        producedDate: '',
        expiryDate: '',
        quantity: 0,
        costPrice: 0,
        notes: ''
      },
      editFormRules: {
        pemSupplierId: [
          {required: true, message: '不能为空'}
        ],
        billNo: [
          {max: 30, message: '长度不合法[1-30]'}
        ],
        iymInventoryTypeId: [
          {required: true, message: '不能为空'}
        ],
        gsmGoodsId: [
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
        quantity: [
          {required: true, message: '不能为空'},
          {validator: validateQuantity}
        ],
        costPrice: [
          {required: true, message: '不能为空'},
          {validator: validateCostPrice}
        ],
        notes: [
          {max: 50, message: '长度不合法[1-50]'}
        ]
      },
      selectData: {
        loading: false,
        supplierList: [],
        selectedSupplier: {},
        goodsList: [],
        selectedGoods: {}
      },
      totalAmount: 0
    }
  },

  methods: {
    /* -------------------------------------------------------------------------------------------------------------- */
    /**
     * 打开界面载执行的操作
     */
    dialogOpened () {
      // this.$refs.pemSupplierId.focus()
      // 获取缓存
      this.getFromCache()
    },

    /**
     * 界面关闭后执行的操作
     */
    dialogClosed () {
      this.pageReset()
    },

    /**
     * 关闭页面确认
     */
    /*
    dialogCloseConfirm () {
      if (this.dataGrid.data.length > 0) {
        this.$confirm('该操作会清空已录入数据, 确认这样做吗?', '提示', {
          confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', showClose: false
        }).then(() => {
          this.dialogClose()
        }).catch(() => {})
      } else {
        this.dialogClose()
      }
    },
    */

    /**
     * 重置页面确认
     */
    pageResetConfirm () {
      if (this.dataGrid.data.length > 0) {
        this.$confirm('该操作会清空已录入数据, 确认这样做吗?', '提示', {
          confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', showClose: false
        }).then(() => {
          this.pageReset()
          // 清除缓存
          this.removeCache()
        }).catch(() => {})
      }
    },

    // 重置页面
    pageReset () {
      // 重置数据表
      this.dataGrid.data = []
      this.dataGrid.index = 0

      // 重置表单
      this.$refs.editForm.resetFields()

      // 重置 selectData
      this.selectData.supplierList = []
      this.selectData.selectedSupplier = {}
      this.selectData.goodsList = []
      this.selectData.selectedGoods = {}

      // 重置合计
      this.totalAmount = 0
    },

    /**
     * 数据表行颜色标记
     * @param row
     * @param rowIndex
     * @returns {string}
     */
    dataGridRowClassName ({row, rowIndex}) {
      return ''
    },

    /**
     * 验证表单当前字段, 通过验证后获取下一个焦点
     */
    validateToNextFocus (currentProp, nextRef) {
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
     * 做一个0.5秒的延迟查询, 避免用户输入速度过慢时的频发查询
     * 当查询结果不为0时, 才会有 0.5 秒的延迟查询
     */
    querySupplier (name) {
      if (name.trim()) {
        this.selectData.loading = true
        setTimeout(() => {
          const url = `/chisAPI/supplier/getEnabledLikeByName`
          let params = {
            name: name
          }
          this.$http.get(url, {params}).then((res) => {
            this.selectData.supplierList = res.data
            this.selectData.loading = false
          })
        }, (this.selectData.suppliers ? 0 : 500))
      }
    },

    /**
     * 供应商发生改变时执行的操作
     */
    supplierChange (id) {
      if (this.validateSupplier()) {
        this.selectData.selectedSupplier = this.selectData.supplierList.find(item => {
          return item.id === id
        })
      }
    },

    /**
     * 验证供应商
     */
    validateSupplier () {
      const today = new Date()
      const supplier = this.selectData.supplierList.find(item => {
        return item.id === this.editForm.pemSupplierId
      })

      // 判断营业执照效期
      if (today > new Date(supplier.blExpiryDate)) {
        this.$message.error('供应商营业执照已过期')
        return false
      }
      // 判断经营许可证效期 plExpiryDate
      if (today > new Date(supplier.plExpiryDate)) {
        this.$message.error('供应商经营许可证已过期')
        return false
      }
      // 判断GSP效期 gspExpiryDate
      if (today > new Date(supplier.gspExpiryDate)) {
        this.$message.error('供应商GSP已过期')
        return false
      }
      // 判断GMP效期 gmpExpiryDate
      if (today > new Date(supplier.gmpExpiryDate)) {
        this.$message.error('供应商GMP已过期')
        return false
      }
      // 判断卫生许可证效期 hlExpiryDate
      if (today > new Date(supplier.hlExpiryDate)) {
        this.$message.error('供应商卫生许可证已过期')
        return false
      }
      // 判断器械许可证效期 ilExpiryDate
      if (today > new Date(supplier.ilExpiryDate)) {
        this.$message.error('供应商器械许可证已过期')
        return false
      }
      // 判断食品经营许可证效期 fplExpiryDate
      if (today > new Date(supplier.fplExpiryDate)) {
        this.$message.error('供应商食品经营许可证已过期')
        return false
      }
      // 判断保健食品许可证效期 flExpiryDate
      if (today > new Date(supplier.flExpiryDate)) {
        this.$message.error('供应商保健食品许可证已过期')
        return false
      }

      return true
    },

    /**
     * 对商品进行检索查询
     * 做一个0.5秒的延迟查询, 避免用户输入速度过慢时的频发查询
     * 查询结果不为 0 时, 才会有 0.5 秒的延迟查询
     * @param name
     */
    queryGoods (name) {
      if (name.trim()) {
        this.selectData.loading = true
        setTimeout(() => {
          const url = `/chisAPI/goods/getEnabledLikeByNameForPlan`
          let params = {
            name: name
          }
          this.$http.get(url, {params}).then((res) => {
            this.selectData.goodsList = res.data
            this.selectData.loading = false
          })
        }, (this.selectData.goodsList ? 0 : 500))
      }
    },

    /**
     * 当选中商品时执行的操作
     * @param id
     */
    goodsChange (id) {
      // 获取选中对象
      this.selectData.selectedGoods = this.selectData.goodsList.find((item) => {
        return item.id === id
      })
    },

    /**
     * 是否有重复行
     */
    hasRepeatRow (row) {
      let data = this.dataGrid.data.filter(item => {
        return item.gsmGoodsId === row.gsmGoodsId && item.ph === row.ph
      })

      return data.length
    },

    /**
     * 计算成本合计
     */
    countTotalAmount () {
      let values = this.dataGrid.data.map(item => item.costPrice * item.quantity)
      this.totalAmount = values.reduce((prev, curr) => {
        return prev + curr
      }, 0).toFixed(4) * 1
    },

    /**
     * 向数据表插入一行数据
     */
    insertRow () {
      this.$refs.editForm.validate((valid) => {
        // 检查表单内容是否有全部有效
        if (!valid) {
          return false
        }

        // 检查供应商证照
        if (!this.validateSupplier()) {
          return false
        }

        // 检查是否上限
        if (this.dataGrid.data.length > 50) {
          this.$message.error('单次录入最大数量为 50')
          return false
        }

        // 准备插入数据
        let goods = this.selectData.selectedGoods
        let row = {}
        row.index = ++this.dataGrid.index
        row.gsmGoodsTypeName = goods.gsmGoodsTypeName
        row.gsmGoodsOid = goods.oid
        row.gsmGoodsName = goods.name
        row.goodsUnitsName = goods.goodsUnitsName
        row.gsmGoodsSpecs = goods.specs
        row.retailPrice = goods.retailPrice
        row.originName = goods.originName
        row.manufacturerName = goods.manufacturerName
        row.purchaseTaxRate = goods.purchaseTaxRate // 进货税率
        row.sellTaxRate = goods.sellTaxRate // 销售税率
        row.pemSupplierId = this.editForm.pemSupplierId
        row.pemSupplierName = this.selectData.selectedSupplier.name // 供应商名称
        row.billNo = this.editForm.billNo
        row.iymInventoryTypeId = this.editForm.iymInventoryTypeId
        row.gsmGoodsId = goods.id
        row.ph = this.editForm.ph
        row.producedDate = this.editForm.producedDate
        row.expiryDate = this.editForm.expiryDate
        row.quantity = this.editForm.quantity
        row.costPrice = this.editForm.costPrice
        row.notes = this.editForm.notes

        // 检查是否重复
        if (this.hasRepeatRow(row)) {
          this.$message.error('该记录已存在, 不能重复录入')
          return false
        }

        // 验证批准文号是否过期
        let date1 = new Date(row.producedDate)
        let date2 = new Date(goods.approvalNumExpiryDate)

        if (date1 > date2) {
          this.$message.error('批准文号已过期')
          return false
        }

        // 插入一行数据
        this.dataGrid.data.push(row)

        // 进行缓存操作
        this.saveToCache()

        // 计算合计
        this.countTotalAmount()

        // 重置表单、检索商品结果
        this.$refs.editForm.resetFields()
        this.selectData.goodsList = []
        this.selectData.selectedGoods = {}

        // 恢复供应商、随货同行、入库仓库的值
        this.editForm.pemSupplierId = row.pemSupplierId
        this.editForm.billNo = row.billNo
        this.editForm.iymInventoryTypeId = row.iymInventoryTypeId

        // 使检索商品获取焦点
        this.$refs.gsmGoodsId.focus()
      })
    },

    /**
     * 删除一行
     * @param row
     */
    deleteRow (row) {
      // 删除一行
      this.dataGrid.data = this.dataGrid.data.filter(item => item.index !== row.index)
      // 计算合计
      this.countTotalAmount()
      // 进行缓存操作
      this.saveToCache()
    },

    /**
     * 提交数据
     */
    submitData () {
      if (this.dataGrid.data.length === 0) {
        return
      }

      this.$loading()
      const url = '/chisAPI/inventoryAdd/saveForAlone'
      let method = 'POST'
      let data = {
        inventoryAddJson: JSON.stringify(this.dataGrid.data)
      }
      this.$http({method, url, data}).then((res) => {
        if (res.data.code === 200) {
          this.$message.success(res.data.msg)
          this.dialogClose()
          this.dataGridLoadData()
          // 清除缓存
          this.removeCache()
        } else {
          this.$message.error(res.data.msg)
          this.$loading().close()
        }
      })
    },

    /* -------------------------------------------------------------------------------------------------------------- */
    // 本地缓存

    getCacheKey () {
      return 'purchaseAloneAdd' + this.payload.userId
    },

    /**
     * 保存到缓存
     * --插入一行时调用
     * --删除一行时调用
     */
    saveToCache () {
      this.removeCache()
      if (this.dataGrid.data.length === 0) {
        return
      }
      localStorage.setItem(this.getCacheKey(), JSON.stringify(this.dataGrid.data))
    },

    /**
     * 从缓存中获取
     * --界面打开调用
     */
    getFromCache () {
      let cache = localStorage.getItem(this.getCacheKey())
      if (!cache) {
        return
      }

      this.dataGrid.data = JSON.parse(cache)
      if (this.dataGrid.data.length === 0) {
        return
      }

      // 设置行 index
      this.dataGrid.index = this.dataGrid.data.length + 1
      // 计算合计
      this.countTotalAmount()

      let row = this.dataGrid.data[0]
      // 设置供应商信息
      this.editForm.pemSupplierId = row.pemSupplierId
      let supplier = {'id': row.pemSupplierId, 'name': row.pemSupplierName}
      this.selectData.supplierList.push(supplier)
      this.selectData.selectedSupplier = supplier
      // 设置随货同行
      this.editForm.billNo = row.billNo
      // 设置入库仓库
      this.editForm.iymInventoryTypeId = row.iymInventoryTypeId
    },

    /**
     * 清除缓存
     * --提交成功调用
     * --重置页面调用
     */
    removeCache () {
      localStorage.removeItem(this.getCacheKey())
    }

  } // end methods
}
</script>

<style scoped>
</style>
