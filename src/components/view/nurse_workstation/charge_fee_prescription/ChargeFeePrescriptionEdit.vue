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
        <span>消费明细</span>
      </el-col>
      <el-col :span="19" style="text-align: right;">
        <span style="border: white 1px dashed; padding: 12px 10px; margin-right: 5px;">
          <span style="padding-right: 10px; font-size: 14px; font-weight: 600;">按处方选取打折明细</span>
          <el-switch style="padding-right: 20px;" v-model="selectPrescription" active-color="#13ce66" inactive-color="#ff4949"/>
        </span>
        <span style="border: white 1px dashed; padding: 12px 10px; margin-right: 5px;">
          <span style="padding-right: 10px; font-size: 14px; font-weight: 600;">折扣率</span>
          <el-input-number size="mini" v-model="discountRate" :controls="false" :max="99" :min="0" :precision="0"
                           @change="discountRateChange"
                           style="width: 100px; margin-right: -2px;"/>
          <el-button size="mini" type="success" plain icon="el-icon-discount" @click="discountSelectedData">打 折</el-button>
          <el-button size="mini" type="default" plain icon="el-icon-user" :disabled="true">打折申请</el-button>
        </span>
        <el-button size="mini" type="success" plain icon="el-icon-s-promotion" @click="payDialogOpen">结 算</el-button>
        <el-button size="mini" type="warning" icon="el-icon-right" @click="dialogClose">返 回</el-button>
      </el-col>
    </el-row>

    <!-- 商品处方 -->
    <el-table
      :height="$store.getters.dialogDataGridHeight-35"
      ref="prescriptionTable"
      :data="dataGrid.data"
      @row-dblclick="dataGridEditRow"
      @cell-mouse-enter="dataGridCellMouseEnter"
      @cell-mouse-leave="dataGridCellMouseLeave"
      @select="dataGridSelect"
      @selection-change="dataGridSelectChange"
      :row-class-name="dataGridRowClassName"
      size="mini">
      <el-table-column fixed="left" type="index" width="55"/>
      <el-table-column fixed="left" type="selection" :selectable="tableSelectable" width="55"/>
      <el-table-column prop="dwtSellPrescriptionLsh" label="处方流水号" width="220" show-overflow-tooltip sortable/>
      <el-table-column prop="sysSellTypeId" label="销售类型" width="100" :formatter="sellTypeFormatter" show-overflow-tooltip sortable/>
      <el-table-column prop="oid" label="编码" width="120" show-overflow-tooltip/>
      <el-table-column prop="name" label="名称" width="150" show-overflow-tooltip sortable/>
      <el-table-column prop="specs" label="规格" width="150" show-overflow-tooltip/>
      <el-table-column prop="costPrice" label="含税进价" width="100" show-overflow-tooltip>
        <template slot-scope="props">
          <span v-show="props.row.showCostPrice">{{props.row.costPrice}}</span>
          <span v-show="!props.row.showCostPrice">***</span>
        </template>
      </el-table-column>
      <el-table-column prop="retailPrice" label="零售单价" width="100" show-overflow-tooltip/>
      <!--<el-table-column prop="memberRetailPrice" label="会员折后价" width="100" show-overflow-tooltip/>-->
      <el-table-column prop="actualRetailPrice" label="实收单价" width="120" show-overflow-tooltip>
        <template slot-scope="props">
          <el-input-number size="small" v-model="props.row.actualRetailPrice" :controls="false" :max="30000" :min="0" :precision="4"
                           v-show="props.row.editable"
                           @change="dataGridStopRow"/>
          <span v-show="!props.row.editable">
            <span v-if="props.row.actualRetailPrice < props.row.retailPrice" style="color: #67C23A;">{{props.row.actualRetailPrice}}</span>
            <span v-else>{{props.row.actualRetailPrice}}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="quantity" label="销售数量" width="100" show-overflow-tooltip/>
      <el-table-column prop="unitsName" label="销售单位" width="100" show-overflow-tooltip/>
      <el-table-column prop="rowPrice" label="小计/元" min-width="100" show-overflow-tooltip>
        <template slot-scope="props">
          {{(props.row.quantity * props.row.actualRetailPrice).toFixed(4)}}
        </template>
      </el-table-column>
    </el-table>
    <div class="total-price">
      应收合计:&nbsp;{{totalPrice}}&nbsp;元
    </div>

    <!-- 支付界面 -->
    <ChargeFeePrescriptionPay :visible="dialog.visible" :mrmMemberId="mrmMemberId"
                              :totalPrice="totalPrice" :sellRecordList="dataGrid.data"
                              :dialogClose="payDialogClose" :allDialogClose="allDialogClose"
                              :dataGridLoadData="dataGridLoadData"/>

  </el-dialog>
