<template>
  <div>
    <!--功能菜单-->
    <el-card
      shadow="never"
      body-style="padding: 5px;"
      class="el-card-menus">
      <el-form :model="queryForm" ref="queryForm" :inline="true" size="mini">
        <el-form-item label="审批日期" prop="approveDate">
          <el-date-picker
            v-model="queryForm.approveDate"
            type="daterange"
            align="right"
            unlink-panels
            value-format="yyyy-MM-dd"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptions"/>
        </el-form-item>
        <el-form-item>
          <!--<el-button type="default" round icon="el-icon-refresh" @click="$refs.queryForm.resetFields()">重 置</el-button>-->
          <el-button type="primary" round icon="el-icon-search"  @click="dataGridLoadData">载入计划</el-button>
          <el-button type="default" round icon="el-icon-document-add" @click="dataGridShowSelectedRows">商品筛选【{{dataGrid.selectedRows.length}}】</el-button>
          <el-button type="default" round icon="el-icon-edit-outline" @click="dialogOpen">制作订单</el-button>
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
        size="mini"
        @select="dataGridSelectRow"
        @select-all="dataGridSelectRow">
        <el-table-column fixed="left" type="index" width="50"/>
        <el-table-column fixed="left" type="selection" width="50"/>
        <el-table-column prop="gsmGoodsTypeName" label="商品类型" width="110" show-overflow-tooltip/>
        <el-table-column prop="gsmGoodsOid" label="商品编码" width="80" show-overflow-tooltip/>
        <el-table-column prop="gsmGoodsName" label="商品名称" width="200" show-overflow-tooltip sortable/>
        <el-table-column prop="gsmGoodsSpecs" label="规格" width="120" show-overflow-tooltip/>
        <el-table-column prop="goodsUnitsName" label="单位" width="80" show-overflow-tooltip/>
        <el-table-column prop="quantity" label="计划数量" width="100"/>
        <el-table-column prop="recommendQuantity" label="建议数量" width="100"/>
        <el-table-column prop="planDays" label="计划天数" width="100"/>
        <el-table-column prop="originName" label="产地" width="100" show-overflow-tooltip sortable/>
        <el-table-column prop="manufacturerName" label="生产厂家" min-width="220" show-overflow-tooltip sortable/>
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

    <!-- 生成订单 -->
    <PurchaseOrderApplyEdit :visible="dialog.visible" :selectedRows="dataGrid.selectedRows"
                            :dialogClose="dialogClose" :dataGridDeleteSelectedRow="dataGridDeleteSelectedRow"
                            :dataGridLoadData="dataGridLoadData"/>

  </div>
</template>

<script>
import PurchaseOrderApplyEdit from './PurchaseOrderApplyEdit'

export default {
  components: {
    PurchaseOrderApplyEdit
  },

  data () {
    return {
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        }
      },
      queryForm: {
        approveDate: null
      },
      dataGrid: {
        data: [],
        selectedRows: []
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
        visible: false
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

    dataGridLoadData () {
      this.$loading()
      const url = '/chisAPI/purchasePlan/getPurchasingGroupListByCriteria'
      let params = this.queryForm
      params.pageNum = this.pagination.currentPage
      params.pageSize = this.pagination.pageSize

      this.$http.get(url, {params}).then((res) => {
        if (res.data.code === 200) {
          this.pagination.total = res.data.resultSet.page.total
          this.dataGrid.data = res.data.resultSet.page.list
          this.dataGrid.selectedRows = []
        } else {
          this.$message.error(res.data.msg)
        }
        this.$loading().close()
      })
    },

    dataGridSelectRow (selection, row) {
      this.dataGrid.selectedRows = this.$refs.purchasePlanTable.selection
    },

    dataGridShowSelectedRows () {
      if (this.dataGrid.selectedRows.length === 0) {
        this.$message.warning('没有可列出的内容')
      } else {
        this.dataGrid.data = this.dataGrid.selectedRows
        this.$message.success('已列出选择商品, 可再次进行勾选以更新内容')
      }
    },

    dataGridDeleteSelectedRow (gsmGoodsId) {
      this.dataGrid.selectedRows = this.dataGrid.selectedRows.filter((item) => {
        return gsmGoodsId !== item.gsmGoodsId
      })

      // 选中对应数据表的行
      this.$refs.purchasePlanTable.clearSelection() // 取消勾选所有行
      if (this.dataGrid.selectedRows.length > 0) {
        this.dataGrid.selectedRows.forEach(row => {
          this.$refs.purchasePlanTable.toggleRowSelection(row, true)
        })
      }
    },

    /* -------------------------------------------------------------------------------------------------------------- */
    dialogOpen () {
      if (this.dataGrid.selectedRows.length > 0) {
        this.dialog.visible = true
      }
    },

    dialogClose () {
      this.dialog.visible = false
    }
  }
}
</script>

<style scoped>
</style>
