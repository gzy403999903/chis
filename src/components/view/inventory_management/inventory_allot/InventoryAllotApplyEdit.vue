<template>
  <el-dialog
    class="fullscreen-dialog"
    fullscreen
    :show-close="false"
    :close-on-click-modal="false"
    :visible="visible"
    @closed="dialogClosed">

    <!-- 模态框标题栏与功能按钮-->
    <el-row slot="title">
      <el-col :span="5" style="font-size: 20px;">
        <span>库房调拨单</span>
      </el-col>
      <el-col :span="19" style="text-align: right;">
        <el-button size="mini" icon="el-icon-remove-outline" @click="deleteAllRow">清 空</el-button>
        <el-button size="mini" icon="el-icon-plus" @click="dataGridInsertRow">插入一行</el-button>
        <el-button size="mini" type="primary" icon="el-icon-check" @click="submitData">提 交</el-button>
        <el-button size="mini" type="warning" icon="el-icon-right" @click="dialogCloseConfirm">返 回</el-button>
      </el-col>
    </el-row>

    <!-- 数据表 -->
    <el-table
      :height="$store.getters.dialogDataGridHeight"
      :data="dataGrid.data"
      :row-class-name="dataGridRowClassName"
      @row-dblclick="editRow"
      size="mini">
      <el-table-column fixed="left" type="index" width="40"/>
      <el-table-column fixed="left" label="操作" align="center" width="60">
        <template slot-scope="scope">
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteRow(scope.row)"/>
        </template>
      </el-table-column>
      <el-table-column fixed="left" prop="originalIymInventoryTypeName" label="调出库房" width="150" show-overflow-tooltip>
        <template slot-scope="props">
          <el-select
            v-show="props.row.editable"
            :ref="'originalIymInventoryTypeId' + props.$index"
            v-model="props.row.originalIymInventoryTypeId"
            @change="originalIymInventoryTypeIdChange"
            @keyup.enter.native="validateToNextFocus('originalIymInventoryTypeId','toIymInventoryTypeId' + props.$index)"
            filterable
            default-first-option
            placeholder="请选择"
            size="small">
            <el-option label="药品库" :value="inventoryType.WESTERN_DRUGS_INVENTORY"
                       v-if="inventoryType.WESTERN_DRUGS_INVENTORY !== props.row.toIymInventoryTypeId"/>
            <el-option label="药材库" :value="inventoryType.CHINESE_DRUGS_INVENTORY"
                       v-if="inventoryType.CHINESE_DRUGS_INVENTORY !== props.row.toIymInventoryTypeId"/>
            <el-option label="物资库" :value="inventoryType.HYGIENIC_MATERIAL_INVENTORY"
                       v-if="inventoryType.HYGIENIC_MATERIAL_INVENTORY !== props.row.toIymInventoryTypeId"/>
            <el-option label="退货库" :value="inventoryType.SUBTRACT_INVENTORY"
                       v-if="inventoryType.SUBTRACT_INVENTORY !== props.row.toIymInventoryTypeId"/>
          </el-select>
          <span v-show="!props.row.editable">{{getInventoryTypeName(props.row.originalIymInventoryTypeId)}}</span>
        </template>
      </el-table-column>
      <el-table-column fixed="left" prop="toIymInventoryTypeName" label="调入库房" width="150" show-overflow-tooltip>
        <template slot-scope="props">
          <el-select
            v-show="props.row.editable"
            :ref="'toIymInventoryTypeId' + props.$index"
            v-model="props.row.toIymInventoryTypeId"
            @keyup.enter.native="validateToNextFocus('toIymInventoryTypeId','iymInventoryId' + props.$index)"
            filterable
            default-first-option
            placeholder="请选择"
            size="small">
            <el-option label="药品库" :value="inventoryType.WESTERN_DRUGS_INVENTORY"
                       v-if="inventoryType.WESTERN_DRUGS_INVENTORY !== props.row.originalIymInventoryTypeId"/>
            <el-option label="药材库" :value="inventoryType.CHINESE_DRUGS_INVENTORY"
                       v-if="inventoryType.CHINESE_DRUGS_INVENTORY !== props.row.originalIymInventoryTypeId"/>
            <el-option label="物资库" :value="inventoryType.HYGIENIC_MATERIAL_INVENTORY"
                       v-if="inventoryType.HYGIENIC_MATERIAL_INVENTORY !== props.row.originalIymInventoryTypeId"/>
            <el-option label="退货库" :value="inventoryType.SUBTRACT_INVENTORY"
                       v-if="inventoryType.SUBTRACT_INVENTORY !== props.row.originalIymInventoryTypeId"/>
          </el-select>
          <span v-show="!props.row.editable">{{getInventoryTypeName(props.row.toIymInventoryTypeId)}}</span>
        </template>
      </el-table-column>
      <el-table-column fixed="left" prop="gsmGoodsOid" label="编码" width="120" show-overflow-tooltip/>
      <el-table-column fixed="left" prop="gsmGoodsName" label="商品名称" width="250" show-overflow-tooltip>
        <template slot-scope="props">
          <el-select
            v-show="props.row.editable"
            :ref="'iymInventoryId' + props.$index"
            v-model="props.row.iymInventoryId"
            placeholder="输入 商品名称 / 助记码 搜索"
            :remote-method="queryInventory"
            :loading="selectData.loading"
            remote
            @change="iymInventoryIdChange"
            @keyup.enter.native="dataGridInsertRow"
            filterable
            default-first-option
            size="small">
            <el-option class="custom-el-option" :value="null"  v-if="selectData.inventoryList.length > 0" disabled>
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
            <el-option class="custom-el-option" v-for="item in selectData.inventoryList" :key="item.id" :value="item.id" :label="item.gsmGoodsName">
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
          <span v-show="!props.row.editable">{{props.row.gsmGoodsName}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="goodsUnitsName" label="单位" width="100"/>
      <el-table-column prop="gsmGoodsSpecs" label="规格" width="120" show-overflow-tooltip/>
      <el-table-column prop="quantity" label="调拨数量" width="80" show-overflow-tooltip/>
      <el-table-column prop="ph" label="批号" width="150" show-overflow-tooltip/>
      <el-table-column prop="pch" label="批次号" min-width="150" show-overflow-tooltip/>
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
  }, // end props

  data () {
    return {
      inventoryType: this.$store.getters.inventoryType, // 仓库类型
      dataGrid: {
        data: [],
        currentRow: {},
        index: 0
      },
      selectData: {
        loading: false,
        inventoryList: []
      }
    }
  }, // end data

  methods: {
    /**
     * 界面关闭后执行的操作
     */
    dialogClosed () {
      this.dataGrid.data = []
      this.dataGrid.currentRow = {}
      this.dataGrid.index = 0
      this.selectData.inventoryList = []
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
     * 验证一行是否有效
     * @row 要进行验证的 row
     * @showMsg 是否显示错误消息, 不传参数显示，传任何参数则不显示
     */
    validateRow (row, showMsg) {
      if (!row.originalIymInventoryTypeId || !row.toIymInventoryTypeId || !row.iymInventoryId) {
        if (showMsg === undefined) {
          this.$message.error('当前行尚未完成编辑, 不能进行其他操作')
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
        return item.iymInventoryId === row.iymInventoryId
      })
      return repeatList.length > 1
    },

    /**
     * 将数据行标记对应的颜色
     */
    dataGridRowClassName ({row, rowIndex}) {
      if (this.hasRepeatRow(row)) {
        return 'danger-row'
      }
      if (row.editable) {
        return 'info-row'
      }
      return ''
    },

    /**
     * 向数据表插入一行
     */
    dataGridInsertRow () {
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
      row.originalIymInventoryTypeId = '' // 调出库房
      row.toIymInventoryTypeId = '' // 调入库房
      row.iymInventoryId = '' // 库存记录ID

      // 将新建行行指向当前行
      this.dataGrid.currentRow = row
      // 插入当前行
      this.dataGrid.data.push(this.dataGrid.currentRow)
      // 延迟处理
      setTimeout(() => {
        // 清空已经查询的数据
        this.selectData.inventoryList = []
        // 下一行获取焦点
        this.$refs['originalIymInventoryTypeId' + (this.dataGrid.data.length - 1)].focus()
      }, 100)
    },

    /**
     * 当调出库房发生改变时执行的内容
     */
    originalIymInventoryTypeIdChange () {
      this.selectData.inventoryList = []
      this.dataGrid.currentRow.iymInventoryId = ''
    },

    /**
     * 检索库存
     * 做一个0.5秒的延迟查询, 避免用户输入速度过慢时的频发查询
     * 当查询结果不为0时, 才会有 0.5 秒的延迟查询
     * @param name
     */
    queryInventory (name) {
      if (!this.dataGrid.currentRow.originalIymInventoryTypeId) {
        this.$message.error('请填写调出库房')
        return
      }
      if (name.trim()) {
        this.selectData.loading = true
        setTimeout(() => {
          const url = `/chisAPI/inventory/getClinicPchEnabledLikeByCriteria`
          let params = {
            iymInventoryTypeId: this.dataGrid.currentRow.originalIymInventoryTypeId,
            gsmGoodsName: name
          }
          this.$http.get(url, {params}).then((res) => {
            this.selectData.inventoryList = res.data
            this.selectData.loading = false
          })
        }, (this.selectData.inventoryList ? 0 : 500))
      }
    },

    /**
     * 获取选中的库存信息
     * @param id
     */
    iymInventoryIdChange (id) {
      let row = this.selectData.inventoryList.find(item => {
        return item.id === id
      })

      this.dataGrid.currentRow.gsmGoodsId = row.gsmGoodsId // 商品ID
      this.dataGrid.currentRow.gsmGoodsOid = row.gsmGoodsOid // 商品编码
      this.dataGrid.currentRow.gsmGoodsName = row.gsmGoodsName // 商品名称
      this.dataGrid.currentRow.goodsUnitsName = row.goodsUnitsName // 销售单位
      this.dataGrid.currentRow.gsmGoodsSpecs = row.gsmGoodsSpecs // 商品规格
      this.dataGrid.currentRow.quantity = row.quantity // 数量
      this.dataGrid.currentRow.splitQuantity = row.splitQuantity // 拆分数量
      this.dataGrid.currentRow.ph = row.ph // 批号
      this.dataGrid.currentRow.pch = row.pch // 批次号
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
    dataGridDeleteRow (row) {
      this.dataGrid.data = this.dataGrid.data.filter((item) => {
        return item.id !== row.id
      })
    },

    /**
     * 验证数据
     */
    validateSubmitData () {
      // 删除空行 并验证所有行是否有效
      for (let i = 0; i < this.dataGrid.data.length; i++) {
        let row = this.dataGrid.data[i]
        // 如果 originalIymInventoryTypeId 为空则删除该行
        if (!row.originalIymInventoryTypeId) {
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
     * 获取提交的 JSON 数据
     */
    getSubmitJson () {
      let allotArray = []
      for (let i = 0; i < this.dataGrid.data.length; i++) {
        let row = this.dataGrid.data[i]
        let allot = {}

        allot.originalIymInventoryTypeId = row.originalIymInventoryTypeId
        allot.toIymInventoryTypeId = row.toIymInventoryTypeId
        allot.iymInventoryId = row.iymInventoryId
        allot.gsmGoodsId = row.gsmGoodsId
        allot.ph = row.ph
        allot.pch = row.pch
        allot.splitQuantity = row.splitQuantity
        allot.quantity = row.quantity

        // 保存该条信息
        allotArray.push(allot)
      }

      return JSON.stringify(allotArray)
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
        this.$loading()
        const url = '/chisAPI/inventoryAllot/save'
        let method = 'POST'
        let data = {
          inventoryAllotJson: this.getSubmitJson()
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