</template>

<script>
import ChargeFeePrescriptionPay from './ChargeFeePrescriptionPay'
export default {
  components: {
    ChargeFeePrescriptionPay
  },

  props: {
    visible: {
      type: Boolean,
      required: true
    },
    mrmMemberId: {
      type: Number,
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
      sellType: this.$store.getters.sellType,
      selectPrescription: true, // 按处方选取打折明细
      discountRate: 0, // 折扣率
      totalPrice: 0, // 合计收费金额
      dataGrid: {
        data: [],
        currentRow: {},
        selectedData: []
      },
      dialog: {
        visible: false
      }
    }
  }, // end data

  methods: {
    /**
     * 界面打开后执行的操作
     */
    dialogOpened () {
      // 根据流水号获取对应的处方
      if (this.mrmMemberId) {
        this.loadSellRecordDetail()
      } else {
        this.$message.error('未能获取会员ID')
      }
    },

    /**
     * 界面关闭后执行的操作
     */
    dialogClosed () {
      this.dataGrid.data = []
      this.dataGrid.currentRow = {}
      this.dataGrid.selectedData = []
      this.discountRate = 0
      this.totalPrice = 0
    },

    /**
     * 为数据行添加样式
     */
    dataGridRowClassName ({row, rowIndex}) {
      if (row.editable) {
        return 'info-row'
      }
      if (!this.hasIymInventoryId(row)) {
        return 'warning-row'
      }
      return ''
    },

    /**
     * 设置选择框是否可选
     */
    tableSelectable (row, rowIndex) {
      return this.hasIymInventoryId(row)
    },

    /**
     * 鼠标进入监听
     */
    dataGridCellMouseEnter (row, column, cell, event) {
      if (column.property === 'costPrice') {
        row.showCostPrice = true
      }
    },

    /**
     * 鼠标退出监听
     */
    dataGridCellMouseLeave (row, column, cell, event) {
      if (column.property === 'costPrice') {
        row.showCostPrice = false
      }
    },

    /**
     * 格式化销售类型
     */
    sellTypeFormatter (row, column, cellValue, index) {
      if (cellValue === this.sellType.GOODS) {
        return '商品'
      }
      if (cellValue === this.sellType.ITEM) {
        return '收费项目'
      }
      return '未知'
    },

    /**
     * 载入处方明细
     */
    loadSellRecordDetail () {
      this.$loading()
      const url = '/chisAPI/sellRecord/getClinicListByMrmMemberIdFromCache'
      const params = {
        mrmMemberId: this.mrmMemberId
      }
      this.$http.get(url, {params}).then(res => {
        if (res.data.code === 200) {
          // 向返回数据添加属性
          res.data.resultSet.list.forEach(item => {
            item.editable = false // 设置该行编辑属性
            item.showCostPrice = false // 设置该行显示成本价属性
          })
          // 进行载入
          this.dataGrid.data = res.data.resultSet.list
          // 计算合计实收金额
          this.sumActualRetailPrice()
        } else {
          this.$message.error(res.data.msg)
        }
        this.$loading().close()
      })
    },

    /**
     * 双击开启编辑一行
     * @param row
     */
    dataGridEditRow (row) {
      // 如果目标行在编辑状态则不继续执行
      if (row.editable) {
        return
      }

      // 如果当前行为空则设置操作行为当前行(判断 id 属性不为 undefined, 不能是用 null 或逻辑非判断, 因为 id 本来就没值)
      if (this.dataGrid.currentRow.id === undefined) {
        this.dataGrid.currentRow = row
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
     * 停止编辑一行
     */
    dataGridStopRow () {
      // 验证当前行是否有效
      if (this.dataGridValidateRow(this.dataGrid.currentRow)) {
        // 停止编辑该行
        this.dataGrid.currentRow.editable = false
        // 计算实收合计金额
        this.sumActualRetailPrice()
      }
    },

    /**
     * 验证一行是否有效
     */
    dataGridValidateRow (row) {
      // 验证是否出库
      if (!this.hasIymInventoryId(row)) {
        this.$message.error('【' + row.oid + ' ' + row.name + '】 商品未出库')
        return false
      }

      // 判断实收单价是否为空
      if (parseFloat(row.actualRetailPrice).toString() === 'NaN') {
        this.$message.error('【' + row.oid + ' ' + row.name + '】 实收单价不能为空')
        return false
      }

      // 判断实收单价是否大于零售单价
      if (row.actualRetailPrice > row.retailPrice) {
        this.$message.error('【' + row.oid + ' ' + row.name + '】 实收单价不能大于零售单价:' + row.retailPrice)
        return false
      }

      // 判断是否可打折
      if (!row.discountable && (row.actualRetailPrice < row.retailPrice)) {
        this.$message.error('【' + row.oid + ' ' + row.name + '】 该商品不能打折')
        return false
      }

      // 判断商品是否低于成本价
      if ((row.sysSellTypeId === this.sellType.GOODS) &&
          (!row.lossable) &&
          (row.actualRetailPrice < row.costPrice)) {
        this.$message.error('【' + row.oid + ' ' + row.name + '】 实收单价不能低于成本价:' + row.costPrice)
        return false
      }

      return true
    },

    /**
     * 检查是否已做出库操作
     */
    hasIymInventoryId (row) {
      // 如果销售类型为 商品, 则判断是否有库存ID, 否则返回  true
      if (row.sysSellTypeId === this.sellType.GOODS) {
        return row.iymInventoryId
      } else {
        return true
      }
    },

    /**
     * 计算列的合计金额
     * @param param
     * @returns {Array}
     */
    sumActualRetailPrice () {
      this.totalPrice = 0
      this.dataGrid.data.forEach(item => {
        if (item.quantity && item.actualRetailPrice) {
          this.totalPrice += item.quantity * item.actualRetailPrice
        }
      })
      this.totalPrice = this.totalPrice.toFixed(2) * 1
    },

    /* -------------------------------------------------------------------------------------------------------------- */
    /**
     * 当用户选择一行时执行的操作
     */
    dataGridSelect (selection, row) {
      // 判断当前选择方式是否为处方选取
      if (this.selectPrescription) {
        // 判断当前行的选中状态
        let selected = selection.length === 0 ? false : selection.indexOf(row) !== -1
        // 遍历数据统一统一处方的选中状态
        this.dataGrid.data.forEach(item => {
          if (row.dwtSellPrescriptionLsh === item.dwtSellPrescriptionLsh) {
            this.$refs.prescriptionTable.toggleRowSelection(item, selected)
          }
        })
      }
    },

    /**
     * 当数据行选取行发生变化时执行的操作
     */
    dataGridSelectChange (selection) {
      this.dataGrid.selectedData = selection
    },

    /**
     * 当折扣率发生改变时执行的内容
     */
    discountRateChange () {
      this.discountSelectedData()
    },

    /**
     * 选中行打折
     */
    discountSelectedData () {
      // 判断是否有打折的明细
      if (this.dataGrid.selectedData.length === 0) {
        this.$message.error('请选择要进行折扣的明细')
        return
      }

      // 判断折扣率是否合法
      if (!this.discountRate) {
        this.$message.error('折扣率为 [1 - 99]')
        return
      }

      // 计算折扣后的实收金额
      this.dataGrid.selectedData.forEach(row => {
        if (row.discountable) {
          const discountPrice = row.retailPrice * (this.discountRate < 10 ? (this.discountRate / 10) : (this.discountRate / 100))
          if ((discountPrice > row.costPrice) || row.lossable) {
            row.actualRetailPrice = discountPrice.toFixed(4)
          }
        }
      })

      // 重新计算合计金额
      this.sumActualRetailPrice()
      this.$message.success('打折已完成')
    },

    /* -------------------------------------------------------------------------------------------------------------- */
    /**
     * 打开收款界面
     */
    payDialogOpen () {
      if (this.dataGrid.data.length === 0) {
        return
      }
      // 验证所有行是否有效
      if (!this.dataGrid.data.every(row => this.dataGridValidateRow(row))) {
        return
      }

      // 停止当前行编辑
      this.dataGrid.currentRow.editable = false
      // 重新计算合计金额
      this.sumActualRetailPrice()

      // 验证合计金额是否有效
      if ((!Number(this.totalPrice) || this.totalPrice < 0) && this.totalPrice !== 0) {
        this.$message.error('应收金额无效')
        return
      }

      // 打开收款界面
      this.dialog.visible = true
    },

    /**
     * 关闭收款界面
     */
    payDialogClose () {
      this.dialog.visible = false
    },

    /**
     * 关闭收费明细和收款界面
     */
    allDialogClose () {
      this.payDialogClose()
      this.dialogClose()
    }

  } // end methods
}
</script>

<style scoped>
  .total-price {
    line-height: 35px;
    text-align: right;
    padding-right: 15px;
    font-size: 18px;
    font-weight: 600;
    color: #F56C6C;
  }
</style>
