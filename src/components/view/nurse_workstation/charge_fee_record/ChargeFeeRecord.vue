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
        <el-form-item label="流水号" prop="lsh">
          <el-input v-model.trim="queryForm.lsh" placeholder="流水号" style="width: 210px;"/>
        </el-form-item>
        <el-form-item label="会员姓名" prop="mrmMemberName">
          <el-input v-model.trim="queryForm.mrmMemberName" placeholder="姓名 / 助记码 / 手机"/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" round icon="el-icon-search"  @click="dataGridLoadData">查询</el-button>
          <el-button type="default" round icon="el-icon-refresh" @click="$refs.queryForm.resetFields()">重置</el-button>
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
        <el-table-column fixed="left" label="操作" align="center" width="210">
          <template slot-scope="scope">
            <el-button size="mini" @click="billDialogOpen(scope.row)">明 细</el-button>
            <el-button size="mini" @click="invoiceDialogOpen(scope.row)">发 票</el-button>
            <el-button size="mini" type="danger" @click="returnedDialogOpen(scope.row)">退 费</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="creationDate" label="单据日期" width="160" show-overflow-tooltip/>
        <el-table-column prop="lsh" label="流水号" width="220" show-overflow-tooltip/>
        <el-table-column prop="sysSellWayName" label="销售方式" width="100" show-overflow-tooltip/>
        <el-table-column prop="mrmMemberOid" label="会员编码" width="120" show-overflow-tooltip/>
        <el-table-column prop="mrmMemberName" label="会员姓名" width="100" show-overflow-tooltip/>
        <el-table-column prop="phone" label="联系电话" width="120" show-overflow-tooltip/>
        <el-table-column prop="totalInvoiceAmount" label="已开票金额" width="120" show-overflow-tooltip/>
        <el-table-column prop="totalSellAmount" label="销售总额(含税)" width="120" show-overflow-tooltip/>
        <el-table-column prop="cashierName" label="收银员" width="100" show-overflow-tooltip/>
        <el-table-column prop="sysClinicName" label="机构名称" min-width="400" show-overflow-tooltip/>
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

    <!-- 发票 -->
    <SellInvoice :visible="dialog.invoiceVisible" :row="dataGrid.row"
                 :dialogClose="invoiceDialogClose" :dataGridLoadData="dataGridLoadData"/>

    <!-- 退费 -->
    <SellReturned :visible="dialog.returnedVisible" :row="dataGrid.row"
                  :dialogClose="returnedDialogClose" :dataGridLoadData="dataGridLoadData"/>

    <!-- 销售流水明细 -->
    <SellLshDetail :visible="dialog.billVisible" :row="dataGrid.row"
                   :dialogClose="billDialogClose"/>
  </div>
</template>

<script>
import SellInvoice from './SellInvoice'
import SellReturned from './SellReturned'
import SellLshDetail from './SellLshDetail'
export default {
  components: {
    SellInvoice,
    SellReturned,
    SellLshDetail
  },

  data () {
    return {
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        }
      },
      queryForm: {
        creationDate: null,
        lsh: null,
        mrmMemberName: null
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
        invoiceVisible: false,
        returnedVisible: false,
        billVisible: false
      }
    }
  }, // end data

  methods: {
    /**
     * 当前页显示行数发生改变时
     * @param value
     */
    paginationSizeChange (value) {
      this.pagination.pageSize = value
      this.dataGridLoadData()
    },

    /**
     * 当前页码发生改变时
     * @param value
     */
    paginationCurrentChange (value) {
      this.pagination.currentPage = value
      this.dataGridLoadData()
    },

    /**
     * 载入数据
     */
    dataGridLoadData () {
      this.$loading()
      let url = `/chisAPI/sellRecord/getClinicGroupListByCriteria`
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

    /**
     * 打开发票界面
     */
    invoiceDialogOpen (row) {
      this.dataGrid.row = row
      this.dialog.invoiceVisible = true
    },

    /**
     * 关闭发票界面
     */
    invoiceDialogClose () {
      this.dialog.invoiceVisible = false
    },

    /**
     * 打开退费界面
     * @param row
     */
    returnedDialogOpen (row) {
      this.dataGrid.row = row
      this.dialog.returnedVisible = true
    },

    /**
     * 关闭退费界面
     */
    returnedDialogClose () {
      this.dialog.returnedVisible = false
    },

    /**
     * 打开收费小票界面
     * @param row
     */
    billDialogOpen (row) {
      this.dataGrid.row = row
      this.dialog.billVisible = true
    },

    /**
     * 关闭收费小票界面
     */
    billDialogClose () {
      this.dialog.billVisible = false
    }
  } // end methods
}
</script>

<style scoped>
</style>
