<template>
  <div>
    <!--功能菜单-->
    <el-card
      shadow="never"
      body-style="padding: 5px;"
      class="el-card-menus">
      <el-form :model="queryForm" ref="queryForm" :inline="true" size="mini">
        <el-form-item label="计划日期" prop="creationDate">
          <el-date-picker
            style="width: 280px;"
            v-model="queryForm.creationDate"
            type="daterange"
            align="right"
            unlink-panels
            value-format="yyyy-MM-dd"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptions"/>
        </el-form-item>
        <el-form-item label="机构名称" prop="sysClinicName">
          <el-input v-model.trim="queryForm.sysClinicName" placeholder="机构名称 / 助记码" style="width: 150px;"/>
        </el-form-item>
        <el-form-item label="商品名称" prop="gsmGoodsName">
          <el-input v-model.trim="queryForm.gsmGoodsName" placeholder="商品名称 / 助记码" style="width: 150px;"/>
        </el-form-item>
        <el-form-item label="审批状态" prop="approveState">
          <el-select v-model="queryForm.approveState" placeholder="请选择" style="width: 100px;">
            <el-option label="全部" :value="null"/>
            <el-option label="待审核" :value="approveState.PENDING"/>
            <el-option label="待采购" :value="approveState.PURCHASING"/>
            <el-option label="已采购" :value="approveState.APPROVED"/>
            <el-option label="驳回" :value="approveState.UNAPPROVED"/>
            <el-option label="撤销" :value="approveState.CANCEL"/>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" round icon="el-icon-search"  @click="dataGridLoadData">查 询</el-button>
          <el-button type="default" round icon="el-icon-refresh" @click="$refs.queryForm.resetFields()">重 置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表 -->
    <el-card
      shadow="never"
      body-style="padding: 0;">
      <el-table
        ref="purchasePlanTable"
        :height="$store.getters.dataGridHeight"
        :data="dataGrid.data"
        stripe
        size="mini">
        <el-table-column fixed="left" type="index" width="50"/>
        <el-table-column prop="creationDate" label="计划日期" width="100" sortable/>
        <el-table-column prop="lsh" label="流水号" width="220" sortable/>
        <el-table-column prop="gsmGoodsTypeName" label="商品类型" width="110" sortable/>
        <el-table-column prop="gsmGoodsOid" label="商品编码" width="100" show-overflow-tooltip sortable/>
        <el-table-column prop="gsmGoodsName" label="商品名称" width="200" show-overflow-tooltip sortable/>
        <el-table-column prop="gsmGoodsSpecs" label="规格" width="120" show-overflow-tooltip/>
        <el-table-column prop="goodsUnitsName" label="单位" width="80" show-overflow-tooltip/>
        <el-table-column prop="quantity" label="计划数量" width="100"/>
        <el-table-column prop="recommendQuantity" label="建议数量" width="100"/>
        <el-table-column prop="planDays" label="计划天数" width="100" sortable/>
        <el-table-column prop="originName" label="产地" width="100" show-overflow-tooltip sortable/>
        <el-table-column prop="manufacturerName" label="生产厂家" width="250" show-overflow-tooltip sortable/>
        <el-table-column prop="creatorName" label="申请人" width="100" sortable/>
        <el-table-column prop="approverName" label="审批人" width="100"/>
        <el-table-column prop="approveDate" label="审批日期" width="100"/>
        <el-table-column prop="approveState" label="审批状态" width="100" :formatter="dataGridFormatterApproveSate" sortable/>
        <el-table-column prop="sysClinicName" label="申请机构" min-width="400" show-overflow-tooltip sortable/>
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

  </div>
</template>

<script>

export default {
  data () {
    return {
      approveState: this.$store.getters.approveState,
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        }
      },
      queryForm: {
        creationDate: this.$store.getters.queryDate,
        sysClinicName: null,
        gsmGoodsName: null,
        approveState: null
      },
      dataGrid: {
        data: []
      },
      pagination: {
        total: this.$store.getters.pagination.total, /* 总记录数 */
        pageSize: this.$store.getters.pagination.pageSize, /* 每页显示的行数 */
        currentPage: this.$store.getters.pagination.currentPage, /* 当前页页码 */
        pagerCount: this.$store.getters.pagination.pagerCount, /* 分页页码按钮的数量 */
        pageSizes: this.$store.getters.pagination.pageSizes, /* 选取每页显示的行数 */
        layout: this.$store.getters.pagination.layout
      }
    }
  },

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

    /* -------------------------------------------------------------------------------------------------------------- */
    dataGridFormatterApproveSate (row, column, cellValue) {
      switch (cellValue) {
        case this.$store.getters.approveState.UNAPPROVED: return '驳回'
        case this.$store.getters.approveState.APPROVED: return '已采购'
        case this.$store.getters.approveState.CANCEL: return '撤销'
        case this.$store.getters.approveState.PURCHASING: return '待采购'
        case this.$store.getters.approveState.PRICING: return '待定价'
        case this.$store.getters.approveState.PENDING: return '待审核'
        default: return '未知状态'
      }
    },

    dataGridLoadData () {
      this.$loading()
      let url = '/chisAPI/purchasePlan/getByCriteria'
      let params = this.queryForm
      params.pageNum = this.pagination.currentPage
      params.pageSize = this.pagination.pageSize

      this.$http.get(url, {params}).then((res) => {
        if (res.data.code === 200) {
          this.pagination.total = res.data.resultSet.page.total
          this.dataGrid.data = res.data.resultSet.page.list
        }
        this.$loading().close()
      })
    }

  } // end methods
}
</script>

<style scoped>
</style>
