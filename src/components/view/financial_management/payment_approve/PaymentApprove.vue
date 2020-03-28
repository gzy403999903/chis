<template>
  <div>
    <!-- 功能菜单 -->
    <el-card
      shadow="never"
      body-style="padding: 5px;"
      class="el-card-menus"
      style="padding-right: 10px;">
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
        <!--
        <el-form-item label="机构名称" prop="sysClinicId">
          <el-select
            style="width: 170px;"
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
        -->
        <el-form-item label="凭证号" prop="paymentNo">
          <el-input v-model.trim="queryForm.paymentNo" placeholder="付款凭证号"/>
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
        :height="$store.getters.dataGridHeight"
        :data="dataGrid.data"
        stripe
        size="mini">
        <el-table-column fixed="left" type="index" width="50"/>
        <el-table-column fixed="left" label="操作" align="center" width="80">
          <template slot-scope="scope">
            <el-button size="mini" @click="dialogOpen(scope.row)">明 细</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="creationDate" label="单据日期" width="160" show-overflow-tooltip/>
        <el-table-column prop="paymentNo" label="付款凭证号" width="150" show-overflow-tooltip/>
        <el-table-column prop="pemSupplierOid" label="供应商编码" width="120" show-overflow-tooltip/>
        <el-table-column prop="pemSupplierName" label="供应商名称" width="250" show-overflow-tooltip/>
        <el-table-column prop="paidAmount" label="应付金额" width="100" show-overflow-tooltip/>
        <el-table-column prop="payerName" label="付款人" width="100" show-overflow-tooltip/>
        <el-table-column prop="payDate" label="付款日期" width="160" show-overflow-tooltip/>
        <el-table-column prop="approverName" label="审批人" width="100" show-overflow-tooltip/>
        <el-table-column prop="approveDate" label="审批日期" width="160" show-overflow-tooltip/>
        <el-table-column prop="approveState" label="审批状态" min-width="100" :formatter="dataGridFormatterApproveSate" show-overflow-tooltip/>
        <!--<el-table-column prop="sysClinicName" label="机构" min-width="400" show-overflow-tooltip/>-->
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
    <PaymentApproveDetail :visible="dialog.visible" :row="dataGrid.row"
                        :dialogClose="dialogClose" :dataGridLoadData="dataGridLoadData"/>

  </div>
</template>

<script>
import PaymentApproveDetail from './PaymentApproveDetail'
export default {
  components: {
    PaymentApproveDetail
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
        paymentNo: null,
        approveState: null
      },
      dataGrid: {
        data: [],
        row: {}
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
      }
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

    /* -------------------------------------------------------------------------------------------------------------- */
    /**
     * 数据载入
     */
    dataGridLoadData () {
      this.$loading()
      const url = `/chisAPI/paidAccount/getPaymentNoGroupListByCriteria`
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
     * 打开应付账款编辑界面
     * @param row
     */
    dialogOpen (row) {
      this.dataGrid.row = row
      this.dialog.visible = true
    },

    /**
     * 关闭应付账款界面
     */
    dialogClose () {
      this.dialog.visible = false
    }

  } // end methods
}
</script>

<style scoped>
</style>
