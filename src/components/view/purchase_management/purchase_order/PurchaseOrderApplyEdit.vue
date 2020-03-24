<template>
  <el-dialog
    class="fullscreen-dialog"
    fullscreen
    :show-close="false"
    :close-on-click-modal="false"
    :visible="visible"
    @opened="dialogOpened"
    @closed="dialogClosed">

    <!-- 模态框标题栏与功能按钮-->
    <el-row slot="title">
      <el-col :span="5" style="font-size: 20px;">
        <span>采购订单</span>
      </el-col>
      <el-col :span="19" style="text-align: right;">
        <!-- 标题栏选取供应商 -->
        <span style="font-size: 14px; font-weight: 900; padding-right: 10px;">选择供应商</span>
        <el-select
          style="width: 300px; margin-right: 10px;"
          ref="supplierId"
          v-model.trim="supplierId"
          placeholder="输入 供应商名称 / 助记码 搜索"
          :remote-method="querySupplier"
          :loading="select.loading"
          remote
          filterable
          @change="supplierChange"
          size="small">
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

        <!-- 标题栏按钮 -->
        <el-button size="mini" type="primary" icon="el-icon-check" @click="submitData">提 交</el-button>
        <el-button size="mini" type="warning" icon="el-icon-right" @click="dialogCloseConfirm">返 回</el-button>
      </el-col>
    </el-row>

    <!-- 商品进购历史、配送明细表 -->
    <el-row style="border-bottom: #909399 2px solid;">
      <el-col :span="10" style="border-right: #909399 2px solid;">
        <el-table
          height="35vh"
          size="mini">
          <el-table-column prop="1" label="历史采购日期" width="130" sortable/>
          <el-table-column prop="2" label="历史采购单价" width="130" sortable/>
          <el-table-column prop="3" label="供应商" sortable/>
        </el-table>
      </el-col>
      <el-col :span="14">
        <el-table
          height="35vh"
          :data="dataGrid.groupRowDetailData"
          @row-dblclick="editDetailRow"
          size="mini">
          <el-table-column fixed="left" type="index" width="50"/>
          <el-table-column prop="gsmGoodsOid" label="商品编码" width="100" show-overflow-tooltip sortable/>
          <el-table-column prop="quantity" label="计划数量" width="120" show-overflow-tooltip sortable/>
          <el-table-column prop="detailPurchaseQuantity" label="配送数量" width="120">
            <template slot-scope="props">
              <el-input-number size="mini" v-model="props.row.purchaseQuantity" :controls="false" :max="99999" :min="0" :precision="0"
                               v-show="props.row.editable"
                               @change="detailRowPurchaseQuantityChange"/>
              <span v-show="!props.row.editable">{{props.row.purchaseQuantity}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="purchasePrice" label="采购单价" width="100" show-overflow-tooltip sortable/>
          <el-table-column prop="sysClinicName" label="机构名称" min-width="200" show-overflow-tooltip sortable/>
        </el-table>
      </el-col>
    </el-row>

    <!-- 采购汇总表 -->
    <el-table
      ref="groupDataList"
      height="58vh"
      :data="dataGrid.groupData"
      @row-dblclick="clickEditGroupRow"
      :row-class-name="dataGridRowClassName"
      size="mini">
      <el-table-column fixed="left" type="index" width="40"/>
      <el-table-column fixed="left" label="操作" align="center" width="60">
        <template slot-scope="scope">
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteGroupRow(scope.row.gsmGoodsId)"/>
        </template>
      </el-table-column>
      <el-table-column prop="gsmGoodsTypeName" label="商品类型" width="110" show-overflow-tooltip/>
      <el-table-column prop="gsmGoodsOid" label="商品编码" width="80" show-overflow-tooltip/>
      <el-table-column prop="gsmGoodsName" label="商品名称" width="200" show-overflow-tooltip sortable/>
      <el-table-column prop="gsmGoodsSpecs" label="规格" width="130" show-overflow-tooltip/>
      <el-table-column prop="goodsUnitsName" label="单位" width="80" show-overflow-tooltip/>
      <el-table-column prop="originName" label="产地" width="100" show-overflow-tooltip sortable/>
      <el-table-column prop="manufacturerName" label="生产厂家" min-width="230" show-overflow-tooltip sortable/>
      <el-table-column fixed="right" prop="minPurchaseQuantity" label="采购基数" width="100"/>
      <el-table-column fixed="right" prop="quantity" label="计划数量" width="100"/>
      <el-table-column fixed="right" prop="purchaseQuantity" label="采购数量" width="100" sortable>
        <template slot-scope="props">
          <el-input-number size="small" v-model="props.row.purchaseQuantity" :controls="false" :min="1" :max="30000" :precision="0"
                           v-show="props.row.editable"
                           :ref="'purchaseQuantity' + props.$index"
                           @keyup.enter.native="editGroupRow('purchasePrice', props.$index)"
                           @change="(val) => {groupRowPurchaseQuantityChange(val, props.row.gsmGoodsId)}"/>
          <span v-show="!props.row.editable">{{props.row.purchaseQuantity}}</span>
        </template>
      </el-table-column>
      <el-table-column fixed="right" prop="retailPrice" label="零售单价" width="100"/>
      <el-table-column fixed="right" prop="purchasePrice" label="采购单价" width="100">
        <template slot-scope="props">
          <el-input-number size="small" v-model="props.row.purchasePrice" :controls="false" :max="99999" :min="0" :precision="4"
                           v-show="props.row.editable"
                           :ref="'purchasePrice' + props.$index"
                           @keyup.enter.native="editNextGroupRow('purchaseQuantity', props.$index)"
                           @change="(val) => {groupRowPurchasePriceChange(val, props.row.gsmGoodsId)}"/>
          <span v-show="!props.row.editable">{{props.row.purchasePrice}}</span>
        </template>
      </el-table-column>
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
    selectedRows: {
      type: Array,
      required: true
    },
    dataGridDeleteSelectedRow: {
      type: Function,
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
      supplierId: '',
      dataGrid: {
        groupData: [], // 汇总数据
        detailData: [], // 明细数据
        groupRowDetailData: [] // 汇总行对应的明细数据
      },
      select: {
        loading: false,
        suppliers: []
      }
    }
  },

  methods: {
    /**
     * 窗口打开后执行的内容
     */
    dialogOpened () {
      // 获取默认焦点
      this.$refs.supplierId.focus()

      // 复制汇总数据插入到采购汇总表
      this.dataGrid.groupData = []
      this.selectedRows.forEach((item) => {
        let row = {}
        row.editable = false // 该行是否可编辑
        row.gsmGoodsTypeName = item.gsmGoodsTypeName // 商品类型名称
        row.gsmGoodsId = item.gsmGoodsId // 商品ID
        row.gsmGoodsOid = item.gsmGoodsOid // 商品编码
        row.gsmGoodsName = item.gsmGoodsName // 商品名称
        row.gsmGoodsSpecs = item.gsmGoodsSpecs // 商品规格
        row.goodsUnitsName = item.goodsUnitsName // 商品单位
        row.quantity = item.quantity // 计划数量
        row.minPurchaseQuantity = item.minPurchaseQuantity // 采购基数
        row.purchaseQuantity = item.quantity // 采购数量(默认值为计划数量)
        row.retailPrice = item.retailPrice // 零售单价
        row.purchasePrice = 0 // 采购单价
        row.originName = item.originName // 产地
        row.manufacturerName = item.manufacturerName // 生产厂家
        row.idArray = item.idArray // 该汇总行的明细ID
        this.dataGrid.groupData.push(row)
      })

      // 载入采购明细
      this.loadDetailDataByIdArray(this.getAllGroupDataIdArray())
    },

    /**
     * 获取所有汇总行的明细 ID
     */
    getAllGroupDataIdArray () {
      let idArray = ''
      for (let i = 0; i < this.dataGrid.groupData.length; i++) {
        let row = this.dataGrid.groupData[i]
        idArray = idArray + ',' + row.idArray
      }

      return idArray.split(',')
    },

    /**
     * 载入采购计划明细 (Group机构、商品 后的明细数据)
     */
    loadDetailDataByIdArray (planIdArray) {
      this.$loading()
      let url = '/chisAPI/purchasePlan/getClinicGroupListByPlanIdArray'
      let params = {planIdArray}

      this.$http.get(url, {params}).then((res) => {
        if (res.data.code === 200) {
          // 向明细插入 采购数量、 采购单价
          res.data.resultSet.groupList.forEach((item) => {
            item.editable = false // 是否可编辑
            item.purchaseQuantity = item.quantity // 明细采购数量(默认为计划数量)
            item.purchasePrice = 0 // 采购单价
          })
          this.dataGrid.detailData = res.data.resultSet.groupList
        }
        this.$loading().close()
      })
    },

    /**
     * 窗口关闭前确认
     */
    dialogCloseConfirm () {
      if (this.supplierId && this.dataGrid.groupData.length > 0) {
        this.$confirm('关闭后会丢弃编辑内容, 继续执行吗?', '提示', {
          confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', showClose: false
        }).then(() => {
          this.dialogClose()
        }).catch(() => {})
      } else {
        this.dialogClose()
      }
    },

    /**
     * 窗口关闭后执行的内容
     */
    dialogClosed () {
      this.supplierId = ''
      this.select.suppliers = []
      this.dataGrid.groupData = []
      this.dataGrid.detailData = []
      this.dataGrid.groupRowDetailData = []
    },

    /* -------------------------------------------------------------------------------------------------------------- */
    /**
     * 检索供应商
     */
    querySupplier (name) {
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
     * 显示选中供应商信息
     */
    supplierChange (id) {
      // 选中供应商后默认开启第一行编辑
      if (this.validateSupplier()) {
        this.editGroupRow('purchaseQuantity', 0)
      }
    },

    /* -------------------------------------------------------------------------------------------------------------- */
    /**
     * 为数据行添加样式
     */
    dataGridRowClassName ({row, rowIndex}) {
      if (row.editable) {
        return 'info-row'
      }
      return ''
    },

    /**
     * 验证供应商
     */
    validateSupplier () {
      if (!this.supplierId) {
        this.$message.error('请填写供应商')
        return false
      }

      const today = new Date()
      const supplier = this.select.suppliers.find(item => {
        return item.id === this.supplierId
      })

      // 判断营业执照效期
      if (today > new Date(supplier.blExpiryDate)) {
        this.$message.error('营业执照已过期')
        return false
      }
      // 判断经营许可证效期 plExpiryDate
      if (today > new Date(supplier.plExpiryDate)) {
        this.$message.error('经营许可证已过期')
        return false
      }
      // 判断GSP效期 gspExpiryDate
      if (today > new Date(supplier.gspExpiryDate)) {
        this.$message.error('GSP已过期')
        return false
      }
      // 判断GMP效期 gmpExpiryDate
      if (today > new Date(supplier.gmpExpiryDate)) {
        this.$message.error('GMP已过期')
        return false
      }
      // 判断卫生许可证效期 hlExpiryDate
      if (today > new Date(supplier.hlExpiryDate)) {
        this.$message.error('卫生许可证已过期')
        return false
      }
      // 判断器械许可证效期 ilExpiryDate
      if (today > new Date(supplier.ilExpiryDate)) {
        this.$message.error('器械许可证已过期')
        return false
      }
      // 判断食品经营许可证效期 fplExpiryDate
      if (today > new Date(supplier.fplExpiryDate)) {
        this.$message.error('食品经营许可证已过期')
        return false
      }
      // 判断保健食品许可证效期 flExpiryDate
      if (today > new Date(supplier.flExpiryDate)) {
        this.$message.error('保健食品许可证已过期')
        return false
      }

      return true
    },

    /**
     * 验证汇总表所有行是否有效
     */
    validateAllGroupRow () {
      // 验证供应商
      if (!this.validateSupplier()) {
        return false
      }

      for (let i = 0; i < this.dataGrid.groupData.length; i++) {
        let row = this.dataGrid.groupData[i]

        if (parseFloat(row.purchaseQuantity).toString() === 'NaN') {
          this.$message.error('采购数量不能为空')
          this.$refs['purchaseQuantity' + i].focus()
          return false
        }
        if (row.purchaseQuantity % row.minPurchaseQuantity !== 0) {
          this.$message.error('采购数量必须是采购基数的整倍数')
          this.$refs['purchaseQuantity' + i].focus()
          return false
        }
        if (parseFloat(row.purchasePrice).toString() === 'NaN') {
          this.$message.error('采购单价不能为空')
          this.$refs['purchasePrice' + i].focus()
          return false
        }
      }
      return true
    },

    /**
     * 停止编辑汇总表所有行
     */
    stopEditAllGroupRow () {
      this.dataGrid.groupData.forEach(item => {
        item.editable = false
      })
    },

    /**
     * 载入汇总行的对应明细数据
     */
    loadGroupRowDetailData (row) {
      this.dataGrid.groupRowDetailData = this.dataGrid.detailData.filter(item => {
        return item.gsmGoodsId === row.gsmGoodsId
      })
    },

    /**
     * 汇总表编辑一行
     */
    editGroupRow (editField, index) {
      // 验证明细表所有行是否有效
      if (!this.validateAllDetailRow()) {
        return
      }

      // 停止编辑所有明细行
      this.stopEditAllDetailRow()

      // 验证会总表所有行是否有效
      if (!this.validateAllGroupRow()) {
        return
      }

      // 保证索引的有效性
      let length = this.dataGrid.groupData.length
      if (index >= length) {
        index = 0
      }

      // 获取当前行
      let row = this.dataGrid.groupData[index]

      // 停止编辑所有行
      this.stopEditAllGroupRow()

      // 当前行开启编辑
      row.editable = true

      // 编辑字段获取焦点
      setTimeout(() => {
        this.$refs[editField + index].focus()
      }, 100)

      // 载入当前行对应的请货明细
      this.loadGroupRowDetailData(row)
    },

    /**
     * 编辑汇总表下一行
     * @param editField
     * @param index
     */
    editNextGroupRow (editField, index) {
      this.editGroupRow(editField, index + 1)
    },

    /**
     * 点击编辑汇总表一行
     * @param row
     */
    clickEditGroupRow (clickRow) {
      for (let i = 0; i < this.dataGrid.groupData.length; i++) {
        let row = this.dataGrid.groupData[i]
        if (row.gsmGoodsId === clickRow.gsmGoodsId) {
          this.editGroupRow('purchaseQuantity', i)
          break
        }
      }
    },

    /**
     * 删除汇总表一行
     */
    deleteGroupRow (gsmGoodsId) {
      // 删除主表中的选中行
      this.dataGridDeleteSelectedRow(gsmGoodsId)

      // 删除复制的汇总数据对应行
      this.dataGrid.groupData = this.dataGrid.groupData.filter((item) => {
        return item.gsmGoodsId !== gsmGoodsId
      })

      // 删除对应机构的明细
      this.dataGrid.detailData = this.dataGrid.detailData.filter((item) => {
        return item.gsmGoodsId !== gsmGoodsId
      })

      // 删除对应的汇总行的明细
      this.dataGrid.groupRowDetailData = this.dataGrid.groupRowDetailData.filter((item) => {
        return item.gsmGoodsId !== gsmGoodsId
      })
    },

    /**
     * 汇总表一行采购数量发生变化后对配送数量进行分配
     * @param purchaseQuantity
     * @param gsmGoodsId
     */
    groupRowPurchaseQuantityChange (purchaseQuantity, gsmGoodsId) {
      if (!this.dataGrid.groupRowDetailData.every(item => item.gsmGoodsId === gsmGoodsId)) {
        this.$message.error('当前采购商品与配送商品不符')
        return
      }

      // 按计划数量分配采购数量
      for (let i = 0; i < this.dataGrid.groupRowDetailData.length; i++) {
        let row = this.dataGrid.groupRowDetailData[i]
        // 初始化明细采购数量为 0
        row.purchaseQuantity = 0

        // 如果采购数量小于或等于当前行的计划数量 则当前行的采购(配送)数量为采购数量的值
        if (purchaseQuantity <= row.quantity) {
          row.purchaseQuantity = purchaseQuantity
        }

        // 如果采购数量大于当前行的计划数量 则当前行的采购(配送)数量为计划数量的值
        if (purchaseQuantity > row.quantity) {
          row.purchaseQuantity = row.quantity
        }

        // 每循环一次 采购数量就减去一次当前行的计划数量
        purchaseQuantity = purchaseQuantity - row.quantity

        // 如果采购数量为 0 则提前停止循环
        if (purchaseQuantity === 0) {
          break
        }
      }

      // 如果分配结束后还有剩余的采购数量 则再次进行分配
      let i = 0
      while (purchaseQuantity-- > 0) {
        let row = this.dataGrid.groupRowDetailData[i]
        row.purchaseQuantity = row.purchaseQuantity + 1
        i++
        if (i === this.dataGrid.groupRowDetailData.length) {
          i = 0
        }
      }
    },

    /**
     * 汇总表一行采购单价发生变化后对配送单价进行修改
     * @param purchasePrice
     * @param gsmGoodsId
     */
    groupRowPurchasePriceChange (purchasePrice, gsmGoodsId) {
      if (!this.dataGrid.groupRowDetailData.every(item => item.gsmGoodsId === gsmGoodsId)) {
        this.$message.error('当前采购商品与配送商品不符')
        return
      }

      this.dataGrid.groupRowDetailData.forEach(row => {
        row.purchasePrice = purchasePrice
      })
    },

    /* -------------------------------------------------------------------------------------------------------------- */
    /**
     * 验证明细数据所有行是否有效
     * @returns {boolean}
     */
    validateAllDetailRow () {
      for (let i = 0; i < this.dataGrid.groupRowDetailData.length; i++) {
        let row = this.dataGrid.groupRowDetailData[i]

        if (parseFloat(row.purchaseQuantity).toString() === 'NaN') {
          this.$message.error('配送数量不能为空')
          return false
        }

        if (row.purchaseQuantity % row.minPurchaseQuantity !== 0) {
          this.$message.error('配送数量必须是采购基数的整倍数')
          return false
        }
      }

      return true
    },

    /**
     * 停止编辑所有明细行
     */
    stopEditAllDetailRow () {
      this.dataGrid.groupRowDetailData.forEach(item => {
        item.editable = false
      })
    },

    /**
     * 双击编辑一行明细数据
     * @param row
     */
    editDetailRow (row) {
      // 验证明细数据所有行是否有效
      if (!this.validateAllDetailRow()) {
        return
      }

      // 停止所有明细行编辑
      this.stopEditAllDetailRow()

      // 开启当前行编辑
      row.editable = true
    },

    /**
     * 当明细行数据发生改变时执行的内容
     */
    detailRowPurchaseQuantityChange () {
      // 验证明细数据所有行是否有效
      if (!this.validateAllDetailRow()) {
        return
      }

      // 停止所有明细行编辑
      this.stopEditAllDetailRow()

      // 计算当前配送数量总和
      let purchaseQuantity = 0
      this.dataGrid.groupRowDetailData.forEach((item) => {
        purchaseQuantity += item.purchaseQuantity
      })

      // 更新当前汇总行的采购数量
      let gsmGoodsId = this.dataGrid.groupRowDetailData[0].gsmGoodsId
      this.dataGrid.groupData.forEach((item) => {
        if (item.gsmGoodsId === gsmGoodsId) {
          item.purchaseQuantity = purchaseQuantity
        }
      })
    },

    /**
     * 获取订单数据
     */
    getPurchaseOrder () {
      let purchaseOrderArray = []
      this.dataGrid.detailData.forEach(item => {
        let purchaseOrder = {}
        purchaseOrder.gsmGoodsId = item.gsmGoodsId // 商品ID
        purchaseOrder.planQuantity = item.quantity // 计划数量
        purchaseOrder.purchaseQuantity = item.purchaseQuantity // 采购数量
        purchaseOrder.purchasePrice = item.purchasePrice // 采购单价
        purchaseOrder.pemSupplierId = this.supplierId // 供应商ID
        purchaseOrder.sysClinicId = item.sysClinicId // 门店ID

        purchaseOrderArray.push(purchaseOrder)
      })

      return purchaseOrderArray
    },

    /**
     * 提交数据
     */
    submitData () {
      if (this.dataGrid.detailData.length === 0) {
        return
      }

      // 验证汇总数据 与 当前汇总行对应的明细数据是否有效
      if (!this.validateAllGroupRow() || !this.validateAllDetailRow()) {
        return
      }

      // 停止编辑汇总数据 与 当前汇总行对应的明细数据
      this.stopEditAllGroupRow()
      this.stopEditAllDetailRow()

      this.$loading()
      const url = '/chisAPI/purchaseOrder/save'
      let method = 'POST'
      let data = {
        orderJson: JSON.stringify(this.getPurchaseOrder()),
        planIdArrayJson: JSON.stringify(this.getAllGroupDataIdArray())
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
    }

  } // end methods
}
</script>

<style scoped>
</style>
