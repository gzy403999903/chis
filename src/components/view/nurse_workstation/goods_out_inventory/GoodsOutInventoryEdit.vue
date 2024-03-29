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
        <span>处方明细</span>
      </el-col>
      <el-col :span="19" style="text-align: right;">
        <el-button size="mini" type="success" plain icon="el-icon-s-promotion" @click="loadInventoryPchList">出 库</el-button>
        <el-button size="mini" type="primary" icon="el-icon-check" @click="submitData">提 交</el-button>
        <el-button size="mini" type="warning" icon="el-icon-right" @click="dialogClose">返 回</el-button>
      </el-col>
    </el-row>

    <!-- 数据表 -->
    <el-table
      :height="$store.getters.dialogDataGridHeight"
      :data="dataGrid.data"
      @row-dblclick="editRow"
      :row-class-name="dataGridRowClassName"
      size="mini">
      <el-table-column fixed="left" type="index" width="50"/>
      <el-table-column fixed="left" label="操作" align="center" width="130">
        <template slot-scope="scope">
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="dataGridDeleteRow(scope.$index, scope.row)"/>
          <el-button size="mini" type="default" plain @click="dataGridSplitRow(scope.$index, scope.row)" :disabled="scope.row.quantity < 2">拆分</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="oid" label="商品编码" width="120" show-overflow-tooltip/>
      <el-table-column prop="name" label="名称" width="150" show-overflow-tooltip/>
      <el-table-column prop="specs" label="规格" width="150" show-overflow-tooltip/>
      <el-table-column prop="retailPrice" label="零售单价" width="100" show-overflow-tooltip/>
      <el-table-column prop="quantity" label="销售数量" width="100" show-overflow-tooltip/>
      <el-table-column prop="unitsName" label="销售单位" width="100" show-overflow-tooltip/>
      <el-table-column prop="ph" label="批号" width="150" show-overflow-tooltip>
        <template slot-scope="props">
          <el-select
            v-if="props.row.editable"
            v-model.trim="props.row.iymInventoryId"
            @change="inventoryChange"
            placeholder="点击选择批号"
            no-data-text="没有可选择的批号"
            filterable
            size="small">
            <el-option class="custom-el-option" :value="null" v-if="selectData.inventoryList.length > 0" disabled>
              <span class="select-option-top" style="width: 100px;">商品编码</span>
              <span class="select-option-top" style="width: 170px;">名称</span>
              <span class="select-option-top" style="width: 150px;">规格</span>
              <span class="select-option-top" style="width: 150px;">批号</span>
              <span class="select-option-top" style="width: 120px;">批次</span>
              <span class="select-option-top" style="width: 100px;">含税进价</span>
              <span class="select-option-top" style="width: 100px;">库存数量</span>
              <span class="select-option-top" style="width: 90px;">有效期至</span>
              <span class="select-option-top" style="width: 100px;">产地</span>
              <span class="select-option-top">生产厂家</span>
            </el-option>
            <el-option class="custom-el-option" v-for="item in selectData.inventoryList" :key="item.id" :value="item.id" :label="item.ph"
                       v-if="item.gsmGoodsId === props.row.entityId && item.splitQuantity === props.row.splitQuantity"><!-- v-if 这个判断很重要 否则会选错库存 -->
              <span class="select-option-text" style="width: 100px;">{{item.gsmGoodsOid}}</span>
              <span class="select-option-text" style="width: 170px;">{{item.gsmGoodsName}}</span>
              <span class="select-option-text" style="width: 150px;">{{item.gsmGoodsSpecs}}</span>
              <span class="select-option-text" style="width: 150px;">{{item.ph}}</span>
              <span class="select-option-text" style="width: 120px;">{{item.pch}}</span>
              <span class="select-option-text" style="width: 100px;">{{item.costPrice}}&nbsp;元</span>
              <span class="select-option-text" style="width: 100px;">{{item.quantity + item.goodsUnitsName}}</span>
              <span class="select-option-text" style="width: 90px;">{{item.expiryDate}}</span>
              <span class="select-option-text" style="width: 100px;">{{item.originName}}</span>
              <span class="select-option-text">{{item.manufacturerName}}</span>
            </el-option>
          </el-select>
          <span v-if="!props.row.editable">{{props.row.ph}}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column prop="pchQuantity" label="可销数量" width="100" show-overflow-tooltip/> -->
      <!-- <el-table-column prop="costPrice" label="含税进价" width="100" show-overflow-tooltip/> -->
      <el-table-column prop="expiryDate" label="有效期至" min-width="120" show-overflow-tooltip/>
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
    prescriptionLsh: {
      type: String,
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
      payload: jwtDecode(this.$store.getters.token),
      dataGrid: {
        data: [],
        currentRow: {}
      },
      selectData: {
        inventoryList: []
      }
    }
  }, // end data

  methods: {
    /**
     * 界面打开后执行的操作
     */
    dialogOpened () {
      // 根据流水号获取对应的处方
      if (this.prescriptionLsh) {
        this.loadPrescriptionDetail()
      }
    },

    /**
     * 界面关闭后执行的操作
     */
    dialogClosed () {
      this.dataGrid.data = []
      this.dataGrid.currentRow = {}
      this.selectData.inventoryList = []
    },

    /**
     * 为数据行添加样式
     */
    dataGridRowClassName ({row, rowIndex}) {
      if (row.editable) {
        return 'info-row'
      }
      if (!row.iymInventoryId) {
        return 'warning-row'
      }
      return ''
    },

    /**
     * 载入处方明细
     */
    loadPrescriptionDetail () {
      this.$loading()
      const url = '/chisAPI/sellRecord/getClinicListByPrescriptionLshFromCache'
      const params = {
        prescriptionLsh: this.prescriptionLsh
      }
      this.$http.get(url, {params}).then(res => {
        if (res.data.code === 200) {
          // 设置行的编辑状态
          res.data.resultSet.list.forEach(item => {
            item.editable = false
          })
          // 进行载入
          this.dataGrid.data = res.data.resultSet.list
        } else {
          this.$message.error(res.data.msg)
        }
        this.$loading().close()
      })
    },

    /**
     * 获取对应的库存批次
     * [从前台获取, 从后台获取后无法手动选取]
     */
    loadInventoryPchList () {
      let gsmGoodsIdList = this.dataGrid.data.map(item => item.entityId)
      if (gsmGoodsIdList.length === 0) {
        return
      }

      this.$loading()
      const url = `/chisAPI/inventory/getClinicPchListByGoodsIdList`
      let params = {
        gsmGoodsIdListJson: JSON.stringify(gsmGoodsIdList)
      }
      this.$http.get(url, {params}).then((res) => {
        if (res.data.code === 200) {
          this.$message.success('加载库存信息完毕')
          this.selectData.inventoryList = res.data.resultSet.list
          // 匹配库存
          this.matchInventoryPch()
        } else {
          this.$message.error(res.data.msg)
        }
        this.$loading().close()
      })
    },

    /**
     * 匹配库存
     */
    matchInventoryPch () {
      // 开始遍历所有处方信息
      this.dataGrid.data.forEach(row => {
        // 通过商品ID 获取对应 pch 信息
        let inventoryList = this.selectData.inventoryList.filter(inventory => inventory.gsmGoodsId === row.entityId)
        // 遍历获取的到库存信息, 一但拆分基数相同 且 库存数量大于等于销售数量则进行匹配
        for (let i = 0; i < inventoryList.length; i++) {
          let inventory = inventoryList[i]
          if (inventory.splitQuantity === row.splitQuantity && inventory.quantity >= row.quantity) {
            this.copyInventoryToRow(row, inventory)
            break
          }
        }
      })
    },

    /**
     * 当选中的库存信息发生改变时执行的操作
     * @param id
     */
    inventoryChange (id) {
      // 获取选中的批次库存
      let inventory = this.selectData.inventoryList.find(item => {
        return item.id === id
      })
      // 进行匹配操作, 交由行验证器验证该行是否有效
      this.copyInventoryToRow(this.dataGrid.currentRow, inventory)
      // 如果当前行有效则停止编辑该行
      if (this.dataGridValidateRow(this.dataGrid.currentRow)) {
        this.dataGrid.currentRow.editable = false
      }
    },

    /**
     * 将库存信息赋值到对应的数据行
     */
    copyInventoryToRow (row, inventory) {
      row.gsmGoodsId = inventory.gsmGoodsId // 商品ID * 用于比对销售商品ID与出库商品ID是否一致
      row.purchaseTaxRate = inventory.purchaseTaxRate // 采购税率
      row.sellTaxRate = inventory.sellTaxRate // 销售税率
      row.lossable = inventory.lossable // 是否倒挂品种
      row.iymInventoryId = inventory.id // 库存ID
      row.ph = inventory.ph // 批号
      row.pch = inventory.pch // 批次号
      row.pchSplitQuantity = inventory.splitQuantity // 库存拆分数量 * 用于比对销售单位是否相同
      row.pchQuantity = inventory.quantity // 库存数量(可销数量) * 用于显示库存数量
      row.costPrice = inventory.costPrice // 成本价
      row.producedDate = inventory.producedDate // 生产日期
      row.expiryDate = inventory.expiryDate // 有效期至
      row.pemSupplierId = inventory.pemSupplierId // 供应商ID
      row.iymInventoryAddId = inventory.iymInventoryAddId // 入库记录ID
      row.operatorId = this.payload.userId // 出库人ID
    },

    /**
     * 双击编辑一行
     */
    editRow (row) {
      // 如果目标行在编辑状态则不继续执行
      if (row.editable) {
        return
      }

      // 验证当前行是否有效
      if (!this.dataGridValidateRow(this.dataGrid.currentRow)) {
        return
      }

      if (this.selectData.inventoryList.length === 0) {
        this.$message.warning('请点击 出库 按钮获取商品库存信息, 如果您已为商品指定了批号, 该批号会被系统重新指定')
        return
      }

      // 停止编辑当前行
      this.dataGrid.currentRow.editable = false
      // 设置目标行为当前行
      this.dataGrid.currentRow = row
      // 开启当前行编辑
      this.dataGrid.currentRow.editable = true
    },

    /**
     * 验证一行是否有效
     * @param row
     */
    dataGridValidateRow (row) {
      // 如果尚未指定库存则不进行验证
      if (!row.iymInventoryId) {
        return true
      }

      if (row.entityId !== row.gsmGoodsId) {
        this.$message.error('【' + row.oid + ' ' + row.name + '】' + '销售商品与出库商品不一致')
        return false
      }

      if (this.hasRepeatRow(row)) {
        this.$message.error('【' + row.oid + ' ' + row.name + '】' + '不能重复使用同一个批次号')
        return false
      }

      if (row.pchSplitQuantity && (row.pchSplitQuantity !== row.splitQuantity)) {
        this.$message.error('【' + row.oid + ' ' + row.name + '】' + '销售单位不符')
        return false
      }

      if (row.quantity > row.pchQuantity) {
        this.$message.error('【' + row.oid + ' ' + row.name + '】' + ' 批号: ' + row.ph + ' 可销数量不足')
        return false
      }

      if (new Date(row.expiryDate) < new Date()) {
        this.$message.error('【' + row.oid + ' ' + row.name + '】' + '批号商品已过期')
        return false
      }

      return true
    },

    /**
     * 验证是否重复录入
     * @param row
     */
    hasRepeatRow (row) {
      let repeatList = this.dataGrid.data.filter(item => {
        return item.iymInventoryId === row.iymInventoryId
      })
      return repeatList.length > 1
    },

    /**
     * 拆分一行
     */
    dataGridSplitRow (index, row) {
      if (!row.editable) {
        this.$message.error('拆分行需要在编辑状态, 双击一行开启编辑')
        return
      }

      // 开启一行编辑
      this.editRow(row)
      // 进行拆分
      this.$prompt('', '请输入拆分数量', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        closeOnClickModal: false,
        showClose: false,
        inputType: 'text',
        inputValidator: this.dataGridSplitRowValidator,
        inputErrorMessage: ''
      }).then(({ value }) => {
        // 复制一行
        let copyRow = {}
        for (let key in row) {
          if (row.hasOwnProperty(key)) {
            copyRow[key] = row[key]
          }
        }

        // 更新当前行(开启当前行编辑操作已将该行设置为当前行)
        row.quantity = row.quantity - value
        // 初始化拆分行属性
        copyRow.editable = false
        copyRow.quantity = value
        copyRow.iymInventoryId = ''
        copyRow.ph = ''
        copyRow.pch = ''
        copyRow.pchQuantity = ''
        copyRow.costPrice = ''
        copyRow.producedDate = ''
        copyRow.expiryDate = ''
        copyRow.pemSupplierId = ''
        copyRow.iymInventoryAddId = ''

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

      // 获取当前行
      let row = this.dataGrid.currentRow
      if (value < 1 || value > (row.quantity - 1)) {
        return '拆分数量最小值为 1 且不能大于 ' + (row.quantity - 1)
      }
    },

    /**
     * 删除一行
     * @param index
     * @param row
     */
    dataGridDeleteRow (index, row) {
      this.dataGrid.data = this.dataGrid.data.filter((item, i) => {
        return i !== index
      })
    },

    /**
     * 提交数据
     */
    submitData () {
      // 检查是否有可提交数据
      if (this.dataGrid.data.length === 0) {
        return
      }

      // 验证每行是否有效
      for (let i = 0; i < this.dataGrid.data.length; i++) {
        let row = this.dataGrid.data[i]

        // 判断该行是否批号为空
        if (!row.iymInventoryId) {
          this.$message.error('【' + row.oid + ' ' + row.name + '】' + '未指定批号')
          return
        }

        // 验证当前行是否有效
        if (!this.dataGridValidateRow(row)) {
          return
        }
      }

      // 停止当前行编辑
      this.dataGrid.currentRow.editable = false

      // 提交数据
      this.$loading()
      const url = '/chisAPI/sellRecord/saveOrUpdateToCache'
      const method = 'POST'
      let data = {
        sellRecordJson: JSON.stringify(this.dataGrid.data)
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
    }

  } // end methods
}
</script>

<style scoped>
</style>
