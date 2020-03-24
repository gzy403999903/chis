<template>
  <div>
    <!--功能菜单-->
    <el-card
      shadow="never"
      body-style="padding: 5px;"
      class="el-card-menus">
      <el-form :model="queryForm" ref="queryForm" :inline="true" size="mini">
        <el-form-item label="医生执业类别" prop="practiceTypeId">
          <el-select
            v-model.trim="queryForm.practiceTypeId"
            filterable
            default-first-option
            placeholder="请选择">
            <el-option v-for="item in practiceTypeList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
          </el-select>
        </el-form-item>
        <el-form-item label="医生执业范围名称" prop="name">
          <el-input v-model.trim="queryForm.name" placeholder="执业范围名称 / 助记码"/>
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
        <el-table-column fixed="left" type="index"/>
        <el-table-column fixed="left" label="操作" align="center" width="120">
          <template slot-scope="scope">
            <el-button size="mini" icon="el-icon-edit" @click="editFormBegin(scope.row)" v-if="!scope.row.required"/>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="dataGridDelete(scope.row)" v-if="!scope.row.required"/>
          </template>
        </el-table-column>
        <el-table-column prop="practiceTypeName" label="医生执业类别" width="200" show-overflow-tooltip/>
        <el-table-column prop="name" label="执业范围" width="150" show-overflow-tooltip/>
        <el-table-column prop="code" label="助记码" min-width="150" show-overflow-tooltip/>
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
      title="医生执业范围"
      width="45%"
      :show-close="false"
      :close-on-click-modal="false"
      :visible="dialog.visible"
      @opened="dialogOpened"
      @closed="dialogClosed">
      <el-form :model="editForm" ref="editForm" :rules="editFormRules" size="small" label-width="110px">
        <el-form-item prop="id" v-show="false">
          <el-input v-model.trim="editForm.id"/>
        </el-form-item>
        <el-form-item label="医生执业类别" prop="practiceTypeId">
          <el-select
            v-model.trim="editForm.practiceTypeId"
            filterable
            default-first-option
            placeholder="请选择">
            <el-option v-for="item in practiceTypeList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
          </el-select>
        </el-form-item>
        <el-form-item label="执业范围名称" prop="name">
          <el-input v-model.trim="editForm.name" ref="name"
                    @blur="editFormSetPyCode" @change="editFormSetPyCode"/>
        </el-form-item>
        <el-form-item label="助记码" prop="code">
          <el-input v-model.trim="editForm.code"/>
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
        practiceTypeId: null,
        name: null
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
        practiceTypeId: '',
        name: '',
        code: ''
      },
      editFormRules: {
        practiceTypeId: [
          {required: true, message: '不能为空'}
        ],
        name: [
          {required: true, message: '不能为空'},
          {max: 20, message: '长度不合法[1-30]'}
        ],
        code: [
          {required: true, message: '不能为空'},
          {max: 20, message: '长度不合法[1-30]'}
        ]
      }
    }
  },

  computed: {
    practiceTypeList: function () {
      return this.$store.getters.practiceTypeList
    }
  }, // end computed

  methods: {
    paginationSizeChange (value) {
      this.pagination.pageSize = value
      this.dataGridLoadData()
    },
    paginationCurrentChange (value) {
      this.pagination.currentPage = value
      this.dataGridLoadData()
    },

    dataGridLoadData () {
      this.$loading()
      const url = `/chisAPI/practiceScope/getByCriteria`
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
        const url = `/chisAPI/practiceScope/delete`
        let params = {
          id: row.id
        }

        this.$http.delete(url, {params}).then((res) => {
          if (res.data.code === 200) {
            this.$message.success(res.data.msg)
            this.dataGridLoadData()
          } else {
            this.$loading().close()
          }
        })
      }).catch(() => {})
    },

    editFormBegin (row) {
      this.dialog.visible = true
      this.dataGrid.row = row
    },

    editFormSetPyCode () {
      this.editForm.code = getPyCode(this.editForm.name)
    },

    dialogOpened () {
      let row = this.dataGrid.row
      if (row) {
        for (let key in this.editForm) {
          if (this.editForm.hasOwnProperty(key)) {
            this.editForm[key] = row[key]
          }
        }
        this.dialog.url = `/chisAPI/practiceScope/update`
        this.dialog.method = 'PUT'
      } else {
        // this.$refs.goodsClassifyId.focus() // 打开编辑界面后自动获取焦点的位置
        this.dialog.url = `/chisAPI/practiceScope/save`
        this.dialog.method = 'POST'
      }
    },

    dialogClosed () {
      this.$refs.editForm.resetFields()
    },

    editFormValidateField (currentProp, nextRef) {
      this.$refs.editForm.validateField(currentProp, (valid) => {
        if (!valid) {
          this.$refs[nextRef].focus()
        } else {
          return false
        }
      })
    },

    editFormSubmit () {
      this.$refs.editForm.validate((valid) => {
        if (!valid) {
          return false
        }
        this.$loading()
        let url = this.dialog.url
        let method = this.dialog.method
        let params = this.editForm

        this.$http({method, url, params}).then((res) => {
          if (res.data.code === 200) {
            this.$message.success(res.data.msg)
            this.dialog.visible = false
            this.dataGridLoadData()
          } else {
            this.$loading().close()
          }
        })
      })
    }

  }
}
</script>

<style scoped>
</style>
