<template>
  <div>
    <!--功能菜单-->
    <el-card
      shadow="never"
      body-style="padding: 5px;"
      class="el-card-menus">
      <el-form :model="queryForm" ref="queryForm" :inline="true" size="mini">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model.trim="queryForm.name" placeholder="角色名称 / 助记码"/>
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
          <el-button type="default" round icon="el-icon-plus"    @click="editFormBegin(null)">添加</el-button>
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
        <el-table-column fixed="left" type="index" :index="dataGridIndex"/>
        <el-table-column fixed="left" label="操作" align="center" width="150">
          <template slot-scope="scope">
            <el-button size="mini" icon="el-icon-edit" @click="editFormBegin(scope.row)" v-if="!scope.row.required"/>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="dataGridDelete(scope.row)" v-if="!scope.row.required"/>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="角色名称" width="200"/>
        <el-table-column prop="code" label="助记码" width="200"/>
        <el-table-column prop="state" label="状态" :formatter="dataGridFormatterState"/>
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

    <!-- 添加功能 -->
    <el-dialog
      title="角色"
      width="50%"
      :show-close="false"
      :close-on-click-modal="false"
      :visible="dialog.visible"
      @opened="dialogOpened"
      @closed="dialogClosed">
      <el-form :model="editForm" ref="editForm" :rules="editFormRules" size="small" label-width="100px">
        <el-form-item prop="id" v-show="false">
          <el-input v-model.trim="editForm.id"/>
        </el-form-item>
        <el-form-item label="角色名称" prop="name">
          <el-input v-model.trim="editForm.name" ref="name"
                    @blur="editFormSetPyCode" @change="editFormSetPyCode"/>
        </el-form-item>
        <el-form-item label="助记码" prop="code">
          <el-input v-model.trim="editForm.code"/>
        </el-form-item>
        <el-form-item label="状态" prop="state">
          <el-radio-group v-model="editForm.state">
            <el-radio :label="true">启用</el-radio>
            <el-radio :label="false">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button type="default" size="small" round icon="el-icon-close" @click="dialog.visible=false">取 消</el-button>
        <el-button type="primary" size="small" round icon="el-icon-check" @click="editFormSubmit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {getPyCode} from '../../../../common/py'

export default {
  data () {
    return {
      queryForm: {
        name: '',
        state: null
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
        visible: false,
        authcTreeData: [] // 从后台获取到的权限树的数据
      },
      editForm: {
        id: '',
        name: '',
        code: '',
        state: true
      },
      editFormRules: {
        name: [
          {required: true, message: '不能为空'},
          {max: 10, message: '长度不合法[1-10]'}
        ],
        code: [
          {required: true, message: '不能为空'},
          {max: 10, message: '长度不合法[1-10]'}
        ]
      }
    }
  },
  methods: {
    paginationSizeChange (value) {
      this.pagination.pageSize = value
      this.dataGridLoadData()
    },
    paginationCurrentChange (value) {
      this.pagination.currentPage = value
      this.dataGridLoadData()
    },

    dataGridIndex (index) {
      return ++index
    },
    dataGridFormatterState (row, column, cellValue) {
      return cellValue ? '启用' : '禁用'
    },
    dataGridLoadData () {
      this.$loading()
      const url = '/chisAPI/role/getByCriteria'
      let params = {
        pageNum: this.pagination.currentPage,
        pageSize: this.pagination.pageSize,
        name: this.queryForm.name,
        state: this.queryForm.state
      }

      this.$http.get(url, {params}).then((res) => {
        if (res.data.code === 200) {
          this.pagination.total = res.data.resultSet.page.total
          this.dataGrid.data = res.data.resultSet.page.list
        } else {
          this.$message.error(res.data.msg)
        }
        this.$loading().close()
      }).catch((error) => {
        console.log('载入数据错误')
        console.log(error)
      })
    },
    dataGridDelete (row) {
      this.$confirm('确认删除吗? 该操作不可恢复！', '提示', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', showClose: false
      }).then(() => {
        this.$loading()
        const url = `/chisAPI/role/delete/${row.id}`

        this.$http.delete(url).then((res) => {
          if (res.data.code === 200) {
            this.$message.success(res.data.msg)
            this.dataGridLoadData()
          } else {
            this.$message.error(res.data.msg)
            this.$loading().close()
          }
        }).catch((error) => {
          console.log('删除数据错误')
          console.log(error)
        })
      }).catch(() => {})
    },

    dialogOpened () {
      // 编辑窗口默认焦点
      this.$refs.name.focus()

      // 自动填充表单和裁定提交类型
      let row = this.dataGrid.row
      if (row) {
        // 自动填充表单
        for (let key in this.editForm) {
          this.editForm[key] = row[key]
        }
        // 裁定提交类型
        this.dialog.url = '/chisAPI/role/update'
        this.dialog.method = 'PUT'
      } else {
        this.dialog.url = '/chisAPI/role/save'
        this.dialog.method = 'POST'
      }
    },
    dialogClosed () {
      this.$refs.editForm.resetFields()
    },
    editFormBegin (row) {
      this.dialog.visible = true
      this.dataGrid.row = row
    },
    editFormSetPyCode () {
      this.editForm.code = getPyCode(this.editForm.name)
    },
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
              this.dialog.visible = false
            } else {
              this.$message.error(res.data.msg)
              this.$loading().close()
            }
          }).catch((error) => {
            console.log('保存/编辑数据错误')
            console.log(error)
          })
        } else {
          return false
        }
      })
    }
  }
}
</script>

<style scoped>
</style>
