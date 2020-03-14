<template>
  <div>
    <!--功能菜单-->
    <el-card
      shadow="never"
      body-style="padding: 5px;"
      class="el-card-menus">
      <el-form :model="queryForm" ref="queryForm" :inline="true" size="mini">
        <el-form-item label="会员姓名" prop="name">
          <el-input v-model.trim="queryForm.name" placeholder="会员姓名 / 助记码"/>
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model.trim="queryForm.phone" placeholder="联系电话"/>
        </el-form-item>
        <el-form-item label="身份证号码" prop="idCardNo">
          <el-input v-model.trim="queryForm.idCardNo" placeholder="证件号码"/>
        </el-form-item>
        <el-form-item label="健康状况" prop="healthState">
          <el-select v-model="queryForm.healthState" placeholder="请选择" style="width: 130px;">
            <el-option label="全部"    :value="null"/>
            <el-option label="有暴露史" value="hasExposure"/>
            <el-option label="有过敏史" value="hasAllergy"/>
            <el-option label="有既往史" value="hasPrevious"/>
            <el-option label="有家族史" value="hasFamily"/>
            <el-option label="有遗传病" value="hasGeneticIllness"/>
            <el-option label="有残疾"   value="hasDisability"/>
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
        :stripe="true"
        size="mini">
        <el-table-column fixed="left" type="index" width="50"/>
        <el-table-column fixed="left" label="操作" align="center" width="90">
          <template slot-scope="scope">
            <el-button size="mini" type="default" icon="el-icon-s-order" @click="dialogOpen(scope.row)">档案</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="oid" label="会员编码" width="150" show-overflow-tooltip/>
        <el-table-column prop="name" label="姓名" width="100" show-overflow-tooltip/>
        <el-table-column prop="phone" label="电话" width="120" show-overflow-tooltip/>
        <el-table-column prop="idCardNo" label="身份证号" width="200" show-overflow-tooltip/>
        <el-table-column prop="hasAllergy" label="过敏史" width="90" show-overflow-tooltip/>
        <el-table-column prop="hasExposure" label="暴露史" width="90" show-overflow-tooltip/>
        <el-table-column prop="hasPrevious" label="既往史" width="90" show-overflow-tooltip/>
        <el-table-column prop="hasFamily" label="家族史" width="90" show-overflow-tooltip/>
        <el-table-column prop="hasGeneticIllness" label="遗传病" width="90" show-overflow-tooltip/>
        <el-table-column prop="hasDisability" label="残疾" min-width="90" show-overflow-tooltip/>
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

    <!-- 添加/编辑 -->
    <HealthArchiveEdit :visible="dialog.visible" :row="dataGrid.row"
                       :dialogClose="dialogClose" :dataGridLoadData="dataGridLoadData"/>
  </div>
</template>

<script>
import HealthArchiveEdit from './HealthArchiveEdit'

export default {

  components: {
    HealthArchiveEdit
  },

  data () {
    return {
      queryForm: {
        name: null,
        phone: null,
        idCardNo: null,
        healthState: null
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
    dataGridFormatterArchiveState (row, column, cellValue) {
      return cellValue ? '是' : '否'
    },

    dataGridFormatterState (row, column, cellValue) {
      return cellValue ? '启用' : '禁用'
    },

    /**
     * 数据载入
     */
    dataGridLoadData () {
      this.$loading()
      const url = `/chisAPI/member/getByCriteriaForHealth`
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

    /* -------------------------------------------------------------------------------------------------------------- */
    /**
     * 打开添加/编辑界面
     * @param row
     */
    dialogOpen (row) {
      this.dataGrid.row = row
      this.dialog.visible = true
    },

    /**
     * 关闭添加/编辑界面
     */
    dialogClose () {
      this.dialog.visible = false
    }

  } // end methods
}
</script>

<style scoped>
</style>
