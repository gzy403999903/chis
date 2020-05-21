<template>
  <div>
    <!--功能菜单-->
    <el-card
      shadow="never"
      body-style="padding: 5px;"
      class="el-card-menus">
      <el-form :model="queryForm" ref="queryForm" :inline="true" size="mini">
        <el-form-item label="收费班次名称" prop="name">
          <el-input v-model.trim="queryForm.name" placeholder="收费班次名称 / 助记码"/>
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
        <el-table-column fixed="left" type="index"/>
        <el-table-column fixed="left" label="操作" align="center" width="120">
          <template slot-scope="scope">
            <el-button size="mini" icon="el-icon-edit" @click="dialogOpen(scope.row)"/>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="dataGridDelete(scope.row)"/>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="收费班次名称" width="150" show-overflow-tooltip/>
        <el-table-column prop="beginTime" label="起始时间" width="100" :formatter="dataGridFormatterTime" show-overflow-tooltip/>
        <el-table-column prop="endTime" label="结束时间" width="100" :formatter="dataGridFormatterTime" show-overflow-tooltip/>
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
      title="收费班次"
      width="45%"
      :show-close="false"
      :close-on-click-modal="false"
      :visible="dialog.visible"
      @opened="dialogOpened"
      @closed="dialogClosed">
      <el-form :model="editForm" ref="editForm" :rules="editFormRules" size="small" label-width="120px">
        <el-form-item prop="id" v-show="false">
          <el-input v-model.trim="editForm.id"/>
        </el-form-item>

        <el-form-item label="收费班次名称" prop="name">
          <el-input v-model.trim="editForm.name" ref="name"
                    @blur="editFormSetPyCode" @change="editFormSetPyCode"/>
        </el-form-item>

        <el-form-item label="助记码" prop="code">
          <el-input v-model.trim="editForm.code"/>
        </el-form-item>

        <el-form-item label="起始时间" prop="beginTime">
          <el-time-picker
            placeholder="起始时间"
            v-model="editForm.beginTime"
            value-format="HH:mm:ss"
            :clearable="false"
            :picker-options="{selectableRange: '01:00:00 - 23:59:59'}"/>
        </el-form-item>

        <el-form-item label="结束时间" prop="endTime">
          <el-time-picker
            placeholder="结束时间"
            v-model="editForm.endTime"
            value-format="HH:mm:ss"
            :clearable="false"
            :picker-options="{selectableRange: '01:00:00 - 23:59:59'}"/>
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
import moment from 'moment'
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
        visible: false
      },
      editForm: {
        id: '',
        name: '',
        code: '',
        beginTime: '',
        endTime: '',
        state: true
      },
      editFormRules: {
        name: [
          {required: true, message: '不能为空'},
          {max: 20, message: '长度不合法[1-20]'}
        ],
        code: [
          {required: true, message: '不能为空'},
          {max: 20, message: '长度不合法[1-20]'}
        ],
        beginTime: [
          {required: true, message: '不能为空'}
        ],
        endTime: [
          {required: true, message: '不能为空'}
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

    dataGridFormatterTime (row, column, cellValue) {
      return moment(cellValue).format('HH:mm:ss')
    },
    dataGridFormatterState (row, column, cellValue) {
      return cellValue ? '启用' : '禁用'
    },
    editFormSetPyCode () {
      this.editForm.code = getPyCode(this.editForm.name)
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

    dataGridLoadData () {
      this.$loading()
      const url = `/chisAPI/workGroup/getByCriteria`
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
        }
        this.$loading().close()
      })
    },

    dataGridDelete (row) {
      this.$confirm('确认删除吗? 该操作不可恢复！', '提示', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', showClose: false
      }).then(() => {
        this.$loading()
        const url = `/chisAPI/workGroup/delete`
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

    dialogOpen (row) {
      this.dialog.visible = true
      this.dataGrid.row = row
    },

    dialogOpened () {
      this.$refs.name.focus() // 打开编辑界面后自动获取焦点的位置
      let row = this.dataGrid.row
      if (row) {
        for (let key in this.editForm) {
          this.editForm[key] = row[key]
        }
        this.editForm.beginTime = this.dataGridFormatterTime(null, null, this.editForm.beginTime)
        this.editForm.endTime = this.dataGridFormatterTime(null, null, this.editForm.endTime)
        this.dialog.url = `/chisAPI/workGroup/update`
        this.dialog.method = 'PUT'
      } else {
        this.dialog.url = `/chisAPI/workGroup/save`
        this.dialog.method = 'POST'
      }
    },

    dialogClosed () {
      this.$refs.editForm.resetFields()
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
            this.dataGridLoadData()
            this.dialog.visible = false
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
