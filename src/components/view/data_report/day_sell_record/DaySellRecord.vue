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
        <el-form-item>
          <el-button type="primary" round icon="el-icon-search"  @click="dataGridLoadData">查询</el-button>
          <el-button type="default" round icon="el-icon-refresh" @click="$refs.queryForm.resetFields()">重置</el-button>
          <el-button type="default" round icon="el-icon-download" @click="downloadExcel" :disabled="!dataGrid.data.length">导出Excel</el-button>
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
        <el-table-column prop="sysClinicName" label="机构名称" width="400" show-overflow-tooltip/>
        <el-table-column prop="xyf" label="西药/中成药" width="100" show-overflow-tooltip/>
        <el-table-column prop="zyf" label="中药" width="100" show-overflow-tooltip/>
        <el-table-column prop="wsclf" label="卫生材料" width="100" show-overflow-tooltip/>
        <el-table-column prop="yjxmf" label="医技项目" width="100" show-overflow-tooltip/>
        <el-table-column prop="fzxmf" label="辅助项目" width="100" show-overflow-tooltip/>
        <el-table-column prop="qtxmf" label="其他项目" width="100" show-overflow-tooltip/>
        <el-table-column prop="rxs" label="日销售" width="100" show-overflow-tooltip/>
        <el-table-column prop="yxs" label="月销售" min-width="100" show-overflow-tooltip/>
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
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        }
      },
      queryForm: {
        creationDate: this.$store.getters.queryDate
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
      let url = '/chisAPI/sellRecordReport/getDaySellRecordByCreationDate'
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
    },

    /**
     * 下载 excel
     */
    downloadExcel () {
      this.$loading()
      let params = this.queryForm
      let url = '/chisAPI/sellRecordReport/downloadDaySellRecordExcel'
      this.$http({method: 'GET', url, params, responseType: 'blob'}).then(res => {
        const blob = new Blob([res.data], {type: 'application/vnd.ms-excel;charset=utf-8'}) // 创建 Blob 对象
        const url = window.URL.createObjectURL(blob) // 获取下载地址
        const aLink = document.createElement('a') // 创建下载元素(a标签)
        aLink.style.display = 'none' // 隐藏当前该下载元素
        aLink.href = url // 设置该下载标签的下载地址

        // 下载文件名
        let fileName = '日销售报表(含税)' +
          this.queryForm.creationDate[0] + '至' +
          this.queryForm.creationDate[1] + '.xlsx'

        aLink.setAttribute('download', fileName) // 设置下载属性
        document.body.appendChild(aLink) // 将标签添加至 body
        aLink.click() // 点击进行下载
        document.body.removeChild(aLink) // 下载完成移除该下载元素
        window.URL.revokeObjectURL(url) // 释放掉 Blob 对象
        this.$loading().close() // 关闭 loading
      })
    }

  } // end methods
}
</script>

<style scoped>
</style>
