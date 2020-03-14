<template>
  <el-dialog
    width="65%"
    top="5%"
    :show-close="false"
    :close-on-click-modal="false"
    :visible="visible"
    @opened="dialogOpened"
    @closed="dialogClosed">

    <!-- 模态框标题栏与功能按钮 -->
    <el-row slot="title">
      <el-col :span="5" style="font-size: 20px;">
        <span>疾病诊断标准库</span>
      </el-col>
      <el-col :span="19" style="text-align: right;">
        <el-button size="mini" type="warning" icon="el-icon-right" @click="dialogClose">返 回</el-button>
      </el-col>
    </el-row>

    <!-- 查询功能 -->
    <el-form :model="queryForm" ref="queryForm" :inline="true" size="small">
      <el-form-item label="诊断分类" prop="dwtDiagnoseClassifyId">
        <el-select
          style="width: 320px;"
          v-model.trim="queryForm.dwtDiagnoseClassifyId"
          filterable
          placeholder="请选择">
          <el-option :value="null" label="全部分类"/>
          <el-option v-for="item in (action === 'western' ? westernDiagnoseClassifyList : chineseDiagnoseClassifyList)" :key="item.id" :value="item.id" :label="item.name"/>
        </el-select>
      </el-form-item>
      <el-form-item label="疾病名称" prop="name">
        <el-input v-model.trim="queryForm.name" placeholder="疾病名称 / 助记码"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" round icon="el-icon-search"  @click="dataGridLoadData">查询</el-button>
        <el-button type="default" round icon="el-icon-refresh" @click="$refs.queryForm.resetFields()">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据表 -->
    <el-table
      height="50vh"
      :data="dataGrid.data"
      :stripe="true"
      size="mini">
      <el-table-column fixed="left" type="index" width="50"/>
      <el-table-column fixed="left" label="操作" align="center" width="80">
        <template slot-scope="scope">
          <el-button type="success" size="mini" @click="addToCommonDiagnose(scope.row)" :disabled="scope.row.used === 1">添 加</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="dwtDiagnoseClassifyName" label="分类" width="250" show-overflow-tooltip/>
      <el-table-column prop="oid" label="诊断编码" width="150" show-overflow-tooltip/>
      <el-table-column prop="name" label="疾病名称" min-width="300" show-overflow-tooltip/>
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

  </el-dialog>
</template>

<script>
export default {
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    action: {
      type: String,
      required: true
    },
    dialogClose: {
      type: Function,
      required: true
    },
    previousDataGridLoadData: {
      type: Function,
      required: true
    }
  }, // end props

  data () {
    return {
      queryForm: {
        dwtDiagnoseClassifyId: null,
        name: null
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

  computed: {
    westernDiagnoseClassifyList: function () {
      return this.$store.getters.westernDiagnoseClassifyList
    },
    chineseDiagnoseClassifyList: function () {
      return this.$store.getters.chineseDiagnoseClassifyList
    }
  }, // end computed

  methods: {
    /* -------------------------------------------------------------------------------------------------------------- */
    /**
     * 界面打开后执行的内容
     */
    dialogOpened () {
    },

    /**
     * 关闭添加/编辑界面后执行的内容
     */
    dialogClosed () {
      // 重置查询输入内容
      this.$refs.queryForm.resetFields()
      // 调用它的上级重新载入一次数据
      // this.previousDataGridLoadData()
    },

    /* -------------------------------------------------------------------------------------------------------------- */
    paginationSizeChange (value) {
      this.pagination.pageSize = value
      this.dataGridLoadData()
    },

    paginationCurrentChange (value) {
      this.pagination.currentPage = value
      this.dataGridLoadData()
    },

    /**
     * 数据载入
     */
    dataGridLoadData () {
      this.$loading()
      const url = `/chisAPI/${this.action}DiagnoseLibrary/getByCriteria`
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
     * 添加到常用诊断
     * @param row
     */
    addToCommonDiagnose (row) {
      this.$loading()
      const url = `/chisAPI/${this.action}CommonDiagnose/saveNormative`
      let method = 'POST'
      let params = {
        name: row.name,
        code: row.code
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
    }

  } // end methods
}
</script>

<style scoped>
</style>
