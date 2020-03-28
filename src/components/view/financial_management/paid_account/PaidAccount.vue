<template>
  <div>
    <!-- 功能菜单 -->
    <el-card
      shadow="never"
      body-style="padding: 5px;"
      class="el-card-menus"
      style="padding-right: 10px;">
      <el-button type="success" size="mini" round plain icon="el-icon-edit" @click="insertInvoiceNo">录入发票</el-button>
      <el-button type="success" size="mini" round plain icon="el-icon-edit" @click="insertPaymentNo">录入凭证</el-button>
      <el-button type="default" size="mini" round icon="el-icon-search" @click="dialog.queryVisible = true">条件查询</el-button>
    </el-card>

    <!-- 查询条件界面 -->
    <el-dialog
      width="45%"
      :show-close="false"
      :close-on-click-modal="false"
      :visible="dialog.queryVisible">
      <!-- 模态框标题栏与功能按钮 -->
      <el-row slot="title">
        <el-col :span="5" style="font-size: 20px;">
          <span>条件查询</span>
        </el-col>
        <el-col :span="19" style="text-align: right;">
          <el-button type="primary" size="mini" icon="el-icon-search"  @click="dataGridLoadData">查询</el-button>
          <el-button type="default" size="mini" icon="el-icon-refresh" @click="$refs.queryForm.resetFields()">重置</el-button>
          <el-button type="warning" size="mini" icon="el-icon-right" @click="dialog.queryVisible=false">返 回</el-button>
        </el-col>
      </el-row>

      <el-form :model="queryForm" ref="queryForm" :inline="false" size="mini" label-width="120px" label-position="left" style="padding: 0 20px;">
        <el-form-item label="单据日期" prop="creationDate">
          <el-date-picker
            v-model="queryForm.creationDate"
            type="daterange"
            align="right"
            unlink-panels
            value-format="yyyy-MM-dd"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptions"/>
        </el-form-item>
        <el-form-item label="供应商名称" prop="pemSupplierId">
          <el-select
            v-model.trim="queryForm.pemSupplierId"
            placeholder="供应商名称 / 助记码 搜索"
            :remote-method="querySupplier"
            :loading="selectData.loading"
            remote
            filterable>
            <el-option class="custom-el-option" :value="null" v-if="selectData.supplierList.length > 0" disabled>
              <span class="select-option-top" style="width: 120px;">供应商编码</span>
              <span class="select-option-top" style="width: 250px;">名称</span>
              <span class="select-option-top" style="width: 100px;">联系人</span>
              <span class="select-option-top">联系人电话</span>
            </el-option>
            <el-option class="custom-el-option" v-for="item in selectData.supplierList" :key="item.id" :value="item.id" :label="item.name" >
              <span class="select-option-text" style="width: 120px;">{{item.oid}}</span>
              <span class="select-option-text" style="width: 250px;">{{item.name}}</span>
              <span class="select-option-text" style="width: 100px;">{{item.contacter}}</span>
              <span class="select-option-text">{{item.contacterPhone}}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="机构名称" prop="sysClinicId">
          <el-select
            v-model.trim="queryForm.sysClinicId"
            placeholder="机构名称 / 助记码 搜索"
            :remote-method="queryClinic"
            :loading="selectData.loading"
            remote
            filterable>
            <el-option class="custom-el-option" :value="null" v-if="selectData.clinicList.length > 0" disabled>
              <span class="select-option-top">机构名称</span>
            </el-option>
            <el-option class="custom-el-option" v-for="item in selectData.clinicList" :key="item.id" :value="item.id" :label="item.name" >
              <span class="select-option-text">{{item.name}}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="发票号" prop="invoiceNo">
          <el-input v-model.trim="queryForm.invoiceNo" placeholder="发票号"/>
        </el-form-item>
        <el-form-item label="凭证号" prop="paymentNo">
          <el-input v-model.trim="queryForm.paymentNo" placeholder="凭证号"/>
        </el-form-item>
        <el-form-item label="审核状态" prop="approveState">
          <el-select v-model="queryForm.approveState" placeholder="请选择" style="width: 100px;">
            <el-option label="全部" :value="null"/>
            <el-option label="待审核" :value="approveState.PENDING"/>
            <el-option label="通过" :value="approveState.APPROVED"/>
            <el-option label="驳回" :value="approveState.UNAPPROVED"/>
          </el-select>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 数据表 -->
    <el-card
      shadow="never"
      body-style="padding: 0;">
      <el-table
        ref="paidAccountTable"
        :height="$store.getters.dataGridHeight"
        :data="dataGrid.data"
        @selection-change="tableSelectionChange"
        stripe
        size="mini">
        <el-table-column fixed="left" type="index" width="50"/>
        <el-table-column fixed="left" type="selection" :selectable="tableSelectable" width="55"/>
        <el-table-column fixed="left" label="操作" align="center" width="80">
          <template slot-scope="scope">
            <el-button size="mini" @click="dialogOpen(scope.row)">明 细</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="creationDate" label="单据日期" width="160" show-overflow-tooltip/>
        <el-table-column prop="lsh" label="流水号" width="220" show-overflow-tooltip/>
        <el-table-column prop="pemSupplierOid" label="供应商编码" width="120" show-overflow-tooltip/>
        <el-table-column prop="pemSupplierName" label="供应商名称" width="250" show-overflow-tooltip/>
        <el-table-column prop="paidAmount" label="应付金额" width="100" show-overflow-tooltip/>
        <el-table-column prop="creatorName" label="操作人" width="100" show-overflow-tooltip/>
        <el-table-column prop="invoiceNo" label="发票号" width="150" show-overflow-tooltip/>
        <el-table-column prop="paymentNo" label="凭证号" width="150" show-overflow-tooltip/>
        <el-table-column prop="payerName" label="付款人" width="100" show-overflow-tooltip/>
        <el-table-column prop="payDate" label="付款日期" width="160" show-overflow-tooltip/>
        <el-table-column prop="approverName" label="审批人" width="100" show-overflow-tooltip/>
        <el-table-column prop="approveDate" label="审批日期" width="160" show-overflow-tooltip/>
        <el-table-column prop="approveState" label="审批状态" width="100" :formatter="dataGridFormatterApproveSate" show-overflow-tooltip/>
        <el-table-column prop="sysClinicName" label="机构" min-width="400" show-overflow-tooltip/>
      </el-table>
      <el-pagination
        :page-size="pagination.pageSize"
        :total="pagination.total"
        :current-page="pagination.currentPage"
        :pager-count="pagination.pagerCount"
        :page-sizes="pagination.pageSizes"
        :layout="pagination.layout"
        @size-change="paginationSizeChange"
        @current-change="paginationCurrentChange">
      </el-pagination>
    </el-card>

    <!-- 应付账款编辑界面 -->
    <PaidAccountDetail :visible="dialog.visible" :row="dataGrid.row"
                        :dialogClose="dialogClose"/>

  </div>
