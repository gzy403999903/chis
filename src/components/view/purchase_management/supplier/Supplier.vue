<template>
  <div>
    <!--功能菜单-->
    <el-card
      shadow="never"
      body-style="padding: 5px;"
      class="el-card-menus">
      <el-form :model="queryForm" ref="queryForm" :inline="true" size="mini">
        <el-form-item label="供应商编码" prop="oid">
          <el-input v-model.trim="queryForm.oid" placeholder="供应商编码" style="width: 150px;"/>
        </el-form-item>
        <el-form-item label="供应商名称" prop="name">
          <el-input v-model.trim="queryForm.name" placeholder="供应商名称 / 助记码" style="width: 150px;"/>
        </el-form-item>
        <el-form-item label="联系人电话" prop="contacterPhone">
          <el-input v-model.trim="queryForm.contacterPhone" placeholder="联系人电话" style="width: 150px;"/>
        </el-form-item>
        <el-form-item label="状态" prop="state">
          <el-select v-model="queryForm.state" placeholder="请选择" style="width: 100px;">
            <el-option label="全部" :value="null"/>
            <el-option label="启用" :value="true"/>
            <el-option label="禁用" :value="false"/>
          </el-select>
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
        <el-table-column fixed="left" type="index"/>
        <el-table-column fixed="left" label="操作" align="center" width="140">
          <template slot-scope="scope">
            <el-button size="mini" icon="el-icon-edit" @click="dialogOpen(scope.row)"/>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="dataGridDelete(scope.row)"/>
          </template>
        </el-table-column>
        <el-table-column prop="oid" label="供应商编码" width="100" show-overflow-tooltip/>
        <el-table-column prop="name" label="供应商名" width="300" show-overflow-tooltip/>
        <el-table-column prop="legalPerson" label="公司法人" width="100" show-overflow-tooltip/>
        <el-table-column prop="tel" label="联系电话" width="120" show-overflow-tooltip/>
        <el-table-column prop="fax" label="传真" width="120" show-overflow-tooltip/>
        <el-table-column prop="contacter" label="联系人" width="100" show-overflow-tooltip/>
        <el-table-column prop="contacterPhone" label="联系人电话" width="150" show-overflow-tooltip/>
        <el-table-column prop="address" label="地址" min-width="300" show-overflow-tooltip/>
        <el-table-column prop="state" label="状态" :formatter="dataGridFormatterState" width="100" show-overflow-tooltip/>
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

    <!-- 添加编辑功能 -->
    <Edit :row="dataGrid.row" :visible="dialog.visible"
          :dialogClose="dialogClose" :dataGridLoadData="dataGridLoadData"/>

  </div>
</template>

<script>
import Edit from './Edit'

export default {

  components: {
    Edit
  },

  data () {
    return {
      queryForm: {
        oid: null,
        name: null,
        contacterPhone: null,
        state: null
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
    dataGridFormatterState (row, column, cellValue) {
      return cellValue ? '启用' : '禁用'
    },

    dataGridLoadData () {
      this.$loading()
      const url = `/chisAPI/supplier/getByCriteria`
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

    dataGridDelete (row) {
      this.$confirm('确认删除吗? 该操作不可恢复！', '提示', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', showClose: false
      }).then(() => {
        this.$loading()
        const url = `/chisAPI/supplier/delete`
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
    dialogOpen (row) {
      this.dataGrid.row = row
      this.dialog.visible = true
    },

    dialogClose () {
      this.dialog.visible = false
    }
  }

}
</script>

<style scoped>
</style>
