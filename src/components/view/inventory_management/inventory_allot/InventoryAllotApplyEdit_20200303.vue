<template>
  <!-- 这是一个备份 调拨方式可设置调拨数量 (不要删) -->
  <el-dialog
    class="fullscreen-dialog"
    fullscreen
    :show-close="false"
    :close-on-click-modal="false"
    :visible="visible">

    <!-- 模态框标题栏与功能按钮-->
    <el-row slot="title">
      <el-col :span="5" style="font-size: 20px;">
        <span>库房调拨单</span>
      </el-col>
      <el-col :span="19" style="text-align: right;">
        <el-button size="mini" icon="el-icon-remove-outline" @click="dataGrid.data = []">清 空</el-button>
        <el-button size="mini" icon="el-icon-circle-plus-outline" @click="dataGridInsertRow">插入一行</el-button>
        <el-button size="mini" type="primary" icon="el-icon-check" @click="dataGridSubmit">提 交</el-button>
        <el-button size="mini" type="warning" icon="el-icon-right" @click="executeDialogClose">返 回</el-button>
      </el-col>
    </el-row>

    <!-- 编辑表单 -->
    <el-card body-style="padding: 15px 0 0 0;">
      <el-form :model="editForm" ref="editForm" :rules="editFormRules" size="small" label-width="120px">
        <el-row>
          <el-col :span="5">
            <el-form-item label="调出库房名称" prop="originalIymInventoryTypeId">
              <el-select
                ref="originalIymInventoryTypeId"
                @keyup.enter.native="editFormValidateToNextFocus('originalIymInventoryTypeId', 'toIymInventoryTypeId')"
                @change="originalIymInventoryTypeIdChange"
                :disabled="dataGrid.data.length > 0"
                v-model.trim="editForm.originalIymInventoryTypeId"
                filterable
                placeholder="请选择">
                <el-option label="药品库" :value="inventoryType.WESTERN_DRUGS_INVENTORY"
                           v-if="inventoryType.WESTERN_DRUGS_INVENTORY !== editForm.toIymInventoryTypeId"/>
                <el-option label="药材库" :value="inventoryType.CHINESE_DRUGS_INVENTORY"
                           v-if="inventoryType.CHINESE_DRUGS_INVENTORY !== editForm.toIymInventoryTypeId"/>
                <el-option label="物资库" :value="inventoryType.HYGIENIC_MATERIAL_INVENTORY"
                           v-if="inventoryType.HYGIENIC_MATERIAL_INVENTORY !== editForm.toIymInventoryTypeId"/>
                <el-option label="退货库" :value="inventoryType.SUBTRACT_INVENTORY"
                           v-if="inventoryType.SUBTRACT_INVENTORY !== editForm.toIymInventoryTypeId"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="调入库房名称" prop="toIymInventoryTypeId">
              <el-select
                ref="toIymInventoryTypeId"
                @keyup.enter.native="editFormValidateToNextFocus('toIymInventoryTypeId', 'iymInventoryId')"
                :disabled="dataGrid.data.length > 0"
                v-model.trim="editForm.toIymInventoryTypeId"
                filterable
                placeholder="请选择">
                <el-option label="药品库" :value="inventoryType.WESTERN_DRUGS_INVENTORY"
                           v-if="inventoryType.WESTERN_DRUGS_INVENTORY !== editForm.originalIymInventoryTypeId"/>
                <el-option label="药材库" :value="inventoryType.CHINESE_DRUGS_INVENTORY"
                           v-if="inventoryType.CHINESE_DRUGS_INVENTORY !== editForm.originalIymInventoryTypeId"/>
                <el-option label="物资库" :value="inventoryType.HYGIENIC_MATERIAL_INVENTORY"
                           v-if="inventoryType.HYGIENIC_MATERIAL_INVENTORY !== editForm.originalIymInventoryTypeId"/>
                <el-option label="退货库" :value="inventoryType.SUBTRACT_INVENTORY"
                           v-if="inventoryType.SUBTRACT_INVENTORY !== editForm.originalIymInventoryTypeId"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="商品名称" prop="iymInventoryId">
              <el-select
                ref="iymInventoryId"
                @keyup.enter.native="editFormValidateToNextFocus('iymInventoryId', 'quantity')"
                v-model.trim="editForm.iymInventoryId"
                placeholder="输入 商品名称 / 助记码 搜索"
                :remote-method="editFormQueryInventory"
                :loading="select.loading"
                remote
                @change="editFormInventoryChange"
                filterable>
                <el-option class="custom-el-option" :value="null"  v-if="select.inventories.length > 0" disabled>
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
                <el-option class="custom-el-option" v-for="item in select.inventories" :key="item.id" :value="item.id" :label="item.gsmGoodsName">
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
            <el-form-item label="库存数量">
             {{dataGrid.row.quantity}}
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="调拨数量" prop="quantity" style="padding-right: 20px;">
              <el-input-number v-model.trim="editForm.quantity" :controls="false" :max="editFormGetMaxQuantity()" :min="1" :precision="0"
                               ref="quantity" @keyup.enter.native="dataGridInsertRow"/>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <hr/>
      <!-- 数据表 -->
      <el-table
        :height="$store.getters.dialogDataGridHeight - 70"
        :data="dataGrid.data"
        :row-class-name="dataGridRowClassName"
        size="mini">
        <el-table-column fixed="left" type="index" width="40"/>
        <el-table-column fixed="left" label="操作" align="center" width="60">
          <template slot-scope="scope">
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="dataGridDeleteRow(scope.row)"/>
          </template>
        </el-table-column>
        <el-table-column prop="originalIymInventoryTypeName" label="调出库房" width="100" show-overflow-tooltip/>
        <el-table-column prop="toIymInventoryTypeName" label="调入库房" width="100" show-overflow-tooltip/>
        <el-table-column prop="gsmGoodsOid" label="编码" width="100" show-overflow-tooltip/>
        <el-table-column prop="gsmGoodsName" label="商品名称" width="200" show-overflow-tooltip/>
        <el-table-column prop="goodsUnitsName" label="单位" width="100"/>
        <el-table-column prop="gsmGoodsSpecs" label="规格" width="120" show-overflow-tooltip/>
        <el-table-column prop="quantity" label="调拨数量" width="80" show-overflow-tooltip/>
        <el-table-column prop="ph" label="批号" width="150" show-overflow-tooltip/>
        <el-table-column prop="pch" label="批次号" min-width="150" show-overflow-tooltip/>
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
  }, // end props

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
        callback(new Error('该信息已存在, 无需重复录入'))
      }
    }

    return {
      inventoryType: this.$store.getters.inventoryType, // 仓库类型
      editForm: {
        originalIymInventoryTypeId: '',
        toIymInventoryTypeId: '',
        iymInventoryId: '',
        quantity: 1
      },
      editFormRules: {
        originalIymInventoryTypeId: [
          {required: true, message: '不能为空'}
        ],
        toIymInventoryTypeId: [
          {required: true, message: '不能为空'}
        ],
        iymInventoryId: [
          {required: true, message: '不能为空'},
          {validator: hasRepeatRow, trigger: 'blur'}
        ],
        quantity: [
          {validator: validateQuantity, trigger: 'blur'}
        ]
      },
      dataGrid: {
        data: [],
        row: {}
      },
      select: {
        loading: false,
        inventories: []
      }
    }
  }, // end data

  methods: {

    /**
     * 执行界面关闭
     */
    executeDialogClose () {
      if (this.dataGrid.data.length > 0) {
        this.$confirm('该操作会清空列表中的内容, 确认这样做吗?', '提示', {
          confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', showClose: false
        }).then(() => {
          this.resetPage()
          this.dialogClose()
        }).catch(() => {})
      } else {
        this.resetPage()
        this.dialogClose()
      }
    },

    /**
     * 关闭界面
     */
    resetPage () {
      // 清空表单
      this.$refs.editForm.resetFields()
      // 清空查询的库存
      this.select.inventories = []
      // 清空数据列表
      this.dataGrid.data = []
      // 清空当前行
      this.dataGrid.row = {}
    },

    /**
     * 验证当前焦点通过后获取下一个焦点
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
     * 当调出库房发生改变时执行的内容
     */
    originalIymInventoryTypeIdChange () {
      this.select.inventories = []
      this.editForm.iymInventoryId = ''
    },

    /**
     * 检索库存
     * @param name
     */
    editFormQueryInventory (name) {
      if (this.editForm.originalIymInventoryTypeId === '') {
        this.$message.error('请先选择调出库房')
        return
      }
      if (name.trim()) {
        this.select.loading = true
        // 做一个0.5秒的延迟查询, 避免用户输入速度过慢时的频发查询
        setTimeout(() => {
          const url = `/chisAPI/inventory/getClinicPchEnabledLikeByCriteria`
          let params = {
            iymInventoryTypeId: this.editForm.originalIymInventoryTypeId,
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
     * 获取选中的库存信息
     * @param id
     */
    editFormInventoryChange (id) {
      this.dataGrid.row = this.select.inventories.find(item => {
        return item.id === id
      })
    },

    /**
     * 获取最大调拨数量
     */
    editFormGetMaxQuantity () {
      if (this.dataGrid.row.quantity) {
        return this.dataGrid.row.quantity
      } else {
        return 0
      }
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
     * 将重复行标记为红色
     */
    dataGridRowClassName ({row, rowIndex}) {
      if (row.id === this.dataGrid.row.id) {
        return 'danger-row'
      }
      return ''
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
        // 插入调拨数据到数据表
        let row = this.dataGrid.row
        row.originalIymInventoryTypeId = this.editForm.originalIymInventoryTypeId
        row.originalIymInventoryTypeName = this.getInventoryTypeName(this.editForm.originalIymInventoryTypeId)
        row.toIymInventoryTypeId = this.editForm.toIymInventoryTypeId
        row.toIymInventoryTypeName = this.getInventoryTypeName(this.editForm.toIymInventoryTypeId)
        row.quantity = this.editForm.quantity
        this.dataGrid.data.push(this.dataGrid.row)

        // 清空编辑表单
        this.$refs.editForm.resetFields()
        // 清空查询的库存
        this.select.inventories = []
        // 清空当前行
        this.dataGrid.row = {}

        // 还原不被清空的值
        this.editForm.originalIymInventoryTypeId = row.originalIymInventoryTypeId
        this.editForm.toIymInventoryTypeId = row.toIymInventoryTypeId

        // 获取下一个默认焦点
        this.$refs.iymInventoryId.focus()
      })
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
     * 提交数据
     */
    dataGridSubmit () {
      if (this.dataGrid.data.length === 0) {
        return false
      }

      this.$loading()
      const url = '/chisAPI/inventoryAllot/save'
      let method = 'POST'
      let data = {
        inventoryAllotJson: this.getSubmitJson()
      }
      this.$http({method, url, data}).then((res) => {
        if (res.data.code === 200) {
          this.$message.success(res.data.msg)
          this.resetPage()
          this.dialogClose()
          this.dataGridLoadData()
        } else {
          this.$message.error(res.data.msg)
          this.$loading().close()
        }
      })
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
        allot.iymInventoryId = row.id
        allot.gsmGoodsId = row.gsmGoodsId
        allot.ph = row.ph
        allot.pch = row.pch
        allot.splitQuantity = row.splitQuantity
        allot.quantity = row.quantity

        // 保存该条信息
        allotArray.push(allot)
      }

      return JSON.stringify(allotArray)
    }

  } // end methods
}
</script>

<style scoped>
</style>
