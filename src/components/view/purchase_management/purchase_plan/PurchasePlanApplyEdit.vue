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
        <span>添加采购计划</span>
      </el-col>
      <el-col :span="19" style="text-align: right;">
        <span style="font-size: 14px; font-weight: 900; padding-right: 10px;">采购计划类型</span>
        <el-select v-model="planDays" placeholder="请选择" size="mini" style="width: 150px; padding-right: 10px;">
          <el-option label="临时采购计划" :value="0"/>
          <el-option label="7天采购计划"  :value="7"/>
          <el-option label="15天采购计划" :value="15"/>
          <el-option label="28天采购计划" :value="28"/>
          <el-option label="35天采购计划" :value="35"/>
        </el-select>
        <el-button size="mini" type="default" icon="el-icon-position" @click="dataGridDoPlan">执行采购计划</el-button>
        <el-button size="mini" type="default" icon="el-icon-circle-plus-outline" @click="dataGridAppendRow">插入一行</el-button>
        <el-button size="mini" type="default" icon="el-icon-remove-outline" @click="deleteAllRow">清空计划</el-button>
        <el-button size="mini" type="primary" icon="el-icon-check" @click="submitData">提 交</el-button>
        <el-button size="mini" type="warning" icon="el-icon-right" @click="dialogCloseConfirm">返 回</el-button>
      </el-col>
    </el-row>

    <!-- 数据表 -->
    <el-table
      :height="$store.getters.dialogDataGridHeight"
      :data="dataGrid.data"
      :row-class-name="dataGridRowClassName"
      @row-dblclick="dataGridEditRow"
      size="mini">
      <el-table-column fixed="left" type="index" width="40"/>
      <el-table-column fixed="left" label="操作" align="center" width="70">
        <template slot-scope="scope">
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteRow(scope.row)"/>
        </template>
      </el-table-column>
      <el-table-column fixed="left" prop="gsmGoodsTypeName" label="商品类型" width="110" show-overflow-tooltip/>
      <el-table-column fixed="left" prop="oid" label="商品ID" width="100" show-overflow-tooltip/>
      <el-table-column fixed="left" prop="name" label="通用名" min-width="250" show-overflow-tooltip>
        <template slot-scope="props">
          <el-select
            v-show="props.row.editable"
            :ref="'id' + props.$index"
            @keyup.enter.native="dataGridValidateFieldToNextFocus('id', ('quantity' + props.$index))"
            v-model.trim="props.row.id"
            placeholder="输入 商品名称 / 助记码 搜索"
            :remote-method="dataGridQueryGoodses"
            :loading="selectData.loading"
            remote
            filterable
            size="small"
            @change="dataGridGoodsChange">
            <el-option class="custom-el-option" :value="null" v-if="selectData.goodses.length > 0" disabled>
              <span class="select-option-top" style="width: 120px;">商品编码</span>
              <span class="select-option-top" style="width: 200px;">商品名称</span>
              <span class="select-option-top" style="width: 100px;">单位</span>
              <span class="select-option-top" style="width: 150px;">规格</span>
              <span class="select-option-top" style="width: 100px;">零售单价(元)</span>
              <span class="select-option-top" style="width: 100px;">产地</span>
              <span class="select-option-top">生产厂家</span>
            </el-option>
            <el-option class="custom-el-option" v-for="item in selectData.goodses" :key="item.id" :value="item.id" :label="item.name">
              <span class="select-option-text" style="width: 120px;">{{item.oid}}</span>
              <span class="select-option-text" style="width: 200px;">{{item.name}}</span>
              <span class="select-option-text" style="width: 100px;">{{item.goodsUnitsName}}</span>
              <span class="select-option-text" style="width: 150px;">{{item.specs}}</span>
              <span class="select-option-text" style="width: 100px;">{{item.retailPrice}}</span>
              <span class="select-option-text" style="width: 100px;">{{item.originName}}</span>
              <span class="select-option-text">{{item.manufacturerName}}</span>
            </el-option>
          </el-select>
          <span v-show="!props.row.editable">{{props.row.name}}</span>
        </template>
      </el-table-column>
      <el-table-column fixed="left" prop="goodsUnitsName" label="单位" width="100" show-overflow-tooltip/>
      <el-table-column fixed="left" prop="specs" label="规格" width="150" show-overflow-tooltip/>
      <el-table-column fixed="left" prop="quantity" label="计划数量" width="100">
        <template slot-scope="props">
          <el-input-number size="small" v-model="props.row.quantity" :controls="false" :max="30000" :min="1" :precision="0"
                           v-show="props.row.editable"
                           :ref="'quantity' + props.$index"
                           @keyup.enter.native="dataGridAppendRow"/>
          <span v-show="!props.row.editable">{{props.row.quantity}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="minPurchaseQuantity" label="购进基数" width="100" show-overflow-tooltip/>
      <el-table-column prop="recommendQuantity" label="建议数量" width="100" show-overflow-tooltip/>
      <el-table-column prop="inventoryQuantity" label="库存数量" width="100" show-overflow-tooltip/>
      <el-table-column prop="originName" label="产地" width="150" show-overflow-tooltip/>
      <el-table-column prop="manufacturerName" label="生产厂家" width="250" show-overflow-tooltip/>
      <el-table-column prop="sellQuantity" :label="planDays + '天销量'" width="100" show-overflow-tooltip/>
      <el-table-column prop="sellFrequency" label="销售频次" width="100" show-overflow-tooltip/>
      <el-table-column prop="maxQuantity" label="单次最大销售数量" width="150" show-overflow-tooltip/>
      <el-table-column prop="minQuantity" label="单次最销销售数量" min-width="150" show-overflow-tooltip/>
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
    return {
      planDays: 0,
      dataGrid: {
        data: [],
        row: {}
      },
      selectData: {
        loading: false,
        goodses: []
      }
    }
  },

  methods: {
    /* -------------------------------------------------------------------------------------------------------------- */
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

    /* -------------------------------------------------------------------------------------------------------------- */
    /**
     * 执行采购计划类型
     */
    dataGridDoPlan () {
      if (this.dataGrid.data.length > 0) {
        this.$confirm('该操作会清空列表中的内容, 确认这样做吗?', '提示', {
          confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', showClose: false
        }).then(() => {
          this.dataGrid.data = []
        }).catch(() => {})
      } else {
        if (this.planDays === 0) {
          this.dataGridAppendRow()
        } else {
          alert('生产环境进行开发......')
        }
      }
    },

    /**
     * 通过验证后自动获取下一个焦点
     */
    dataGridValidateFieldToNextFocus (currentField, nextFocus) {
      if (this.dataGrid.row[currentField]) {
        this.$refs[nextFocus].focus()
      }
    },

    /**
     * 数据表行添加对应样式
     */
    dataGridRowClassName ({row, rowIndex}) {
      if (this.dataGridHasRepeatRow(row)) {
        return 'danger-row'
      }
      if (row.editable) {
        return 'info-row'
      }
      return ''
    },

    /**
     *  验证一行是否有效
     *  @row 要进行验证的 row
     *  @showMsg 是否显示错误消息, 不传参数显示，传任何参数则不显示
     */
    dataGridValidateRow (row, showMsg) {
      if (!row.id || !row.quantity) {
        if (showMsg === undefined) {
          this.$message.error('当前行尚未完成编辑, 不能进行其他操作')
        }
        return false
      }
      if (row.quantity % row.minPurchaseQuantity !== 0) {
        if (showMsg === undefined) {
          this.$message.error('计划数量只能为购进基数的整倍数')
        }
        return false
      }
      return true
    },

    /**
     * 检查是否有重复行
     */
    dataGridHasRepeatRow (row) {
      let repeatList = this.dataGrid.data.filter(item => {
        return item.id === row.id
      })
      return repeatList.length > 1
    },

    /**
     * 向数据表插入一行
     */
    dataGridAppendRow () {
      // 如果当前行无效则不继续执行
      if (this.dataGrid.data.length > 0 && !this.dataGridValidateRow(this.dataGrid.row)) {
        return false
      }
      // 如果录入的为重复行则不继续执行
      if (this.dataGridHasRepeatRow(this.dataGrid.row)) {
        this.$message.error('当前记录已存在, 不能重复录入')
        return
      }
      // 停止编辑当前行
      if (this.dataGrid.data.length > 0) {
        this.dataGrid.row.editable = false
      }
      // 初始化一行数据
      let row = {}
      row.index = this.dataGrid.data.length
      row.editable = true
      row.gsmGoodsTypeName = ''
      row.id = ''
      row.oid = ''
      row.name = ''
      row.goodsUnitsName = ''
      row.specs = ''
      row.quantity = 1
      row.minPurchaseQuantity = 1
      row.recommendQuantity = 0
      row.originName = ''
      row.manufacturerName = ''
      row.inventoryQuantity = 0
      row.sellQuantity = 0
      row.sellFrequency = 0
      row.maxQuantity = 0
      row.minQuantity = 0
      // 将新建行指向当前行
      this.dataGrid.row = row
      // 进行数据插入
      this.dataGrid.data.push(this.dataGrid.row)
      // 做延迟处理
      setTimeout(() => {
        // 清空已经查询的数据
        this.selectData.goodses = []
        // 下一行获取焦点
        this.$refs['id' + (this.dataGrid.data.length - 1)].focus()
      }, 100)
    },

    /**
     * 对商品进行检索查询
     * 做一个0.5秒的延迟查询, 避免用户输入速度过慢时的频发查询
     * 查询结果不为 0 时, 才会有 0.5 秒的延迟查询
     * @param name
     */
    dataGridQueryGoodses (name) {
      if (name.trim()) {
        this.selectData.loading = true
        setTimeout(() => {
          const url = `/chisAPI/goods/getEnabledLikeByNameForPlan`
          let params = {
            name: name
          }
          this.$http.get(url, {params}).then((res) => {
            this.selectData.goodses = res.data
            this.selectData.loading = false
          })
        }, (this.selectData.goodses ? 0 : 500))
      }
    },

    /**
     * 当选中商品时填充对应行其他信息
     * @param gsmGoodsId
     */
    dataGridGoodsChange (gsmGoodsId) {
      // 获取选中对象
      let goods = this.selectData.goodses.find((item) => {
        return item.id === gsmGoodsId
      })
      // 赋值其他属性
      this.dataGrid.row.gsmGoodsTypeName = goods.gsmGoodsTypeName
      this.dataGrid.row.oid = goods.oid
      this.dataGrid.row.name = goods.name
      this.dataGrid.row.goodsUnitsName = goods.goodsUnitsName
      this.dataGrid.row.minPurchaseQuantity = goods.minPurchaseQuantity
      this.dataGrid.row.recommendQuantity = 0
      this.dataGrid.row.specs = goods.specs
      this.dataGrid.row.originName = goods.originName
      this.dataGrid.row.manufacturerName = goods.manufacturerName
      this.dataGrid.row.inventoryQuantity = goods.inventoryQuantity
      this.dataGrid.row.sellQuantity = 0
      this.dataGrid.row.sellFrequency = 0
      this.dataGrid.row.maxQuantity = 0
      this.dataGrid.row.minQuantity = 0
    },

    /**
     * 编辑一行
     */
    dataGridEditRow (row, column, event) {
      // 如果目标行在编辑状态则不继续执行
      if (row.editable) {
        return
      }
      // 如果目标行无未完成编辑则询问是否放弃该行
      if (!this.dataGridValidateRow(this.dataGrid.row, false)) {
        this.$confirm('当前行尚未完成编辑, 确认要放弃编辑吗?', '提示', {
          confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', showClose: false
        }).then(() => {
          this.deleteRow(this.dataGrid.row) // 删除当前行
          this.dataGrid.row = row // 设置目标为当前行
          this.dataGrid.row.editable = true // 开启编辑
        }).catch(() => {})
      } else {
        this.dataGrid.row.editable = false // 设置当前行不可编辑
        this.dataGrid.row = row // 设置目标行为当前行
        this.dataGrid.row.editable = true // 开启编辑
      }
    },

    /**
     * 删除一行
     * @param row
     */
    deleteRow (row) {
      this.dataGrid.data = this.dataGrid.data.filter((item) => {
        return item.index !== row.index
      })
      // 设置当前行
      this.dataGrid.row = this.dataGrid.data[this.dataGrid.data.length - 1]
    },

    /**
     * 删除所有行
     */
    deleteAllRow () {
      if (this.dataGrid.data.length === 0) {
        return
      }
      this.$confirm('确认要删除所有行吗?', '提示', {
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
        if (!this.dataGridValidateRow(row)) {
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
      let planList = []
      this.dataGrid.data.forEach(item => {
        let plan = {}
        plan.gsmGoodsId = item.id
        plan.quantity = item.quantity
        plan.planDays = this.planDays

        planList.push(plan)
      })

      return planList
    },

    /***
     * 提交计划
     */
    submitData () {
      if (!this.validateSubmitData()) {
        return false
      }

      this.$confirm('确认提交吗?', '提示', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', showClose: false
      }).then(() => {
        this.$loading()
        const url = `/chisAPI/purchasePlan/save`
        let method = 'POST'
        let data = {
          planJson: JSON.stringify(this.getSubmitData())
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
      }).catch(() => {})
    }

  } // end method
}
</script>

<style scoped>
</style>