</template>

<script>
import PaidAccountDetail from './PaidAccountDetail'
export default {
  components: {
    PaidAccountDetail
  },

  data () {
    return {
      approveState: this.$store.getters.approveState,
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        }
      },
      queryForm: {
        creationDate: [],
        pemSupplierId: null,
        sysClinicId: null,
        invoiceNo: null,
        paymentNo: null,
        approveState: null
      },
      dataGrid: {
        data: [],
        row: {},
        selectedData: []
      },
      pagination: {
        total: this.$store.getters.pagination.total, /* 总记录数 */
        pageSize: this.$store.getters.pagination.pageSize, /* 每页显示的行数 */
        currentPage: this.$store.getters.pagination.currentPage, /* 当前页页码 */
        pagerCount: this.$store.getters.pagination.pagerCount, /* 分页页码按钮的数量 */
        pageSizes: this.$store.getters.pagination.pageSizes, /* 选取每页显示的行数 */
        layout: this.$store.getters.pagination.layout
      },
      dialog: {
        visible: false,
        queryVisible: false
      },
      selectData: {
        loading: false,
        supplierList: [],
        clinicList: []
      },
      totalPaidAmount: 0
    }
  }, // end data

  methods: {
    /* -------------------------------------------------------------------------------------------------------------- */
    paginationSizeChange (value) {
      this.pagination.pageSize = value
      this.dataGridLoadData()
    },

    paginationCurrentChange (value) {
      this.pagination.currentPage = value
      this.dataGridLoadData()
    },

    dataGridFormatterApproveSate (row, column, cellValue) {
      switch (cellValue) {
        case this.$store.getters.approveState.PENDING: return '待审核'
        case this.$store.getters.approveState.APPROVED: return '通过'
        case this.$store.getters.approveState.UNAPPROVED: return '驳回'
        default: return '未知状态'
      }
    },

    /**
     * 设置选择框是否可选
     */
    tableSelectable (row, rowIndex) {
      return row.approveState === this.$store.getters.approveState.PENDING
    },

    /**
     * 当勾选发生改变时执行的操作
     * @param selection
     */
    tableSelectionChange (selection) {
      // 计算合计金额
      const values = selection.map(item => item.paidAmount)
      this.totalPaidAmount = values.reduce((prev, curr) => {
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

    /* -------------------------------------------------------------------------------------------------------------- */
    /**
     * 数据载入
     */
    dataGridLoadData () {
      this.$loading()
      this.dataGrid.selectedData = [] // 清空选中行
      const url = `/chisAPI/paidAccount/getLshGroupListByCriteria`
      let params = this.queryForm
      params.pageNum = this.pagination.currentPage
      params.pageSize = this.pagination.pageSize

      this.$http.get(url, {params}).then((res) => {
        if (res.data.code === 200) {
          this.pagination.total = res.data.resultSet.page.total
          this.dataGrid.data = res.data.resultSet.page.list
        }
        this.dialog.queryVisible = false
        this.$loading().close()
      })
    },

    /**
     * 检索供应商
     * 做一个0.5秒的延迟查询, 避免用户输入速度过慢时的频发查询
     * 当查询结果不为0时, 才会有 0.5 秒的延迟查询
     */
    querySupplier (keyword) {
      if (keyword.trim()) {
        this.selectData.loading = true
        setTimeout(() => {
          const url = `/chisAPI/supplier/getEnabledLikeByName`
          let params = {
            name: keyword
          }
          this.$http.get(url, {params}).then((res) => {
            this.selectData.supplierList = res.data
            this.selectData.loading = false
          })
        }, (this.selectData.supplierList ? 0 : 500))
      }
    },

    /**
     * 检索机构
     * 做一个0.5秒的延迟查询, 避免用户输入速度过慢时的频发查询
     * 当查询结果不为0时, 才会有 0.5 秒的延迟查询
     */
    queryClinic (keyword) {
      if (keyword.trim()) {
        this.selectData.loading = true
        setTimeout(() => {
          const url = `/chisAPI/clinic/getEnabledLikeByName`
          let params = {
            name: keyword
          }
          this.$http.get(url, {params}).then((res) => {
            this.selectData.clinicList = res.data.resultSet.list
            this.selectData.loading = false
          })
        }, (this.selectData.clinicList ? 0 : 500))
      }
    },

    /* -------------------------------------------------------------------------------------------------------------- */

    /**
    * 对录入的发票号 和 凭证号进行检查
    */
    insertValidate () {
      let selectedData = this.dataGrid.selectedData

      // 检查是否有选中数据
      if (selectedData.length === 0) {
        return false
      }

      // 检查所有数据是否为同一个供应商
      let pemSupplierId = selectedData[0].pemSupplierId
      if (!selectedData.every(item => item.pemSupplierId === pemSupplierId)) {
        this.$message.error('供应商不一致')
        return false
      }

      return true
    },

    /**
     * 录入发票号
     */
    insertInvoiceNo () {
      if (!this.insertValidate()) {
        return
      }
      let hasInvoiceNoLen = this.dataGrid.selectedData.filter(item => item.invoiceNo).length
      this.$prompt(`当前选中 ${this.dataGrid.selectedData.length} 行,
      共计 ${this.totalPaidAmount} 元, 其中 ${hasInvoiceNoLen} 行已录入发票号`, '请输入发票号', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        closeOnClickModal: false,
        showClose: false,
        inputType: 'text',
        inputValidator: this.invoiceNoValidator,
        inputErrorMessage: ''
      }).then(({ value }) => {
        /* ---------------------------------------------------------------------------------------------------------- */
        this.$confirm('确认提交吗?', '提示', {
          confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', showClose: false
        }).then(() => {
          // 提交数据
          this.$loading()
          const url = '/chisAPI/paidAccount/updateInvoiceNo'
          let method = 'PUT'
          let data = {
            lshListJson: JSON.stringify(this.dataGrid.selectedData.map(item => item.lsh)),
            invoiceNo: value
          }

          this.$http({method, url, data}).then((res) => {
            if (res.data.code === 200) {
              this.$message.success(res.data.msg)
              this.dataGridLoadData()
            } else {
              this.$loading().close()
            }
          })
        }).catch(() => {})
        /* ---------------------------------------------------------------------------------------------------------- */
      }).catch(() => {})
    },

    /**
     * 发票号验证
     */
    invoiceNoValidator (value) {
      if (!value) {
        return '发票号不能为空'
      }

      if (value.length > 30) {
        return '发票号不能大于 30'
      }
    },

    /**
     * 录入凭证号
     */
    insertPaymentNo () {
      if (!this.insertValidate()) {
        return
      }

      for (let i = 0; i < this.dataGrid.selectedData.length; i++) {
        let row = this.dataGrid.selectedData[i]
        if (!row.invoiceNo) {
          this.$message.error('流水号: ' + row.lsh + ' 没有录入发票号')
          return
        }
      }

      let hasPaymentNoLen = this.dataGrid.selectedData.filter(item => item.paymentNo).length
      this.$prompt(`当前选中 ${this.dataGrid.selectedData.length} 行,
      共计 ${this.totalPaidAmount} 元, 其中 ${hasPaymentNoLen} 行已录入凭证号`, '请输入凭证号', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        closeOnClickModal: false,
        showClose: false,
        inputType: 'text',
        inputValidator: this.paymentNoValidator,
        inputErrorMessage: ''
      }).then(({ value }) => {
        /* ---------------------------------------------------------------------------------------------------------- */
        this.$confirm('确认提交吗?', '提示', {
          confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', showClose: false
        }).then(() => {
          // 提交数据
          this.$loading()
          const url = '/chisAPI/paidAccount/updatePaymentNo'
          let method = 'PUT'
          let data = {
            lshListJson: JSON.stringify(this.dataGrid.selectedData.map(item => item.lsh)),
            paymentNo: value
          }

          this.$http({method, url, data}).then((res) => {
            if (res.data.code === 200) {
              this.$message.success(res.data.msg)
              this.dataGridLoadData()
            } else {
              this.$loading().close()
            }
          })
        }).catch(() => {})
        /* ---------------------------------------------------------------------------------------------------------- */
      }).catch(() => {})
    },

    /**
     * 发票号验证
     */
    paymentNoValidator (value) {
      if (!value) {
        return '凭证号不能为空'
      }

      if (value.length > 30) {
        return '凭证号不能大于 30'
      }
    },

    /* -------------------------------------------------------------------------------------------------------------- */
    /**
     * 打开付款明细界面
     * @param row
     */
    dialogOpen (row) {
      this.dataGrid.row = row
      this.dialog.visible = true
    },

    /**
     * 关闭付款明细界面
     */
    dialogClose () {
      this.dialog.visible = false
    }

  } // end methods
}
</script>

<style scoped>
  .total-paid-amount {
    position: absolute;
    left: 15px;
    font-size: 18px;
    font-weight: 600;
    /*color: #F56C6C;*/
    color: rgb(144, 147, 153);
  }
</style>
