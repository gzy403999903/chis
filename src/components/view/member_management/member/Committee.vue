<template>
  <div>
    <!--功能菜单-->
    <el-card
      shadow="never"
      body-style="padding: 5px;"
      class="el-card-menus">
      <el-form :model="queryForm" ref="queryForm" :inline="true" size="mini">
        <el-form-item label="乡镇(街道)名称" prop="mrmTownshipName">
          <el-input v-model.trim="queryForm.mrmTownshipName" placeholder="乡镇(街道)名称 / 助记码"/>
        </el-form-item>
        <el-form-item label="村(居委会)名称" prop="name">
          <el-input v-model.trim="queryForm.name" placeholder="村(居委会)名称 / 助记码"/>
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
        <el-table-column prop="provinceName" label="所属省份/直辖市" width="150" sortable show-overflow-tooltip/>
        <el-table-column prop="cityName" label="所属城市" width="140" sortable show-overflow-tooltip/>
        <el-table-column prop="areaName" label="所属区/县" width="140" sortable show-overflow-tooltip/>
        <el-table-column prop="mrmTownshipName" label="所属乡镇(街道)名称" width="170" sortable show-overflow-tooltip/>
        <el-table-column prop="typeId" label="区划类型" width="100" :formatter="dataGridFormatterTypeId" show-overflow-tooltip/>
        <el-table-column prop="typeNo" label="区划编码" width="100" :formatter="dataGridFormatterTypeNo" show-overflow-tooltip/>
        <el-table-column prop="name" label="乡镇(街道)名称" show-overflow-tooltip/>
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
      title="乡镇(街道)"
      width="50%"
      :show-close="false"
      :close-on-click-modal="false"
      :visible="dialog.visible"
      @opened="dialogOpened"
      @closed="dialogClosed">
      <el-form :model="editForm" ref="editForm" :rules="editFormRules" size="small" label-width="120px">
        <el-form-item prop="id" v-show="false">
          <el-input v-model.trim="editForm.id"/>
        </el-form-item>
        <el-form-item label="村(居委会)名称" prop="name">
          <el-input v-model.trim="editForm.name" ref="name"
                    @blur="editFormSetPyCode('name', 'code')" @change="editFormSetPyCode('name', 'code')"/>
        </el-form-item>
        <el-form-item label="助记码" prop="code">
          <el-input v-model.trim="editForm.code"/>
        </el-form-item>
        <el-form-item label="所属乡镇(街道)" prop="mrmTownshipId">
          <el-select
            :disabled="dialog.disabled"
            v-model.trim="editForm.mrmTownshipId"
            filterable
            placeholder="请选择">
            <el-option v-for="item in townshipList" :key="item.id" :value="item.id" :label="item.name + ' [' + item.code + ']'"/>
          </el-select>
        </el-form-item>
        <el-form-item label="委员会类型" prop="typeId">
          <el-radio-group v-model="editForm.typeId" :disabled="dialog.disabled">
            <el-radio :label="0">居民委员会</el-radio>
            <el-radio :label="2">村民委员会</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button type="default" size="small" round icon="el-icon-close" @click="dialogClose">取 消</el-button>
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
        mrmTownshipName: null,
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
        method: 'POST',
        disabled: true,
        visible: false
      },
      editForm: {
        id: '',
        name: '',
        code: '',
        mrmTownshipId: '',
        typeId: 0
      },
      editFormRules: {
        name: [
          {required: true, message: '不能为空'},
          {max: 50, message: '长度不合法[1-50]'}
        ],
        code: [
          {required: true, message: '不能为空'},
          {max: 50, message: '长度不合法[1-50]'}
        ]
      },
      select: {
        cities: [],
        areas: []
      }
    } // end return
  }, // end data

  computed: {
    townshipList: function () {
      return this.$store.getters.townshipList
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
    /**
     * 格式化区划类型
     */
    dataGridFormatterTypeId (row, column, cellValue) {
      switch (cellValue) {
        case 0: return '居民居委会'
        case 2: return '村民居委会)'
        default: return '未知的委员会类型'
      }
    },

    /**
     * 格式化区划编码
     */
    dataGridFormatterTypeNo (row, column, cellValue) {
      switch (cellValue.toString().length) {
        case 1: return '00' + cellValue
        case 2: return '0' + cellValue
        default: return '' + cellValue
      }
    },

    /**
     * 数据载入
     */
    dataGridLoadData () {
      this.$loading()
      const url = `/chisAPI/committee/getByCriteria`
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
     * 删除操作
     */
    dataGridDelete (row) {
      this.$confirm('确认删除吗? 该操作不可恢复！', '提示', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', showClose: false
      }).then(() => {
        this.$loading()
        const url = `/chisAPI/committee/delete`
        let method = 'DELETE'
        let params = {
          id: row.id
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
      this.$refs.name.focus()
      let row = this.dataGrid.row
      if (row) {
        for (let key in this.editForm) {
          if (row[key] !== undefined) {
            this.editForm[key] = row[key]
          }
        }
        this.dialog.disabled = true
        this.dialog.url = `/chisAPI/committee/update`
        this.dialog.method = 'PUT'
      } else {
        this.dialog.disabled = false
        this.dialog.url = `/chisAPI/committee/save`
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
     * 将输入的名称转成拼音助记码
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
              this.dialogClose()
              this.dataGridLoadData()
            } else {
              this.$message.error(res.data.msg)
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
