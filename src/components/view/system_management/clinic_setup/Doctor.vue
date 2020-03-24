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
        <el-form-item label="医生姓名" prop="name">
          <el-input v-model.trim="queryForm.name" placeholder="医生姓名 / 助记码"/>
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
        <el-table-column prop="id" label="识别码" width="100" show-overflow-tooltip/>
        <el-table-column prop="name" label="医生姓名" width="120" show-overflow-tooltip/>
        <el-table-column prop="doctorTitlesName" label="职称" width="120" show-overflow-tooltip/>
        <el-table-column prop="practiceTypeName" label="执业类别" width="120" show-overflow-tooltip/>
        <el-table-column prop="sysPracticeScopeName" label="执业范围" width="120" show-overflow-tooltip/>
        <el-table-column prop="sysClinicRoomName" label="所属科室" width="150" show-overflow-tooltip/>
        <el-table-column prop="sysClinicName" label="账户注册地" width="400" show-overflow-tooltip/>
        <el-table-column prop="mainSysClinicName" label="执业注册地" width="400"  show-overflow-tooltip/>
        <el-table-column prop="subSysClinicName" label="多点执业地" width="400"  show-overflow-tooltip/>
        <el-table-column prop="state" label="状态"  show-overflow-tooltip>
          <template slot-scope="props">{{props.row.state ? '启用' : '禁用'}}</template>
        </el-table-column>
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
      width="65%"
      :show-close="false"
      :close-on-click-modal="false"
      :visible="dialog.visible"
      @opened="dialogOpened"
      @closed="dialogClosed">

      <!-- 模态框标题栏与功能按钮 -->
      <el-row slot="title">
        <el-col :span="5" style="font-size: 20px;">
          <span>门诊医生注册</span>
        </el-col>
        <el-col :span="19" style="text-align: right;">
          <el-button size="mini" type="primary" icon="el-icon-check" @click="editFormSubmit">提 交</el-button>
          <el-button size="mini" type="warning" icon="el-icon-right" @click="dialogClose">返 回</el-button>
        </el-col>
      </el-row>

      <el-form :model="editForm" ref="editForm" :rules="editFormRules" size="small" label-width="120px">
        <el-row>
          <el-col :span="14">
            <el-form-item label="账户注册地" prop="sysClinicId">
              <el-select
                ref="sysClinicId"
                v-model.trim="editForm.sysClinicId"
                @change="clinicIdChange"
                filterable
                placeholder="请选择">
                <el-option v-for="item in sysClinicList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
              </el-select>
            </el-form-item>

            <el-form-item label="执业注册地" prop="mainSysClinicId">
              <el-select
                ref="mainSysClinicId"
                v-model.trim="editForm.mainSysClinicId"
                filterable
                placeholder="请选择">
                <el-option v-for="item in sysClinicList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
              </el-select>
            </el-form-item>

            <el-form-item label="多点执业地" prop="subSysClinicId">
              <el-select
                ref="subSysClinicId"
                v-model.trim="editForm.subSysClinicId"
                filterable
                placeholder="请选择">
                <el-option v-for="item in sysClinicList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
              </el-select>
            </el-form-item>

            <el-form-item label="多点有效期" prop="subSysClinicExpiryDate">
              <el-date-picker
                ref="subSysClinicExpiryDate"
                v-model="editForm.subSysClinicExpiryDate"
                type="date"
                placeholder="选择日期"
                value-format="yyyy-MM-dd"
                :picker-options="pickerOptions"
                style="width: 50%;"/>
            </el-form-item>

            <el-form-item label="简介" prop="intro">
              <el-input type="textarea" v-model="editForm.intro" :rows="3" resize="none"/>
            </el-form-item>
          </el-col> <!-- end left -->

          <el-col :span="10">
            <el-form-item label="医生姓名" prop="id">
              <el-select
                ref="id"
                v-model.trim="editForm.id"
                filterable
                placeholder="请选择">
                <el-option v-for="item in dialog.clinicUserList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
              </el-select>
            </el-form-item>

            <el-form-item label="科室名称" prop="sysClinicRoomId">
              <el-select
                ref="sysClinicRoomId"
                v-model.trim="editForm.sysClinicRoomId"
                filterable
                placeholder="请选择">
                <el-option v-for="item in dialog.clinicRoomList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
              </el-select>
            </el-form-item>

            <el-form-item label="医师职称" prop="doctorTitlesId">
              <el-select
                ref="doctorTitlesId"
                v-model.trim="editForm.doctorTitlesId"
                filterable
                placeholder="请选择">
                <el-option v-for="item in doctorTitlesList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
              </el-select>
            </el-form-item>

            <el-form-item label="执业类别" prop="practiceTypeId">
              <el-select
                ref="practiceTypeId"
                v-model.trim="editForm.practiceTypeId"
                @change="loadPracticeScopeList"
                filterable
                placeholder="请选择">
                <el-option v-for="item in practiceTypeList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
              </el-select>
            </el-form-item>

            <el-form-item label="职业范围" prop="sysPracticeScopeId">
              <el-select
                ref="sysPracticeScopeId"
                v-model.trim="editForm.sysPracticeScopeId"
                filterable
                placeholder="请选择">
                <el-option v-for="item in dialog.practiceScopeList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
              </el-select>
            </el-form-item>
          </el-col> <!-- end right -->
        </el-row>

      </el-form>
    </el-dialog>
  </div>
