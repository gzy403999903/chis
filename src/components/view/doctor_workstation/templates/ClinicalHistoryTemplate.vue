<template>
  <div>
    <!--功能菜单-->
    <el-card
      shadow="never"
      body-style="padding: 5px;"
      class="el-card-menus">
      <el-form :model="queryForm" ref="queryForm" inline size="mini">
        <el-form-item label="模板类型" prop="dwtDiagnoseTypeId">
          <el-select v-model="queryForm.dwtDiagnoseTypeId" placeholder="请选择" style="width: 150px;">
            <el-option label="全部" :value="null"/>
            <el-option label="西医" :value="diagnoseType.WESTERN_DIAGNOSE"/>
            <el-option label="中医" :value="diagnoseType.CHINESE_DIAGNOSE"/>
          </el-select>
        </el-form-item>
        <el-form-item label="病历模板名称" prop="name">
          <el-input v-model.trim="queryForm.name" placeholder="病历模板名称 / 助记码"/>
        </el-form-item>
        <el-form-item label="显示他人共享的" prop="shareState">
          <el-switch v-model="queryForm.shareState" active-color="#13ce66" inactive-color="#ff4949"/>
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
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="dataGridDelete(scope.row)"
                       :disabled="scope.row.sysDoctorId !== payload.userId"/>
          </template>
        </el-table-column>
        <el-table-column prop="dwtDiagnoseTypeName" label="病历类型" width="100" show-overflow-tooltip/>
        <el-table-column prop="name" label="病历名称" width="200" show-overflow-tooltip/>
        <el-table-column prop="notes" label="备注" width="300" show-overflow-tooltip/>
        <el-table-column prop="sysDoctorName" label="创建人" width="100" show-overflow-tooltip/>
        <el-table-column prop="creationDate" label="创建日期" width="160" show-overflow-tooltip/>
        <el-table-column prop="shareState" label="共享状态" min-width="100" :formatter="dataGridFormatterShareState"/>
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

    <!-- 添加/编辑操作 -->
    <ClinicalHistoryTemplateEdit :visible="dialog.visible" :row="dataGrid.row"
                                 :dialog-close="dialogClose" :data-grid-load-data="dataGridLoadData"/>
  </div>
</template>

<script>
import ClinicalHistoryTemplateEdit from './ClinicalHistoryTemplateEdit'
import jwtDecode from 'jwt-decode'
export default {
  components: {
    ClinicalHistoryTemplateEdit
  },

  data () {
    return {
      payload: jwtDecode(this.$store.getters.token),
      diagnoseType: this.$store.getters.diagnoseType, // 诊断类型
      queryForm: {
        dwtDiagnoseTypeId: null,
        name: null,
        shareState: true
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
    dataGridFormatterShareState (row, column, cellValue) {
      return cellValue ? '共享' : '个人'
    },

    dataGridLoadData () {
      this.$loading()
      const url = `/chisAPI/clinicalHistoryTemplate/getByCriteria`
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
        const url = `/chisAPI/clinicalHistoryTemplate/delete`
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
      }).catch(() => {
      })
    },

    /* -------------------------------------------------------------------------------------------------------------- */

    /**
     * 打开编辑界面
     */
    dialogOpen (row) {
      this.dataGrid.row = row
      this.dialog.visible = true
    },

    /**
     * 关闭界面
     */
    dialogClose () {
      this.dialog.visible = false
    }

  } // end methods
}
</script>

<style scoped>
</style>
