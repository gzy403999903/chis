<template>
  <div>
    <!--功能菜单-->
    <el-card
      shadow="never"
      body-style="padding: 5px;"
      class="el-card-menus">
      <el-form :model="queryForm" ref="queryForm" :inline="true" size="mini">
        <el-form-item label="疾病名称" prop="name">
          <el-input v-model.trim="queryForm.name" placeholder="疾病名称 / 助记码"/>
        </el-form-item>
        <el-form-item label="显示他人共享的" prop="shareState">
          <el-switch v-model="queryForm.shareState" active-color="#13ce66" inactive-color="#ff4949"/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" round icon="el-icon-search"  @click="dataGridLoadData">查询</el-button>
          <el-button type="default" round icon="el-icon-refresh" @click="$refs.queryForm.resetFields()">重置</el-button>
          <el-button type="default" round icon="el-icon-plus"    @click="dialogOpen(null)">自定义诊断</el-button>
          <el-button type="default" round icon="el-icon-folder"    @click="dlDialogOpen">诊断疾病标准库</el-button>
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
            <el-button size="mini" icon="el-icon-edit" @click="dialogOpen(scope.row)"
                       v-if="scope.row.normative || scope.row.creatorId === payload.userId"/>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="dataGridDelete(scope.row)"
                       v-if="scope.row.normative || scope.row.creatorId === payload.userId"/>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="疾病名称" show-overflow-tooltip/>
        <el-table-column prop="code" label="助记码" show-overflow-tooltip/>
        <el-table-column prop="shareState" label="共享状态" :formatter="dataGridFormatterShareState" show-overflow-tooltip/>
        <el-table-column prop="creatorName" label="创建人" show-overflow-tooltip/>
        <el-table-column prop="creationDate" label="创建日期" show-overflow-tooltip/>
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

    <!-- 添加与编辑 -->
    <el-dialog
      title="自定义诊断疾病"
      width="50%"
      :show-close="false"
      :close-on-click-modal="false"
      :visible="dialog.visible"
      @opened="dialogOpened"
      @closed="dialogClosed">
      <el-form :model="editForm" ref="editForm" :rules="editFormRules" label-width="120px" size="small">
        <el-form-item prop="id" v-show="false">
          <el-input v-model.trim="editForm.id"/>
        </el-form-item>
        <el-row>
          <el-col :span="16">
            <el-form-item label="诊断疾病名称" prop="name">
              <el-input v-model="editForm.name" ref="name" @blur="editFormSetPyCode" @change="editFormSetPyCode"
                        v-if="editable"/>
              <span v-if="!editable">{{editForm.name}}</span>
            </el-form-item>
            <el-form-item label="助记码" prop="code">
              <el-input v-model="editForm.code"/>
            </el-form-item>
            <el-form-item label="共享状态" prop="shareState">
              <el-switch v-model="editForm.shareState" active-color="#13ce66" inactive-color="#ff4949" :disabled="!editable"/>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer">
        <el-button type="default" size="small" round icon="el-icon-close" @click="dialogClose">取 消</el-button>
        <el-button type="primary" size="small" round icon="el-icon-check" @click="editFormSubmit">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 诊断标准库 -->
    <DiagnoseLibrary :visible="dialog.dlVisible" :action="action"
                     :dialogClose="dlDialogClose" :previousDataGridLoadData="dataGridLoadData"/>

  </div>
</template>

<script>
import {getPyCode} from '../../../../common/py'
import jwtDecode from 'jwt-decode'
import DiagnoseLibrary from './DiagnoseLibrary'

export default {
  props: {
    action: {
      type: String,
      required: true
    }
  },

  components: {
    DiagnoseLibrary
  },

  data () {
    return {
      payload: jwtDecode(this.$store.getters.token),
      queryForm: {
        name: null,
        shareState: false
      },
      editable: true,
      editForm: {
        id: '',
        name: '',
        code: '',
        shareState: true
      },
      editFormRules: {
        name: [
          {required: true, message: '不能为空'},
          {max: 30, message: '长度不合法[1-30]'}
        ],
        code: [
          {required: true, message: '不能为空'},
          {max: 30, message: '长度不合法[1-30]'}
        ]
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
        visible: false,
        dlVisible: false
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
    dataGridFormatterShareState (row, column, cellValue) {
      return cellValue ? '共享' : '个人'
    },

    /**
     * 数据载入
     */
    dataGridLoadData () {
      this.$loading()
      const url = `/chisAPI/${this.action}CommonDiagnose/getByCriteria`
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
        const url = `/chisAPI/${this.action}CommonDiagnose/delete`
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
     * 编辑界面打开后执行的操作
     */
    dialogOpened () {
      let row = this.dataGrid.row
      if (row) {
        for (let key in this.editForm) {
          if (row[key] !== undefined) {
            this.editForm[key] = row[key]
          }
        }
        if (row.normative) {
          this.editable = false
        } else {
          this.editable = true
        }
        this.dialog.url = `/chisAPI/${this.action}CommonDiagnose/update`
        this.dialog.method = 'PUT'
      } else {
        this.editable = true
        this.dialog.url = `/chisAPI/${this.action}CommonDiagnose/save`
        this.dialog.method = 'POST'
        // 延迟加载 获取焦点位置
        setTimeout(() => {
          this.$refs.name.focus()
        }, 100)
      }
    },

    /**
     * 关闭添加/编辑界面
     */
    dialogClose () {
      this.dialog.visible = false
    },

    /**
     * 编辑界面关闭后执行的操作
     */
    dialogClosed () {
      this.$refs.editForm.resetFields()
    },

    /**
     * 生成拼音助记码
     */
    editFormSetPyCode () {
      this.editForm.code = getPyCode(this.editForm.name)
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
              this.dataGridLoadData()
              this.dialogClose()
            } else {
              this.$message.error(res.data.msg)
              this.$loading().close()
            }
          })
        } else {
          return false
        }
      })
    },

    /* -------------------------------------------------------------------------------------------------------------- */
    /**
     * 打开诊断疾病标准库
     */
    dlDialogOpen () {
      this.dialog.dlVisible = true
    },

    /**
     * 关闭诊断疾病标准库
     */
    dlDialogClose () {
      this.dialog.dlVisible = false
    }

  } // end methods
}
</script>

<style scoped>
</style>
