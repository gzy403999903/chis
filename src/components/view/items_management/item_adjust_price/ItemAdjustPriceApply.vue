<template>
  <div>
    <!--功能菜单-->
    <el-card
      shadow="never"
      body-style="padding: 5px;"
      class="el-card-menus">
      <el-form :model="queryForm" ref="queryForm" :inline="true" size="mini">
        <el-form-item label="申请日期" prop="creationDate">
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
        <el-form-item label="项目名称" prop="name">
          <el-input v-model.trim="queryForm.name" placeholder="项目名称 / 助记码"/>
        </el-form-item>
        <el-form-item label="审批状态" prop="approveState">
          <el-select v-model="queryForm.approveState" placeholder="请选择" style="width: 100px;">
            <el-option label="全部" :value="null"/>
            <el-option label="待审核" :value="approveState.PENDING"/>
            <el-option label="通过" :value="approveState.APPROVED"/>
            <el-option label="驳回" :value="approveState.UNAPPROVED"/>
            <el-option label="撤销" :value="approveState.CANCEL"/>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" round icon="el-icon-search"  @click="dataGridLoadData">查询</el-button>
          <el-button type="default" round icon="el-icon-refresh" @click="$refs.queryForm.resetFields()">重置</el-button>
          <el-button type="default" round icon="el-icon-plus"    @click="dialogOpen">新建调价单</el-button>
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
        <el-table-column prop="creationDate" label="单据日期" width="100" show-overflow-tooltip/>
        <el-table-column prop="lsh" label="流水号" width="220" show-overflow-tooltip/>
        <el-table-column prop="cimItemTypeName" label="项目类型" width="100" show-overflow-tooltip/>
        <el-table-column prop="cimItemName" label="项目名称" width="200" show-overflow-tooltip/>
        <el-table-column prop="itemUnitsName" label="销售单位" width="80" show-overflow-tooltip/>
        <el-table-column prop="quantity" label="执行次数" width="80" show-overflow-tooltip/>
        <el-table-column prop="originalRetailPrice" label="原零售价" width="80" show-overflow-tooltip/>
        <el-table-column prop="newRetailPrice" label="新零售价" width="80" show-overflow-tooltip/>
        <el-table-column prop="creatorName" label="申请人" width="90" show-overflow-tooltip/>
        <el-table-column prop="approverName" label="审批人" width="90" show-overflow-tooltip/>
        <el-table-column prop="approveDate" label="审批日期" width="100" show-overflow-tooltip/>
        <el-table-column prop="approveState" label="审批状态" width="100" :formatter="dataGridFormatterApproveSate" show-overflow-tooltip/>
        <el-table-column prop="expiryDate" label="过期日期" width="100" show-overflow-tooltip/><!--deadline 截止日期-->
        <el-table-column prop="explains" label="调价说明" width="200" show-overflow-tooltip/><!--deadline 截止日期-->
        <el-table-column prop="creatorClinicName" label="申请机构" min-width="400" show-overflow-tooltip/>
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

    <!-- 新建调价单 -->
    <ItemAdjustPriceApplyEdit :visible="dialog.visible"
                              :dialogClose="dialogClose" :data-grid-load-data="dataGridLoadData"/>
  </div>
</template>

<script>
import ItemAdjustPriceApplyEdit from './ItemAdjustPriceApplyEdit'
export default {
  components: {
    ItemAdjustPriceApplyEdit
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
        creationDate: null,
        name: null,
        approveState: null
      },
      dataGrid: {
        data: [],
        row: null
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

    /* -------------------------------------------------------------------------------------------------------------- */
    dataGridFormatterApproveSate (row, column, cellValue) {
      let nowDate = new Date()
      let expiryDate = new Date(row.expiryDate)
      if ((nowDate.getTime() > expiryDate.getTime()) && (cellValue === this.approveState.PRICING || cellValue === this.approveState.PENDING)) {
        return '已过期'
      }
      switch (cellValue) {
        case this.$store.getters.approveState.UNAPPROVED: return '驳回'
        case this.$store.getters.approveState.APPROVED: return '通过'
        case this.$store.getters.approveState.CANCEL: return '撤销'
        case this.$store.getters.approveState.PURCHASING: return '待采购'
        case this.$store.getters.approveState.PRICING: return '待定价'
        case this.$store.getters.approveState.PENDING: return '待审核'
        default: return '未知状态'
      }
    },

    dataGridLoadData () {
      this.$loading()
      const url = `/chisAPI/itemAdjustPrice/getByCriteria`
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
    },

    /* -------------------------------------------------------------------------------------------------------------- */
    /**
     * 打开调价单界面
     */
    dialogOpen () {
      this.dialog.visible = true
    },

    /**
     * 关闭调价单界面
     */
    dialogClose () {
      this.dialog.visible = false
    }
  } // end methods
}
</script>

<style scoped>
</style>
