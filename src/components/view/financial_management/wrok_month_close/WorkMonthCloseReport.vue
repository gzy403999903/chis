<template>
  <div>
    <!--功能菜单-->
    <el-card
      shadow="never"
      body-style="padding: 5px;"
      class="el-card-menus">
      <el-form :model="queryForm" ref="queryForm" inline size="mini">
        <el-form-item label="年度" prop="apYear">
          <el-date-picker
            style="width: 150px;"
            v-model="queryForm.apYear"
            type="year"
            :clearable="false"
            placeholder="年度"/>
        </el-form-item>
        <el-form-item label="月度" prop="apMonth">
          <el-date-picker
            style="width: 150px;"
            v-model="queryForm.apMonth"
            type="month"
            format="M"
            value-format="M"
            :clearable="false"
            placeholder="月度"/>
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
        :height="$store.getters.dataGridHeight"
        :data="dataGrid.data"
        border
        stripe
        highlight-current-row
        show-summary
        size="mini">
        <el-table-column fixed="left" type="index" width="50"/>
        <el-table-column prop="sysClinicName" label="机构名称" min-width="420" show-overflow-tooltip/>
        <el-table-column label="年度" width="100" show-overflow-tooltip>
          <template slot-scope="props">
            {{props.row.apYear}}
          </template>
        </el-table-column>
        <el-table-column label="月度" width="100" show-overflow-tooltip>
          <template slot-scope="props">
            {{props.row.apMonth}}
          </template>
        </el-table-column>
       <!--
        <el-table-column label="月结状态" width="100" show-overflow-tooltip>
           <template slot-scope="props">
             {{props.row.closeState ? '已月结' : '未月结'}}
           </template>
         </el-table-column>
       -->
        <el-table-column label="期初成本" align="center">
          <el-table-column prop="hsQccb" label="含税" width="100" show-overflow-tooltip/>
          <el-table-column prop="wsQccb" label="无税" width="100" show-overflow-tooltip/>
          <el-table-column prop="seQccb" label="进项税" width="100" show-overflow-tooltip/>
        </el-table-column>
        <el-table-column label="采购成本" align="center">
          <el-table-column prop="hsCgcb" label="含税" width="100" show-overflow-tooltip/>
          <el-table-column prop="wsCgcb" label="无税" width="100" show-overflow-tooltip/>
          <el-table-column prop="seCgcb" label="进项税" width="100" show-overflow-tooltip/>
        </el-table-column>
        <el-table-column label="退货成本" align="center">
          <el-table-column prop="hsThcb" label="含税" width="100" show-overflow-tooltip/>
          <el-table-column prop="wsThcb" label="无税" width="100" show-overflow-tooltip/>
          <el-table-column prop="seThcb" label="进项税" width="100" show-overflow-tooltip/>
        </el-table-column>
        <el-table-column label="销售成本" align="center">
          <el-table-column prop="hsXscb" label="含税" width="100" show-overflow-tooltip/>
          <el-table-column prop="wsXscb" label="无税" width="100" show-overflow-tooltip/>
          <el-table-column prop="seXscb" label="进项税" width="100" show-overflow-tooltip/>
        </el-table-column>
        <el-table-column label="领用成本" align="center">
          <el-table-column prop="hsLycb" label="含税" width="100" show-overflow-tooltip/>
          <el-table-column prop="wsLycb" label="无税" width="100" show-overflow-tooltip/>
          <el-table-column prop="seLycb" label="进项税" width="100" show-overflow-tooltip/>
        </el-table-column>
        <el-table-column label="报损成本" align="center">
          <el-table-column prop="hsBscb" label="含税" width="100" show-overflow-tooltip/>
          <el-table-column prop="wsBscb" label="无税" width="100" show-overflow-tooltip/>
          <el-table-column prop="seBscb" label="进项税" width="100" show-overflow-tooltip/>
        </el-table-column>
        <el-table-column label="期末成本" align="center">
          <el-table-column prop="hsQmcb" label="含税" width="100" show-overflow-tooltip/>
          <el-table-column prop="wsQmcb" label="无税" width="100" show-overflow-tooltip/>
          <el-table-column prop="seQmcb" label="进项税" width="100" show-overflow-tooltip/>
        </el-table-column>
        <el-table-column prop="operatorName" label="操作人" width="100" show-overflow-tooltip/>
        <el-table-column prop="operateDate" label="月结时间" min-width="160" show-overflow-tooltip/>
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
import accountPeriod from '../../../../common/accountPeriod'
export default {
  data () {
    return {
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        }
      },
      queryForm: {
        apYear: accountPeriod.getYear().toString(),
        apMonth: accountPeriod.getMonth().toString()
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
     * 渲染表格行颜色
     */
    tableRowClassName ({row, rowIndex}) {
      if (!row.closeState) {
        return 'warning-row'
      }
      return ''
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
      let url = '/chisAPI/workMonthClose/getByCriteria'
      let params = this.queryForm
      params.pageNum = this.pagination.currentPage
      params.pageSize = this.pagination.pageSize

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
