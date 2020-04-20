<template>
  <div>
    <!--功能菜单-->
    <el-card
      shadow="never"
      body-style="padding: 5px;"
      class="el-card-menus">
      <el-form :model="queryForm" ref="queryForm" inline size="mini">
        <el-form-item label="销售日期" prop="creationDate">
          <el-date-picker
            style="width: 280px;"
            v-model="queryForm.creationDate"
            type="daterange"
            align="right"
            unlink-panels
            :clearable="false"
            value-format="yyyy-MM-dd"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptions"/>
        </el-form-item>
        <el-form-item label="机构名称" prop="sysClinicName" v-if="action === 'all'">
          <el-input v-model.trim="queryForm.sysClinicName" placeholder="机构名称 / 助记码" style="width: 150px;"/>
        </el-form-item>
        <el-form-item label="收银员" prop="creatorName">
          <el-input v-model.trim="queryForm.creatorName" placeholder="收银员姓名 / 助记码" style="width: 150px;"/>
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
        border
        show-summary
        highlight-current-row
        size="mini">
        <el-table-column fixed="left" type="index" width="50"/>
        <el-table-column prop="creationDate" label="销售日期" width="120" show-overflow-tooltip/>
        <el-table-column prop="cash" label="现金" width="100" show-overflow-tooltip/>
        <el-table-column prop="memberBalance" label="会员卡(储值)" width="120" show-overflow-tooltip/>
        <el-table-column prop="unionpay" label="银联" width="100" show-overflow-tooltip/>
        <el-table-column prop="alipay" label="支付宝" width="100" show-overflow-tooltip/>
        <el-table-column prop="wechatpay" label="微信" width="100" show-overflow-tooltip/>
        <el-table-column prop="creditpay" label="信用卡" width="100" show-overflow-tooltip/>
        <el-table-column prop="shengyb" label="省医保" width="100" show-overflow-tooltip/>
        <el-table-column prop="shiyb" label="市医保" width="100" show-overflow-tooltip/>
        <!--<el-table-column prop="dkq" label="抵扣券" width="100" show-overflow-tooltip/>-->
        <el-table-column prop="ybk" label="亿保卡" width="100" show-overflow-tooltip/>
        <el-table-column prop="bgflk" label="北国福礼卡" width="120" show-overflow-tooltip/>
        <el-table-column prop="yky" label="一卡易" width="100" show-overflow-tooltip/>
        <el-table-column prop="actualAmount" label="小计" width="100" show-overflow-tooltip/>
        <el-table-column prop="disparityAmount" label="差额" width="100" show-overflow-tooltip/>
        <el-table-column label="收银员ID" width="120" show-overflow-tooltip v-if="groupBy === 'creatorId'">
          <template slot-scope="props">
            {{props.row.creatorId + ' '}}
          </template>
        </el-table-column>
        <el-table-column prop="creatorName" label="收银员姓名" width="120" show-overflow-tooltip v-if="groupBy === 'creatorId'"/>
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
  </div>
</template>

<script>
export default {
  props: {
    action: {
      type: String,
      required: true
    },
    groupBy: {
      type: String,
      required: true
    }
  }, // end props

  data () {
    return {
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        }
      },
      queryForm: {
        creationDate: this.$store.getters.queryDate,
        sysClinicName: null,
        creatorName: null
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
     * 调整表格高度
     * 此方法主要解决 el-table 合计行会出现错位的情况
     * 必须在数据加载完毕后调用
     */
    adjustTableHeight () {
      // 表单总高度
      let tableHeight = document.getElementsByClassName('el-table')[0].offsetHeight
      // 表头高度
      let headerHeight = document.getElementsByClassName('el-table__header-wrapper')[0].offsetHeight
      // 要等表单渲染完成后才能拿到合计行的高度
      this.$nextTick(() => {
        // 合计行高度
        let footerHeight = document.getElementsByClassName('el-table__footer-wrapper')[0].offsetHeight
        // 设置表单正文高度
        document.getElementsByClassName('el-table__body-wrapper')[0].style.height = tableHeight - headerHeight - footerHeight + 'px'
      })
    },

    /**
     * 载入数据
     */
    dataGridLoadData () {
      this.$loading()
      let url = (
        this.action === 'all'
          ? '/chisAPI/paymentRecordReport/getPaymentRecordListByCriteria'
          : '/chisAPI/paymentRecordReport/getClinicPaymentRecordListByCriteria'
      )
      let params = this.queryForm
      params.pageNum = this.pagination.currentPage
      params.pageSize = this.pagination.pageSize
      params.groupBy = this.groupBy

      this.$http.get(url, {params}).then((res) => {
        if (res.data.code === 200) {
          this.pagination.total = res.data.resultSet.page.total
          this.dataGrid.data = res.data.resultSet.page.list
          this.adjustTableHeight()
        }
        this.$loading().close()
      })
    }

  } // end methods
}
</script>

<style scoped>
</style>
