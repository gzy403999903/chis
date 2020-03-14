<template>
  <div>
    <!--功能菜单-->
    <el-card
      shadow="never"
      body-style="padding: 5px;"
      class="el-card-menus">
      <el-form :model="queryForm" ref="queryForm" :inline="true" size="mini">
        <el-form-item label="计划日期" prop="creationDate">
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
        <el-form-item label="商品名称" prop="gsmGoodsName">
          <el-input v-model.trim="queryForm.gsmGoodsName" placeholder="商品名称 / 助记码"/>
        </el-form-item>
        <el-form-item>
          <el-button type="default" round icon="el-icon-refresh" @click="$refs.queryForm.resetFields()">重 置</el-button>
          <el-button type="primary" round icon="el-icon-search"  @click="dataGridLoadData">汇总查询</el-button>
          <el-button type="danger" round icon="el-icon-circle-close" @click="executeAction('unapproved')">驳 回</el-button>
          <el-button type="success" round icon="el-icon-circle-check" @click="executeAction('purchasing')">通 过</el-button>
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
        size="mini">
        <el-table-column fixed="left" type="index" width="50"/>
        <el-table-column fixed="left" type="selection" width="50"/>
        <el-table-column prop="gsmGoodsTypeName" label="商品类型" width="110" show-overflow-tooltip sortable/>
        <el-table-column prop="gsmGoodsOid" label="商品编码" width="100" show-overflow-tooltip sortable/>
        <el-table-column prop="gsmGoodsName" label="商品名称" width="200" show-overflow-tooltip sortable/>
        <el-table-column prop="gsmGoodsSpecs" label="规格" width="120" show-overflow-tooltip/>
        <el-table-column prop="goodsUnitsName" label="单位" width="80" show-overflow-tooltip/>
        <el-table-column prop="quantity" label="计划数量" width="100"/>
        <el-table-column prop="recommendQuantity" label="建议数量" width="80"/>
        <el-table-column prop="planDays" label="计划天数" width="80"/>
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
        creationDate: null,
        gsmGoodsName: null
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
    /**
     * 载入数据
     */
    dataGridLoadData () {
      this.$loading()
      const url = '/chisAPI/purchasePlan/getPendingGroupListByCriteria'
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

    /**
     * 执行对应的操作
     * @param action
     * @returns {boolean}
     */
    executeAction (action) {
      let rows = this.$refs.purchasePlanTable.selection
      if (rows.length === 0) {
        return false
      }

      let idArray = ''
      for (let i = 0; i < rows.length; i++) {
        idArray = idArray + ',' + rows[i].idArray
      }

      this.$confirm('确认执行该操作吗?', '提示', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', showClose: false
      }).then(() => {
        this.$loading()
        const url = `/chisAPI/purchasePlan/${action}`
        let method = 'PUT'
        let params = {
          planIdArray: idArray.split(',')
        }

        this.$http({method, url, params}).then((res) => {
          if (res.data.code === 200) {
            this.$message.success(res.data.msg)
            this.dataGridLoadData()
          } else {
            this.$message.error(res.data.msg)
            this.$loading().close()
          }
        })
      }).catch(() => {})
    }

  } // end methods
}
</script>

<style scoped>
</style>
