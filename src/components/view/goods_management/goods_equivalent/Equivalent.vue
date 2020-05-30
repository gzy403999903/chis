<template>
  <div>
    <!--功能菜单-->
    <el-card
      shadow="never"
      body-style="padding: 5px;"
      class="el-card-menus">
      <el-form :model="queryForm" ref="queryForm" :inline="true" size="mini">
        <el-form-item label="使用商品名称" prop="useGsmGoodsName">
          <el-input v-model.trim="queryForm.useGsmGoodsName" placeholder="使用商品名称 / 助记码"/>
        </el-form-item>
        <el-form-item label="参照商品名称" prop="referGsmGoodsName">
          <el-input v-model.trim="queryForm.referGsmGoodsName" placeholder="参照商品名称 / 助记码"/>
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
        :stripe="true"
        size="mini">
        <el-table-column fixed="left" type="index" width="50"/>
        <el-table-column fixed="left" label="操作" align="center" width="120">
          <template slot-scope="scope">
            <el-button size="mini" icon="el-icon-edit" @click="dialogOpen(scope.row)"/>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="dataGridDelete(scope.row)"/>
          </template>
        </el-table-column>
        <el-table-column prop="useGsmGoodsName" label="使用商品名称" width="200" show-overflow-tooltip/>
        <el-table-column prop="useGoodsUnitsName" label="使用商品单位" width="120" show-overflow-tooltip/>
        <el-table-column prop="referGsmGoodsName" label="参照商品名称" width="200" show-overflow-tooltip/>
        <el-table-column prop="referGoodsUnitsName" label="参照商品单位" width="120" show-overflow-tooltip/>
        <el-table-column prop="referQuantity" label="每个基本单位参照的数量" min-width="250" show-overflow-tooltip/>
        <el-table-column prop="creatorName" label="创建人" width="120" show-overflow-tooltip/>
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

    <!-- 编辑界面 -->
    <EquivalentEdit ref="equivalentEdit"
                    :row="dataGrid.row" :data-grid-load-data="dataGridLoadData"/>
  </div>
</template>

<script>
import EquivalentEdit from './EquivalentEdit'
export default {
  components: {
    EquivalentEdit
  },

  data () {
    return {
      queryForm: {
        useGsmGoodsName: '',
        referGsmGoodsName: null
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
     * 数据载入
     */
    dataGridLoadData () {
      this.$loading()
      const url = `/chisAPI/equivalent/getByCriteria`
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
        const url = `/chisAPI/equivalent/delete`
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

    /**
     * 开启添加 / 编辑界面
     */
    dialogOpen (row) {
      this.dataGrid.row = row
      this.$refs.equivalentEdit.visible = true
    },

    /**
     * 关闭添加 / 编辑界面
     */
    dialogClose () {
      this.$refs.equivalentEdit.visible = false
    }

  } // end methods
}
</script>

<style scoped>
</style>
