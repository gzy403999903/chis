<template>
  <div>
    <!-- 功能菜单 -->
    <el-card
      shadow="never"
      body-style="padding: 5px;"
      class="el-card-menus"
      style="padding-right: 10px;">
      <el-button type="default" size="mini" round icon="el-icon-search" @click="dialog.visible = true">条件查询</el-button>
    </el-card>

    <!-- 查询条件界面 -->
    <el-dialog
      width="45%"
      :show-close="false"
      :close-on-click-modal="false"
      :visible="dialog.visible">
      <!-- 模态框标题栏与功能按钮 -->
      <el-row slot="title">
        <el-col :span="5" style="font-size: 20px;">
          <span>条件查询</span>
        </el-col>
        <el-col :span="19" style="text-align: right;">
          <el-button type="primary" size="mini" icon="el-icon-search"  @click="dataGridLoadData">查询</el-button>
          <el-button type="default" size="mini" icon="el-icon-refresh" @click="$refs.queryForm.resetFields()">重置</el-button>
          <el-button type="warning" size="mini" icon="el-icon-right" @click="dialog.visible=false">返 回</el-button>
        </el-col>
      </el-row>

      <el-form :model="queryForm" ref="queryForm" :inline="false" size="mini" label-width="120px" label-position="left" style="padding: 0 20px;">
        <el-form-item label="供应商编码" prop="oid">
          <el-input v-model.trim="queryForm.oid" placeholder="供应商编码"/>
        </el-form-item>
        <el-form-item label="供应商名称" prop="name">
          <el-input v-model.trim="queryForm.name" placeholder="供应商名称 / 助记码"/>
        </el-form-item>
        <el-form-item label="应付金额大于" prop="arrearagesAmount">
          <el-input-number v-model="queryForm.arrearagesAmount" :controls="false" :max="9999999" :min="0" :precision="2"
                           style="width: 100px;"/>&nbsp;元 &nbsp;[大于等于]
        </el-form-item>
        <el-form-item label="受限额度大于" prop="arrearagesLimit">
          <el-input-number v-model="queryForm.arrearagesLimit" :controls="false" :max="9999999" :min="0" :precision="2"
                           style="width: 100px;"/>&nbsp;元 &nbsp;[小于等于]
        </el-form-item>
        <el-form-item label="付款天数大于" prop="arrearagesDays">
          <el-input-number v-model="queryForm.arrearagesDays" :controls="false" :max="9999999" :min="0" :precision="0"
                           style="width: 100px;"/>&nbsp;天 &nbsp;[小于等于]
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
      dialog: {
        visible: false
      },
      queryForm: {
        oid: null,
        name: null,
        arrearagesAmount: undefined,
        arrearagesLimit: undefined,
        arrearagesDays: undefined
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
        }
        this.dialog.visible = false
        this.$loading().close()
      })
    }

  } // end methods
}
</script>

<style scoped>
</style>
