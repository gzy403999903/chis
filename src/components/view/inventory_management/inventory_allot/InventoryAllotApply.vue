<template>
  <div>
    <!--功能菜单-->
    <el-card
      shadow="never"
      body-style="padding: 5px;"
      class="el-card-menus">
      <el-form :model="queryForm" ref="queryForm" inline size="mini">
        <el-form-item label="单据日期" prop="creationDate">
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
        <el-form-item label="商品名称" prop="gsmGoodsName">
          <el-input v-model.trim="queryForm.gsmGoodsName" placeholder="商品名称 / 助记码" style="width: 150px;"/>
        </el-form-item>
        <!--
        <el-form-item label="审批状态" prop="approveState">
          <el-select v-model="queryForm.approveState" placeholder="请选择" style="width: 120px;">
            <el-option label="全部" :value="null"/>
            <el-option label="通过" :value="approveState.APPROVED"/>
            <el-option label="驳回" :value="approveState.UNAPPROVED"/>
          </el-select>
        </el-form-item>
        -->
        <el-form-item>
          <el-button type="primary" round icon="el-icon-search"  @click="dataGridLoadData">查询</el-button>
          <el-button type="default" round icon="el-icon-refresh" @click="$refs.queryForm.resetFields()">重置</el-button>
          <el-button type="default" round icon="el-icon-plus"  @click="dialogOpen">新建调拨单</el-button>
        </el-form-item>
      </el-form>
    </el-card>

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
        <el-table-column prop="creationDate" label="单据日期" width="160" show-overflow-tooltip/>
        <el-table-column prop="lsh" label="流水号" width="220" show-overflow-tooltip/>
        <el-table-column prop="originalIymInventoryTypeName" label="调出库房" width="100" show-overflow-tooltip/>
        <el-table-column prop="toIymInventoryTypeName" label="调入库房" width="100" show-overflow-tooltip/>
        <el-table-column prop="gsmGoodsOid" label="编码" width="100" show-overflow-tooltip/>
        <el-table-column prop="gsmGoodsName" label="商品名称" width="180" show-overflow-tooltip/>
        <el-table-column prop="goodsUnitsName" label="单位" width="90" show-overflow-tooltip/>
        <el-table-column prop="gsmGoodsSpecs" label="规格" width="120" show-overflow-tooltip/>
        <el-table-column prop="quantity" label="调拨数量" width="80" show-overflow-tooltip/>
        <el-table-column prop="ph" label="批号" width="120" show-overflow-tooltip/>
        <el-table-column prop="pch" label="批次号" width="120" show-overflow-tooltip/>
        <el-table-column prop="creatorName" label="操作人" min-width="110" show-overflow-tooltip/>
        <!--
        <el-table-column prop="approveDate" label="审批时间" width="160" show-overflow-tooltip sortable/>
        <el-table-column prop="approverName" label="审批人" width="110" show-overflow-tooltip sortable/>
        <el-table-column prop="approveState" label="审批状态" min-width="110" :formatter="dataGridFormatterApproveSate" sortable/>
        -->
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

    <!-- 库房调拨单 -->
    <InventoryAllotApplyEdit :visible="dialog.visible"
                             :dialogClose="dialogClose" :dataGridLoadData="dataGridLoadData"/>
  </div>
</template>

<script>
import InventoryAllotApplyEdit from './InventoryAllotApplyEdit'
export default {
  components: {
    InventoryAllotApplyEdit
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
        creationDate: this.$store.getters.queryDate,
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
      },
      dialog: {
        visible: false
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
        case this.$store.getters.approveState.UNAPPROVED: return '驳回'
        case this.$store.getters.approveState.APPROVED: return '通过'
        case this.$store.getters.approveState.CANCEL: return '撤销'
        case this.$store.getters.approveState.PENDING: return '待审核'
        default: return '未知状态'
      }
    },

    dataGridLoadData () {
      this.$loading()
      const url = '/chisAPI/inventoryAllot/getClinicListByCriteria'
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
    },

    /* -------------------------------------------------------------------------------------------------------------- */
    dialogOpen () {
      this.dialog.visible = true
    },
    dialogClose () {
      this.dialog.visible = false
    }
  } // end methods
}
</script>

<style scoped>
</style>
