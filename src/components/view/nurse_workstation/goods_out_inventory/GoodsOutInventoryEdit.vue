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
        <el-button size="mini" type="default" plain icon="el-icon-plus" @click="mergeRows">合并拆分行</el-button>
        <el-button size="mini" type="success" plain icon="el-icon-s-check" @click="submitData">审 核</el-button>
        <el-button size="mini" type="warning" icon="el-icon-right" @click="dialogClose">返 回</el-button>
      </el-col>
    </el-row>

    <!-- 数据表 -->
    <el-table
      :height="$store.getters.dialogDataGridHeight"
      :data="dataGrid.data"
      @row-dblclick="editRow"
      @selection-change="tableSelectionChange"
      :row-class-name="dataGridRowClassName"
      size="mini">
      <el-table-column fixed="left" type="index" width="50"/>
      <el-table-column fixed="left" type="selection" width="55"/>
      <el-table-column fixed="left" label="操作" align="center" width="130">
        <template slot-scope="scope">
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="dataGridDeleteRow(scope.$index, scope.row)"/>
          <el-button size="mini" type="default" plain @click="dataGridSplitRow(scope.$index, scope.row)" :disabled="scope.row.quantity < 2">拆 分</el-button>
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
        currentRow: {},
        selectedData: []
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
    async dialogOpened () {
      // 根据流水号获取对应的处方和库存
      if (this.prescriptionLsh) {
        this.$loading()
        let goodsData = await this.loadPrescriptionDetail()
        await this.loadInventoryPchList(goodsData)
        this.matchInventoryPch(goodsData)
        this.$loading().close()
      }
    },

    /**
     * 界面关闭后执行的操作
     */
    dialogClosed () {
      this.dataGrid.data = []
      this.dataGrid.currentRow = {}
      this.dataGrid.selectedData = []
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
    async loadPrescriptionDetail () {
      let goodsData = []
      const url = '/chisAPI/sellRecord/getClinicListByPrescriptionLshFromCache'
      const params = {
        prescriptionLsh: this.prescriptionLsh
      }

      await this.$http.get(url, {params}).then(res => {
        if (res.data.code === 200) {
          // 设置行的编辑属性
          res.data.resultSet.list.forEach(item => {
            item.editable = false
          })
          // 载入对应的库存信息
          goodsData = res.data.resultSet.list
        }
      })
      return goodsData
    },

    /**
     * 获取对应的库存批次
     * [从前台获取, 从后台获取后无法手动选取]
     */
    async loadInventoryPchList (goodsData) {
      if (goodsData.length === 0) {
        return
      }
      // 获取商品ID集合
      let gsmGoodsIdList = goodsData.map(item => item.entityId)

      const url = `/chisAPI/inventory/getClinicPchListByGoodsIdList`
      let params = {
        gsmGoodsIdListJson: JSON.stringify(gsmGoodsIdList)
      }

      await this.$http.get(url, {params}).then((res) => {
        if (res.data.code === 200) {
          this.selectData.inventoryList = res.data.resultSet.list
        }
      })
    },

    /**
     * 匹配批次号
     */
    matchInventoryPch (goodsData) {
      // 清空 data, 防止重复 push
      this.dataGrid.data = []

      // 遍历销售商品匹配批次库存
      for (let i = 0; i < goodsData.length; i++) {
        // 获取当前销售商品
        let goods = goodsData[i]

        // 获取与当前销售商品一致的批次库存
        let pchData = this.selectData.inventoryList.filter(inventory =>
          inventory.gsmGoodsId === goods.entityId && inventory.splitQuantity === goods.splitQuantity
        )

        // 如果没有获取到库存直接创建该行
        if (pchData.length === 0) {
          this.dataGrid.data.push(goods)
          continue
        }

        // 如果获取到批次库存则按要求进行创建数据行
        for (let j = 0; j < pchData.length; j++) {
          // 获取当前批次库存
          let pch = pchData[j]
          // 获取匹配后剩余的批次库存数量 (当前批次库存数量 - 销售数量)
          let residuePchQuantity = pch.quantity - goods.quantity

          // 如果剩余批次数量 大于等于 0
          if (residuePchQuantity >= 0) {
            this.matchInventoryPchQuantity(goods, pch)
            this.dataGrid.data.push(goods)
            break
          }

          // 如果剩余批次数量 小于 0
          if (residuePchQuantity < 0) {
            // 使用浅拷贝复制一行, 不能直接使用 goods.quantity = pch.quantity 然后 push(goods)
            let pushGoods = {...goods}
            pushGoods.quantity = pch.quantity
            this.matchInventoryPchQuantity(pushGoods, pch)
            this.dataGrid.data.push(pushGoods)
            goods.quantity = Math.abs(residuePchQuantity) // 将当前商品的销售数量设置为 创建一行后剩余的数量
          }

          // 如果当前为最后一个批次库存, 并且剩余批次库存的数量小于 0, 则继续创建一行
          if (j === (pchData.length - 1) && residuePchQuantity < 0) {
            this.dataGrid.data.push(goods)
          }
        } // end for j
      } // end for i
    },

    /**
     * 匹配批次库存数量
     */
    matchInventoryPchQuantity (row, inventory) {
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
      row.firstCostPrice = inventory.firstCostPrice // 一成本价
      row.secondCostPrice = inventory.secondCostPrice // 二成本价
      row.producedDate = inventory.producedDate // 生产日期
      row.expiryDate = inventory.expiryDate // 有效期至
      row.pemSupplierId = inventory.pemSupplierId // 供应商ID
      row.iymInventoryAddId = inventory.iymInventoryAddId // 入库记录ID
      row.operatorId = this.payload.userId // 出库人ID
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
      // 匹配库存
      this.matchInventoryPchQuantity(this.dataGrid.currentRow, inventory)
      // 如果当前行有效则停止编辑该行
      if (this.dataGridValidateRow(this.dataGrid.currentRow)) {
        this.dataGrid.currentRow.editable = false
      }
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
        this.$message.error('【' + row.oid + ' ' + row.name + '】销售商品与出库商品不一致')
        return false
      }

      if (row.pchSplitQuantity && (row.pchSplitQuantity !== row.splitQuantity)) {
        this.$message.error('【' + row.oid + ' ' + row.name + '】销售单位不符')
        return false
      }

      if (row.quantity > row.pchQuantity) {
        this.$message.error('【' + row.oid + ' ' + row.name + '】' + ' 批号: ' + row.ph + ' 可销数量不足')
        return false
      }

      if (new Date(row.expiryDate) < new Date()) {
        this.$message.error('【' + row.oid + ' ' + row.name + '】商品批号已过期')
        return false
      }

      if (this.hasRepeatRow(row)) {
        this.$message.error('【' + row.oid + ' ' + row.name + '】不能重复使用同一个批次号')
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
        // 更新当前行数量(开启编辑后 row 指向 this.dataGrid.currentRow)
        row.quantity = row.quantity - value
        // 复制一行
        let copyRow = {...row}
        // 初始化拆分行属性
        copyRow.editable = false
        copyRow.quantity = value
        copyRow.iymInventoryId = ''
        copyRow.ph = ''
        copyRow.pch = ''
        copyRow.pchQuantity = ''
        copyRow.costPrice = ''
        copyRow.firstCostPrice = ''
        copyRow.secondCostPrice = ''
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
      // 设置当前行
      this.dataGrid.currentRow = this.dataGrid.data[this.dataGrid.data.length - 1]
    },

    /**
     * 当勾选发生改变时执行的操作
     * @param selection
     */
    tableSelectionChange (selection) {
      this.dataGrid.selectedData = selection
    },

    /**
     * 合并行
     */
    mergeRows () {
      let rows = this.dataGrid.selectedData
      if (rows.length < 2) {
        this.$message.error('至少勾选两行才能进行合并操作')
        return
      }

      for (let i = 0; i < rows.length; i++) {
        if (rows[0].entityId !== rows[i].entityId || rows[0].splitQuantity !== rows[i].splitQuantity) {
          this.$message.error('非同一商品不能进行合并操作')
          return
        }
      }

      // 为所有数据行添加唯一行号以便进行删除操作
      this.dataGrid.data.forEach((row, index) => {
        row.index = index
      })

      // 累加数量到第一行 并 删除除第一行以外的合并行
      for (let i = 1; i < rows.length; i++) {
        rows[0].quantity += rows[i].quantity
        this.dataGrid.data = this.dataGrid.data.filter(row => row.index !== rows[i].index)
      }
      // 设置当前行
      this.dataGrid.currentRow = this.dataGrid.data[this.dataGrid.data.length - 1]
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
          this.$loading().close()
        }
      })
    }

  } // end methods
}
</script>

<style scoped>
</style>
