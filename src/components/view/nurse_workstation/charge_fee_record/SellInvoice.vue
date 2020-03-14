<template>
  <el-dialog
    width="75%"
    :show-close="false"
    :close-on-click-modal="false"
    :visible="visible"
    @opened="dialogOpened"
    @closed="dialogClosed">
    <!-- 模态框标题栏与功能按钮 -->
    <el-row slot="title">
      <el-col :span="5" style="font-size: 20px;">
        <span>销售开票</span>
      </el-col>
      <el-col :span="19" style="text-align: right;">
        <el-button size="mini" type="primary" icon="el-icon-check" @click="submitData">提 交</el-button>
        <el-button size="mini" type="warning" icon="el-icon-right" @click="dialogClose">返 回</el-button>
      </el-col>
    </el-row>

    <!-- 编辑表单 -->
    <el-form :model="editForm" ref="editForm" :rules="editFormRules" size="small" label-width="80px">
      <el-row>
        <el-col :span="8">
          <el-form-item label="发票类型" prop="invoiceTypeId">
            <el-select
              v-model.trim="editForm.invoiceTypeId"
              filterable
              default-first-option
              placeholder="请选择">
              <el-option v-for="item in invoiceTypeList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="发票号" prop="invoiceNo">
            <el-input v-model.trim="editForm.invoiceNo"/>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="开票金额" prop="invoiceAmount">
            <span style="font-size: 18px; font-weight: 600; color: #F56C6C;">
              {{editForm.invoiceAmount}}&nbsp;&nbsp;元
            </span>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <!-- 销售明细 -->
    <el-card
      shadow="never"
      body-style="padding: 0;">
      <el-table
        ref="sellRecordTable"
        @selection-change="tableSelectionChange"
        height="50vh"
        :data="dataGrid.data"
        stripe
        size="mini">
        <el-table-column fixed="left" type="index" width="50"/>
        <el-table-column fixed="left" type="selection" :selectable="tableSelectable" width="55"/>
        <el-table-column prop="entityTypeName" label="销售类型" width="100" show-overflow-tooltip/>
        <el-table-column prop="entityOid" label="编码" width="120" show-overflow-tooltip/>
        <el-table-column prop="entityName" label="名称" width="200" show-overflow-tooltip/>
        <el-table-column prop="specs" label="规格" width="150" show-overflow-tooltip/>
        <el-table-column prop="unitsName" label="销售单位" width="100" show-overflow-tooltip/>
        <el-table-column prop="quantity" label="销售数量" width="100" show-overflow-tooltip/>
        <el-table-column prop="actualRetailPrice" label="实收单价" width="100" show-overflow-tooltip/>
        <el-table-column label="实收小计(含税)" width="120" show-overflow-tooltip>
          <template slot-scope="props">
            {{(props.row.actualRetailPrice * props.row.quantity).toFixed(2)}}
          </template>
        </el-table-column>
        <el-table-column prop="originName" label="产地" width="100" show-overflow-tooltip/>
        <el-table-column prop="manufacturerName" label="生产厂家" width="250" show-overflow-tooltip/>
        <el-table-column prop="ph" label="批号" width="150" show-overflow-tooltip/>
        <el-table-column prop="pch" label="批次号" width="150" show-overflow-tooltip/>
        <el-table-column prop="expiryDate" label="有效期至" width="120" show-overflow-tooltip/>
        <el-table-column prop="invoiceTypeName" label="发票类型" width="120" show-overflow-tooltip/>
        <el-table-column prop="invoiceNo" label="发票号" width="150" show-overflow-tooltip/>
        <el-table-column prop="sellerName" label="销售人" width="100" show-overflow-tooltip/>
        <el-table-column prop="operatorName" label="出库人" width="100" show-overflow-tooltip/>
        <el-table-column prop="cashierName" label="收银员" width="100" show-overflow-tooltip/>
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
    row: {
      type: Object,
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
      editForm: {
        invoiceTypeId: '',
        invoiceNo: '',
        invoiceAmount: 0
      },
      editFormRules: {
        invoiceTypeId: [
          {required: true, message: '不能为空'}
        ],
        invoiceNo: [
          {required: true, message: '不能为空'},
          {min: 8, message: '长度不合法[8-20]'},
          {max: 20, message: '长度不合法[8-20]'}
        ]
      },
      dataGrid: {
        data: [],
        selectedData: []
      }
    }
  },

  computed: {
    invoiceTypeList: function () {
      return this.$store.getters.invoiceTypeList
    }
  },

  methods: {
    /**
     * 界面打开后执行的操作
     */
    dialogOpened () {
      if (this.row.lsh) {
        this.loadSellRecord()
      }
    },

    /**
     * 界面关闭后执行的操作
     */
    dialogClosed () {
      this.$refs.editForm.resetFields()
      this.dataGrid.data = []
      this.dataGrid.selectedData = []
    },

    /**
     * 载入未退费的销售记录明细
     */
    loadSellRecord () {
      this.$loading()
      let url = `/chisAPI/sellRecord/getClinicUnreturnedListByLshForInvoice`
      let params = {
        lsh: this.row.lsh
      }

      this.$http.get(url, {params}).then((res) => {
        if (res.data.code === 200) {
          this.dataGrid.data = res.data.resultSet.list
        } else {
          this.$message.error(res.data.msg)
        }
        this.$loading().close()
      })
    },

    /**
     * 设置选择框是否可选
     */
    tableSelectable (row, rowIndex) {
      return !row.invoiceTypeId
    },

    /**
     * 当勾选发生改变时执行的操作
     * @param selection
     */
    tableSelectionChange (selection) {
      // 计算合计金额
      const values = selection.map(item => (item.quantity * item.actualRetailPrice))
      this.editForm.invoiceAmount = values.reduce((prev, curr) => {
        const value = Number(curr)
        if (!isNaN(value)) {
          return prev + curr
        } else {
          return prev
        }
      }, 0).toFixed(2) * 1

      // 保存选中的数据行
      this.dataGrid.selectedData = selection
    },

    /**
     * 提交数据
     */
    submitData () {
      this.$refs.editForm.validate((valid) => {
        if (!valid) {
          return false
        }

        if (this.dataGrid.selectedData.length === 0) {
          this.$message.error('请勾选开具发票的销售记录')
          return false
        }

        this.$loading()
        let url = '/chisAPI/sellRecord/updateInvoiceByIdList'
        let method = 'PUT'

        let params = this.editForm
        let idList = this.dataGrid.selectedData.map(item => item.id)
        params.idListJson = JSON.stringify(idList)

        this.$http({method, url, params}).then((res) => {
          if (res.data.code === 200) {
            this.$message.success(res.data.msg)
            this.dialogClose()
            this.dataGridLoadData()
          } else {
            this.$message.error(res.data.msg)
          }
          this.$loading().close()
        })
      })
    }
  } // end methods
}
</script>

<style scoped>
</style>
