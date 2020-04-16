<template>
  <div>
    <!--功能菜单-->
    <el-card
      shadow="never"
      body-style="padding: 5px;"
      class="el-card-menus">
      <el-form :model="queryForm" ref="queryForm" :inline="true" size="mini">
        <el-form-item label="机构名称" prop="sysClinicName">
          <el-input v-model.trim="queryForm.sysClinicName" placeholder="机构名称 / 助记码"/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" round icon="el-icon-search"  @click="dataGridLoadData">查询</el-button>
          <el-button type="default" round icon="el-icon-refresh" @click="$refs.queryForm.resetFields()">重置</el-button>
          <el-button type="default" round icon="el-icon-plus"    @click="dialogOpen(null)">添加</el-button>
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
        <el-table-column prop="sysClinicName" label="机构名称" min-width="400" show-overflow-tooltip/>
        <el-table-column prop="january" label="一月" width="100" show-overflow-tooltip/>
        <el-table-column prop="february" label="二月" width="100" show-overflow-tooltip/>
        <el-table-column prop="march" label="三月" width="100" show-overflow-tooltip/>
        <el-table-column prop="april" label="四月" width="100" show-overflow-tooltip/>
        <el-table-column prop="may" label="五月" width="100" show-overflow-tooltip/>
        <el-table-column prop="june" label="六月" width="100" show-overflow-tooltip/>
        <el-table-column prop="july" label="七月" width="100" show-overflow-tooltip/>
        <el-table-column prop="august" label="八月" width="100" show-overflow-tooltip/>
        <el-table-column prop="september" label="九月" width="100" show-overflow-tooltip/>
        <el-table-column prop="october" label="十月" width="100" show-overflow-tooltip/>
        <el-table-column prop="november" label="十一月" width="100" show-overflow-tooltip/>
        <el-table-column prop="december" label="十二月" width="100" show-overflow-tooltip/>
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

    <!-- 添加 / 编辑 -->
    <el-dialog
      title="门诊销售指标"
      width="55%"
      :show-close="false"
      :close-on-click-modal="false"
      :visible="dialog.visible"
      @opened="dialogOpened"
      @closed="dialogClosed">
      <el-form :model="editForm" ref="editForm" :rules="editFormRules" size="small" label-width="80px">
        <el-form-item label="机构名称" prop="id">
          <el-select
            style="width: 80%;"
            v-model.trim="editForm.id"
            filterable
            default-first-option
            placeholder="请选择">
            <el-option v-for="item in sysClinicList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'">
              <span>{{item.name}}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="一月" prop="january">
              <el-input-number v-model="editForm.january" :controls="false" :max="9999999" :min="0" :precision="0"
                               style="width: 150px;"/> &nbsp;元
            </el-form-item>
            <el-form-item label="二月" prop="february">
              <el-input-number v-model="editForm.february" :controls="false" :max="9999999" :min="0" :precision="0"
                               style="width: 150px;"/> &nbsp;元
            </el-form-item>
            <el-form-item label="三月" prop="march">
              <el-input-number v-model="editForm.march" :controls="false" :max="9999999" :min="0" :precision="0"
                               style="width: 150px;"/> &nbsp;元
            </el-form-item>
            <el-form-item label="四月" prop="april">
              <el-input-number v-model="editForm.april" :controls="false" :max="9999999" :min="0" :precision="0"
                               style="width: 150px;"/> &nbsp;元
            </el-form-item>
            <el-form-item label="五月" prop="may">
              <el-input-number v-model="editForm.may" :controls="false" :max="9999999" :min="0" :precision="0"
                               style="width: 150px;"/> &nbsp;元
            </el-form-item>
            <el-form-item label="六月" prop="june">
              <el-input-number v-model="editForm.june" :controls="false" :max="9999999" :min="0" :precision="0"
                               style="width: 150px;"/> &nbsp;元
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="七月" prop="july">
              <el-input-number v-model="editForm.july" :controls="false" :max="9999999" :min="0" :precision="0"
                               style="width: 150px;"/> &nbsp;元
            </el-form-item>
            <el-form-item label="八月" prop="august">
              <el-input-number v-model="editForm.august" :controls="false" :max="9999999" :min="0" :precision="0"
                               style="width: 150px;"/> &nbsp;元
            </el-form-item>
            <el-form-item label="九月" prop="september">
              <el-input-number v-model="editForm.september" :controls="false" :max="9999999" :min="0" :precision="0"
                               style="width: 150px;"/> &nbsp;元
            </el-form-item>
            <el-form-item label="十月" prop="october">
              <el-input-number v-model="editForm.october" :controls="false" :max="9999999" :min="0" :precision="0"
                               style="width: 150px;"/> &nbsp;元
            </el-form-item>
            <el-form-item label="十一月" prop="november">
              <el-input-number v-model="editForm.november" :controls="false" :max="9999999" :min="0" :precision="0"
                               style="width: 150px;"/> &nbsp;元
            </el-form-item>
            <el-form-item label="十二月" prop="december">
              <el-input-number v-model="editForm.december" :controls="false" :max="9999999" :min="0" :precision="0"
                               style="width: 150px;"/> &nbsp;元
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer">
        <el-button type="default" size="small" round icon="el-icon-close" @click="dialogClose">取 消</el-button>
        <el-button type="primary" size="small" round icon="el-icon-check" @click="editFormSubmit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {

  data () {
    return {
      queryForm: {
        sysClinicName: null
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
      },
      dialog: {
        url: '',
        method: '',
        visible: false
      },
      editForm: {
        id: '',
        january: 0,
        february: 0,
        march: 0,
        april: 0,
        may: 0,
        june: 0,
        july: 0,
        august: 0,
        september: 0,
        october: 0,
        november: 0,
        december: 0
      },
      editFormRules: {
        id: [
          {required: true, message: '不能为空'}
        ],
        january: [
          {required: true, message: '不能为空'}
        ],
        february: [
          {required: true, message: '不能为空'}
        ],
        march: [
          {required: true, message: '不能为空'}
        ],
        april: [
          {required: true, message: '不能为空'}
        ],
        may: [
          {required: true, message: '不能为空'}
        ],
        june: [
          {required: true, message: '不能为空'}
        ],
        july: [
          {required: true, message: '不能为空'}
        ],
        august: [
          {required: true, message: '不能为空'}
        ],
        september: [
          {required: true, message: '不能为空'}
        ],
        october: [
          {required: true, message: '不能为空'}
        ],
        november: [
          {required: true, message: '不能为空'}
        ],
        december: [
          {required: true, message: '不能为空'}
        ]
      }
    }
  }, // end data

  computed: {
    sysClinicList: function () {
      return this.$store.getters.sysClinicList
    }
  }, // end computed

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
      const url = `/chisAPI/clinicSellTarget/getByCriteria`
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
        const url = `/chisAPI/clinicSellTarget/delete`
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
     * 打开添加/编辑界面
     * @param row
     */
    dialogOpen (row) {
      this.dataGrid.row = row
      this.dialog.visible = true
    },

    /**
     * 添加/编辑界面打开后执行的内容
     */
    dialogOpened () {
      // this.$refs.name.focus()
      let row = this.dataGrid.row
      if (row) {
        for (let key in this.editForm) {
          if (this.editForm.hasOwnProperty(key)) {
            this.editForm[key] = row[key]
          }
        }
        this.dialog.url = '/chisAPI/clinicSellTarget/update'
        this.dialog.method = 'PUT'
      } else {
        this.dialog.url = '/chisAPI/clinicSellTarget/save'
        this.dialog.method = 'POST'
      }
    },

    /**
     * 关闭添加/编辑界面
     */
    dialogClose () {
      this.dialog.visible = false
    },

    /**
     * 关闭添加/编辑界面后执行的呢绒
     */
    dialogClosed () {
      this.$refs.editForm.resetFields()
    },

    /**
     * 提交数据
     */
    editFormSubmit () {
      this.$refs.editForm.validate((valid) => {
        if (valid) {
          this.$loading()
          let url = this.dialog.url
          let method = this.dialog.method
          let params = this.editForm

          this.$http({method, url, params}).then((res) => {
            if (res.data.code === 200) {
              this.$message.success(res.data.msg)
              this.dialogClose()
              this.dataGridLoadData()
            } else {
              this.$loading().close()
            }
          })
        } else {
          return false
        }
      })
    }

  } // end methods
}
</script>

<style scoped>
</style>
