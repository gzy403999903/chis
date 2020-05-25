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
            placeholder="年度"/>
        </el-form-item>
        <el-form-item label="月度" prop="apMonth">
          <el-date-picker
            style="width: 150px;"
            v-model="queryForm.apMonth"
            type="month"
            format="M"
            placeholder="月度"/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" round icon="el-icon-search"  @click="dataGridLoadData">查 询</el-button>
          <el-button type="default" round icon="el-icon-refresh" @click="$refs.queryForm.resetFields()">重 置</el-button>
          <el-button type="success" round icon="el-icon-link" @click="updateToClose">月 结</el-button>
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
        highlight-current-row
        :row-class-name="tableRowClassName"
        size="mini">
        <el-table-column fixed="left" type="index" width="50"/>
        <el-table-column prop="apYear" label="年度" width="100" show-overflow-tooltip/>
        <el-table-column prop="apMonth" label="月度" width="100" show-overflow-tooltip/>
        <el-table-column label="月结状态" width="100" show-overflow-tooltip>
          <template slot-scope="props">
            {{props.row.closeState ? '已月结' : '未月结'}}
          </template>
        </el-table-column>
        <el-table-column label="期初成本" align="center">
          <el-table-column prop="hsQccb" label="含税" width="100" show-overflow-tooltip/>
          <el-table-column prop="wsQccb" label="无税" width="100" show-overflow-tooltip/>
          <el-table-column label="进项税" width="100" show-overflow-tooltip>
            <template slot-scope="props">
              {{(props.row.hsQccb - props.row.wsQccb).toFixed(2)}}
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column label="采购成本" align="center">
          <el-table-column prop="hsCgcb" label="含税" width="100" show-overflow-tooltip/>
          <el-table-column prop="wsCgcb" label="无税" width="100" show-overflow-tooltip/>
          <el-table-column label="进项税" width="100" show-overflow-tooltip>
            <template slot-scope="props">
              {{(props.row.hsCgcb - props.row.wsCgcb).toFixed(2)}}
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column label="退货成本" align="center">
          <el-table-column prop="hsThcb" label="含税" width="100" show-overflow-tooltip/>
          <el-table-column prop="wsThcb" label="无税" width="100" show-overflow-tooltip/>
          <el-table-column label="进项税" width="100" show-overflow-tooltip>
            <template slot-scope="props">
              {{(props.row.hsThcb - props.row.wsThcb).toFixed(2)}}
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column label="销售成本" align="center">
          <el-table-column prop="hsXscb" label="含税" width="100" show-overflow-tooltip/>
          <el-table-column prop="wsXscb" label="无税" width="100" show-overflow-tooltip/>
          <el-table-column label="进项税" width="100" show-overflow-tooltip>
            <template slot-scope="props">
              {{(props.row.hsXscb - props.row.wsXscb).toFixed(2)}}
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column label="领用成本" align="center">
          <el-table-column prop="hsLycb" label="含税" width="100" show-overflow-tooltip/>
          <el-table-column prop="wsLycb" label="无税" width="100" show-overflow-tooltip/>
          <el-table-column label="进项税" width="100" show-overflow-tooltip>
            <template slot-scope="props">
              {{(props.row.hsLycb - props.row.wsLycb).toFixed(2)}}
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column label="报损成本" align="center">
          <el-table-column prop="hsBscb" label="含税" width="100" show-overflow-tooltip/>
          <el-table-column prop="wsBscb" label="无税" width="100" show-overflow-tooltip/>
          <el-table-column label="进项税" width="100" show-overflow-tooltip>
            <template slot-scope="props">
              {{(props.row.hsBscb - props.row.wsBscb).toFixed(2)}}
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column label="期末成本" align="center">
          <el-table-column prop="hsQmcb" label="含税" width="100" show-overflow-tooltip/>
          <el-table-column prop="wsQmcb" label="无税" width="100" show-overflow-tooltip/>
          <el-table-column label="进项税" width="100" show-overflow-tooltip>
            <template slot-scope="props">
              {{(props.row.hsQmcb - props.row.wsQmcb).toFixed(2)}}
            </template>
          </el-table-column>
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
import moment from 'moment'
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

  mounted () {
    console.log(moment().year())
  },

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
      let url = '/chisAPI/workDayClose/getClinicListByCriteria'
      let params = this.queryForm
      params.pageNum = this.pagination.currentPage
      params.pageSize = this.pagination.pageSize

      this.$http.get(url, {params}).then((res) => {
        if (res.data.code === 200) {
          this.pagination.total = res.data.resultSet.page.total
          this.dataGrid.data = res.data.resultSet.page.list
          // this.adjustTableHeight()
        }
        this.$loading().close()
      })
    },

    /**
     * 月结操作
     */
    updateToClose () {
      this.$confirm(`当前逻辑日为
        <span style="font-size: 20px; font-weight: 600; color: red; padding: 0 10px;">${moment(new Date()).format('YYYY-MM-DD')}</span>,
        确认执行操作吗?`, '提示', {
        dangerouslyUseHTMLString: true, confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', showClose: false
      }).then(() => {
        this.$loading()
        const url = `/chisAPI/workDayClose/updateToClose`
        let method = 'PUT'
        let params = {
          userDate: moment(new Date()).format('YYYY-MM-DD')
        }
        this.$http({method, url, params}).then((res) => {
          if (res.data.code === 200) {
            this.$message.success(res.data.msg)
            this.dataGridLoadData()
          } else {
            this.$loading().close()
          }
        }) // end http
      }).catch(() => {}) // end confirm
    }

  } // end methods
}
</script>

<style scoped>
</style>