</template>

<script>
export default {

  data () {
    return {
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() < Date.now()
        }
      },
      queryForm: {
        sysClinicName: null,
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
        visible: false,
        clinicUserList: [],
        clinicRoomList: [],
        practiceScopeList: []
      },
      editForm: {
        id: '',
        sysClinicId: '',
        mainSysClinicId: '',
        subSysClinicId: '',
        subSysClinicExpiryDate: '',
        sysClinicRoomId: '',
        doctorTitlesId: '',
        practiceTypeId: '',
        sysPracticeScopeId: '',
        intro: ''
      },
      editFormRules: {
        id: [
          {required: true, message: '不能为空'}
        ],
        sysClinicId: [
          {required: true, message: '不能为空'}
        ],
        mainSysClinicId: [
          {required: true, message: '不能为空'}
        ],
        sysClinicRoomId: [
          {required: true, message: '不能为空'}
        ],
        doctorTitlesId: [
          {required: true, message: '不能为空'}
        ],
        practiceTypeId: [
          {required: true, message: '不能为空'}
        ],
        sysPracticeScopeId: [
          {required: true, message: '不能为空'}
        ],
        intro: [
          {max: 200, message: '长度不合法[1-200]'}
        ]
      }
    }
  }, // end data

  computed: {
    sysClinicList: function () {
      return this.$store.getters.sysClinicList
    },
    doctorTitlesList: function () {
      return this.$store.getters.doctorTitlesList
    },
    practiceTypeList: function () {
      return this.$store.getters.practiceTypeList
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
     * 数据载入
     */
    dataGridLoadData () {
      this.$loading()
      const url = `/chisAPI/doctor/getClinicListByCriteria`
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
        const url = `/chisAPI/doctor/delete`
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
      let row = this.dataGrid.row
      if (row) {
        this.clinicIdChange(row.sysClinicId) // 预加载数据[不能放到赋值后]
        for (let key in this.editForm) {
          if (this.editForm.hasOwnProperty(key)) {
            this.editForm[key] = row[key]
          }
        }
        this.dialog.url = `/chisAPI/doctor/update`
        this.dialog.method = 'PUT'
      } else {
        this.dialog.url = `/chisAPI/doctor/save`
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
     * 当机构所在机构 ID 改变时进行的操作
     */
    clinicIdChange (sysClinicId) {
      this.loadClinicUserList(sysClinicId)
      this.loadClinicRoomList(sysClinicId)
    },

    /**
     * 载入对应机构用户
     */
    loadClinicUserList (sysClinicId) {
      // 清空 已选中的 医师 ID
      this.editForm.id = ''
      // 进行查询
      const url = `/chisAPI/user/getEnabledByClinicId`
      let params = {sysClinicId}

      this.$http.get(url, {params}).then((res) => {
        if (res.data.code === 200) {
          this.dialog.clinicUserList = res.data.resultSet.list
        }
      })
    },

    /**
     * 载入对应机构诊室
     */
    loadClinicRoomList (sysClinicId) {
      // 清空 已选中的 诊室 ID
      this.editForm.sysClinicRoomId = ''
      // 进行查询
      const url = `/chisAPI/clinicRoom/geByClinicId`
      let params = {sysClinicId}

      this.$http.get(url, {params}).then((res) => {
        if (res.data.code === 200) {
          this.dialog.clinicRoomList = res.data.resultSet.list
        }
      })
    },

    /**
     * 载入对应职业类别的执业范围
     */
    loadPracticeScopeList (practiceTypeId) {
      // 清空 已选中的 执业范围 ID
      this.editForm.sysPracticeScopeId = ''
      // 进行查询
      const url = `/chisAPI/practiceScope/getByPracticeTypeId`
      let params = {practiceTypeId}

      this.$http.get(url, {params}).then((res) => {
        if (res.data.code === 200) {
          this.dialog.practiceScopeList = res.data.resultSet.list
        }
      })
    },

    /**
     * 提交数据
     */
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
            this.dialogClose()
            this.dataGridLoadData()
          } else {
            this.$loading().close()
          }
        })
      })
    }

  } // end methods
}
</script>

<style scoped>
</style>
