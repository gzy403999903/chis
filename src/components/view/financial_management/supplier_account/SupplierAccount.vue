<template>
  <div>
    <!--功能菜单-->
    <el-form :model="queryForm" ref="queryForm" :inline="true" size="mini">
      <el-card
        shadow="never"
        body-style="padding: 5px;"
        class="el-card-menus">
        <el-form-item label="供应商编码" prop="oid">
          <el-input v-model.trim="queryForm.oid" placeholder="供应商编码" style="width: 150px;"/>
        </el-form-item>
        <el-form-item label="供应商名称" prop="name">
          <el-input v-model.trim="queryForm.name" placeholder="供应商名称 / 助记码" style="width: 150px;"/>
        </el-form-item>
        <el-form-item label="应付金额大于" prop="arrearagesAmount">
          <el-input-number v-model="queryForm.arrearagesAmount" :controls="false" :max="9999999" :min="0" :precision="2"
                           style="width: 90px;"/>&nbsp;元
        </el-form-item>
        <el-form-item label="受限额度大于" prop="arrearagesLimit">
          <el-input-number v-model="queryForm.arrearagesLimit" :controls="false" :max="9999999" :min="0" :precision="2"
                           style="width: 90px;"/>&nbsp;元
        </el-form-item>
        <el-form-item label="付款天数大于" prop="arrearagesDays">
          <el-input-number v-model="queryForm.arrearagesDays" :controls="false" :max="9999999" :min="0" :precision="0"
                           style="width: 90px;"/>&nbsp;天
        </el-form-item>
      </el-card>
      <el-card
        shadow="never"
        body-style="padding: 5px;"
        class="el-card-menus">
        <el-form-item>
          <el-button type="primary" round icon="el-icon-search"  @click="dataGridLoadData">查询</el-button>
          <el-button type="default" round icon="el-icon-refresh" @click="$refs.queryForm.resetFields()">重置</el-button>
        </el-form-item>
      </el-card>
    </el-form>

    <!-- 数据表 -->
    <el-card
      shadow="never"
      body-style="padding: 0;">
      <el-table
        :height="$store.getters.dataGridHeight - 40"
        :data="dataGrid.data"
        stripe
        size="mini">
        <el-table-column fixed="left" type="index"/>
        <el-table-column prop="oid" label="供应商编码" width="120" show-overflow-tooltip/>
        <el-table-column prop="name" label="供应商名" width="300" show-overflow-tooltip/>
        <el-table-column prop="arrearagesAmount" label="应付金额" width="100" show-overflow-tooltip/>
        <el-table-column prop="arrearagesLimit" label="受限额度" width="100" show-overflow-tooltip/>
        <el-table-column prop="arrearagesDays" label="付款天数" width="80" show-overflow-tooltip/>
        <el-table-column prop="invoiceTypeName" label="发票类型" width="140" show-overflow-tooltip/>
        <el-table-column prop="paymentTypeName" label="结算类型" width="100" show-overflow-tooltip/>
        <el-table-column prop="contacter" label="联系人" width="100" show-overflow-tooltip/>
        <el-table-column prop="contacterPhone" label="联系人电话" width="120" show-overflow-tooltip/>
        <el-table-column prop="state" label="状态" :formatter="dataGridFormatterState" min-width="80" show-overflow-tooltip/>
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
      queryForm: {
        oid: null,
        name: null,
        arrearagesAmount: 0,
        arrearagesLimit: 0,
        arrearagesDays: 0
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
    dataGridFormatterState (row, column, cellValue) {
      return cellValue ? '启用' : '禁用'
    },

    dataGridLoadData () {
      this.$loading()
      const url = `/chisAPI/supplier/getByCriteriaForAccount`
      let params = this.queryForm
      params.pageNum = this.pagination.currentPage
      params.pageSize = this.pagination.pageSize

      this.$http.get(url, {params}).then((res) => {
        if (res.data.code === 200) {
          this.pagination.total = res.data.resultSet.page.total
          this.dataGrid.data = res.data.resultSet.page.list
        } else {
          this.$message.error(res.data.msg)
        }
        this.$loading().close()
      })
    }

  } // end methods
}
</script>

<style scoped>
</style>
