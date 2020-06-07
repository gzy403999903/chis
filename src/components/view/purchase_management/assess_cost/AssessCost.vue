<template>
  <div>
    <!--功能菜单-->
    <el-card
      shadow="never"
      body-style="padding: 5px;"
      class="el-card-menus">
      <el-form :model="queryForm" ref="queryForm" :inline="true" size="mini">
        <el-form-item label="供应商编码" prop="pemSupplierOid">
          <el-input v-model.trim="queryForm.pemSupplierOid" placeholder="供应商编码" style="width: 150px;"/>
        </el-form-item>
        <el-form-item label="供应商名称" prop="pemSupplierName">
          <el-input v-model.trim="queryForm.pemSupplierName" placeholder="供应商名称 / 助记码" style="width: 150px;"/>
        </el-form-item>
        <el-form-item label="商品编码" prop="gsmGoodsOid">
          <el-input v-model.trim="queryForm.gsmGoodsOid" placeholder="商品编码" style="width: 150px;"/>
        </el-form-item>
        <el-form-item label="商品名称" prop="gsmGoodsName">
          <el-input v-model.trim="queryForm.gsmGoodsName" placeholder="商品名称 / 助记码" style="width: 150px;"/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" round icon="el-icon-search"  @click="dataGridLoadData">查询</el-button>
          <el-button type="default" round icon="el-icon-refresh" @click="$refs.queryForm.resetFields()">重置</el-button>
          <el-button type="default" round icon="el-icon-plus"    @click="dialogOpen({})">添加</el-button>
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
        strip
        border
        size="mini">
        <el-table-column fixed="left" type="index"/>
        <el-table-column fixed="left" label="操作" align="center" width="140">
          <template slot-scope="scope">
            <el-button size="mini" icon="el-icon-edit" @click="dialogOpen(scope.row)"/>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="dataGridDelete(scope.row)"/>
          </template>
        </el-table-column>
        <el-table-column prop="pemSupplierOid" label="供应商编码" width="100" show-overflow-tooltip/>
        <el-table-column prop="pemSupplierName" label="供应商名称" width="250" show-overflow-tooltip/>
        <el-table-column prop="gsmGoodsOid" label="商品编码" width="100" show-overflow-tooltip/>
        <el-table-column prop="gsmGoodsName" label="商品名称" width="200" show-overflow-tooltip/>
        <el-table-column prop="goodsUnitsName" label="单位" width="100" show-overflow-tooltip/>
        <el-table-column prop="specs" label="规格" width="150" show-overflow-tooltip/>
        <el-table-column prop="retailPrice" label="零售单价" width="100" show-overflow-tooltip/>
        <el-table-column prop="firstCostPrice" label="一成本价" width="100" show-overflow-tooltip/>
        <el-table-column prop="secondCostPrice" label="二成本价" width="100" show-overflow-tooltip/>
        <el-table-column prop="originName" label="产地" width="100" show-overflow-tooltip/>
        <el-table-column prop="manufacturerName" label="生产厂家" min-width="250" show-overflow-tooltip/>
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

    <!-- 添加/编辑界面 -->
    <AssessCostEdit ref="supplierRebateEdit" :row="dataGrid.row"
                        :dataGridLoadData="dataGridLoadData"/>
  </div>
</template>

<script>
import AssessCostEdit from './AssessCostEdit'
export default {
  components: {
    AssessCostEdit
  },

  data () {
    return {
      queryForm: {
        pemSupplierOid: null,
        pemSupplierName: null,
        gsmGoodsOid: null,
        gsmGoodsName: null
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
     * 载入报表数据
     */
    dataGridLoadData () {
      this.$loading()
      const url = `/chisAPI/assessCost/getByCriteria`
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
     * 删除操作
     */
    dataGridDelete (row) {
      this.$confirm('确认删除吗? 该操作不可恢复！', '提示', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', showClose: false
      }).then(() => {
        this.$loading()
        const url = `/chisAPI/assessCost/delete`
        let method = 'DELETE'
        let params = {
          id: row.id
        }
        this.$http({method, url, params}).then((res) => {
          if (res.data.code === 200) {
            this.$message.success(res.data.msg)
            this.dataGridLoadData()
          } else {
            this.$loading().close()
          }
        })
      }).catch(() => {})
    },

    /* -------------------------------------------------------------------------------------------------------------- */
    /**
     * 打开编辑界面
     * @param row
     */
    dialogOpen (row) {
      this.dataGrid.row = row
      this.$refs.supplierRebateEdit.visible = true
    }
  }

}
</script>

<style scoped>
</style>
