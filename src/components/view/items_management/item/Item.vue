<template>
  <div>
    <!--功能菜单-->
    <el-card
      shadow="never"
      body-style="padding: 5px;"
      class="el-card-menus">
      <el-form :model="queryForm" ref="queryForm" :inline="true" size="mini">
        <el-form-item label="项目名称" prop="name">
          <el-input v-model.trim="queryForm.name" :placeholder="`${title}名称 / 助记码`" style="width: 150px;"/>
        </el-form-item>
        <el-form-item label="医保项目" prop="ybItem">
          <el-select v-model="queryForm.ybItem" placeholder="请选择" style="width: 100px;">
            <el-option label="全部" :value="null"/>
            <el-option label="是" :value="true"/>
            <el-option label="否" :value="false"/>
          </el-select>
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
        <el-table-column fixed="left" label="操作" align="center" width="120">
          <template slot-scope="scope">
            <el-button size="mini" icon="el-icon-edit" v-if="!scope.row.required" @click="dialogOpen(scope.row)"/>
            <el-button size="mini" type="danger" icon="el-icon-delete" v-if="!scope.row.required" @click="dataGridDelete(scope.row)"/>
          </template>
        </el-table-column>
        <el-table-column prop="name" :label="`${title}名称`" width="200" show-overflow-tooltip/>
        <el-table-column prop="itemUnitsName" label="单位" width="100" show-overflow-tooltip/>
        <el-table-column prop="befitGenderName" label="适用性别" width="150" :formatter="dataGridFormatterBefitGenderName" show-overflow-tooltip/>
        <el-table-column prop="billingTypeName" label="计费类型" width="150" show-overflow-tooltip/>
        <el-table-column prop="retailPrice" label="零售单价" width="100" show-overflow-tooltip/>
        <el-table-column prop="quantity" label="包含次数" width="100" show-overflow-tooltip/>
        <el-table-column prop="discountable" label="参与打折" width="100" :formatter="dataGridFormatterDiscountable" show-overflow-tooltip/>
        <el-table-column prop="returnable" label="可退费" width="100" :formatter="dataGridFormatterReturnable" show-overflow-tooltip/>
        <el-table-column prop="state" label="状态" :formatter="dataGridFormatterState" show-overflow-tooltip/>
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

    <!-- 编辑操作 -->
    <ItemEdit :title="title" :action="action" :row="dataGrid.row"
              :visible="dialog.visible" :dialogClose="dialogClose" :dataGridLoadData="dataGridLoadData"/>

  </div>
</template>

<script>
import ItemEdit from './ItemEdit'
export default {
  components: {
    ItemEdit
  },

  props: {
    title: {
      type: String,
      required: true
    },
    action: {
      type: String,
      required: true
    }
  },

  data () {
    return {
      queryForm: {
        name: '',
        ybItem: null,
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
    dataGridFormatterDiscountable (row, column, cellValue) {
      return cellValue ? '是' : '否'
    },

    dataGridFormatterReturnable (row, column, cellValue) {
      return cellValue ? '是' : '否'
    },

    dataGridFormatterState (row, column, cellValue) {
      return cellValue ? '启用' : '禁用'
    },

    dataGridFormatterBefitGenderName (row, column, cellValue) {
      return cellValue === undefined ? '全部' : cellValue
    },

    dataGridLoadData () {
      this.$loading()
      const url = `/chisAPI/${this.action}/getByCriteria`
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
        const url = `/chisAPI/${this.action}/delete`
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
