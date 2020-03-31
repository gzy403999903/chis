<template>
  <div>
    <!--功能菜单-->
    <el-card
      shadow="never"
      body-style="padding: 5px;"
      class="el-card-menus">
      <el-form :model="queryForm" ref="queryForm" inline size="mini">
        <el-form-item label="预约日期" prop="appointmentDate">
          <el-date-picker
            v-model="queryForm.appointmentDate"
            type="datetimerange"
            align="right"
            unlink-panels
            :clearable="false"
            value-format="yyyy-MM-dd HH:mm:ss"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptions"/>
        </el-form-item>
        <el-form-item label="会员姓名" prop="mrmMemberName">
          <el-input v-model.trim="queryForm.mrmMemberName" placeholder="姓名 / 助记码 / 手机" style="width: 150px;"/>
        </el-form-item>
        <el-form-item label="状态" prop="finished">
          <el-select v-model="queryForm.finished" placeholder="请选择" style="width: 100px;">
            <el-option label="全部" :value="null"/>
            <el-option label="已完成" :value="true"/>
            <el-option label="未完成" :value="false"/>
          </el-select>
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
        <el-table-column fixed="left" label="操作" align="center" width="80">
          <template slot-scope="scope">
            <el-button size="mini" plain @click="dialogOpen(scope.row)">查 看</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="appointmentDate" label="预约日期" width="160" show-overflow-tooltip/>
        <el-table-column prop="phase" label="当前阶段" width="80" show-overflow-tooltip/>
        <el-table-column prop="mrmMemberOid" label="会员编码" width="150" show-overflow-tooltip/>
        <el-table-column prop="mrmMemberName" label="姓名" width="100" show-overflow-tooltip/>
        <el-table-column prop="phone" label="电话" width="120" show-overflow-tooltip/>
        <el-table-column prop="creatorName" label="创建人" width="100" show-overflow-tooltip/>
        <el-table-column prop="creationDate" label="创建日期" width="160" show-overflow-tooltip/>
        <el-table-column prop="finishDate" label="完成日期" width="160" show-overflow-tooltip/>
        <el-table-column prop="finished" label="状态" min-width="100" show-overflow-tooltip>
          <template slot-scope="props">
            <span v-show="props.row.finished" style="color: #67C23A;">已完成</span>
            <span v-show="!props.row.finished" style="color: #F56C6C;">未完成</span>
          </template>
        </el-table-column>
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

    <!-- 回访界面 -->
    <VisitRecordDetail :visible="dialog.visible" :row="dataGrid.row"
                     :dialogClose="dialogClose"/>
  </div>
</template>

<script>
import VisitRecordDetail from './VisitRecordDetail'
import moment from 'moment'
export default {
  components: {
    VisitRecordDetail
  },

  data () {
    return {
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        }
      },
      queryForm: {
        appointmentDate: [new Date(moment().subtract(1, 'months')), new Date()],
        mrmMemberName: null,
        finished: null
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
        visible: false
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
      let url = '/chisAPI/visitRecord/getByCriteria'
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
     * 打开回访界面
     * @param row
     */
    dialogOpen (row) {
      this.dataGrid.row = row
      this.dialog.visible = true
    },

    /**
     * 关闭回访界面
     */
    dialogClose () {
      this.dialog.visible = false
    }

  } // end methods
}
</script>

<style scoped>
</style>
