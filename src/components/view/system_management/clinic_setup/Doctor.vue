<template>
  <div>
    <!--功能菜单-->
    <el-card
      shadow="never"
      body-style="padding: 5px;"
      class="el-card-menus">
      <el-form :model="queryForm" ref="queryForm" :inline="true" size="mini">
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
        <el-table-column prop="name" label="医生姓名" width="120" show-overflow-tooltip/>
        <el-table-column prop="sysClinicRoomName" label="诊室名称" width="150" show-overflow-tooltip/>
        <el-table-column label="周一" align="center">
          <el-table-column prop="monBeginTime" label="开始时间" width="100" show-overflow-tooltip/>
          <el-table-column prop="monEndTime" label="结束时间" width="100" show-overflow-tooltip/>
          <el-table-column prop="monNo" label="放号数量" width="100" show-overflow-tooltip/>
        </el-table-column>
        <el-table-column label="周二" align="center">
          <el-table-column prop="tueBeginTime" label="开始时间" width="100" show-overflow-tooltip/>
          <el-table-column prop="tueEndTime" label="结束时间" width="100" show-overflow-tooltip/>
          <el-table-column prop="tueNo" label="放号数量" width="100" show-overflow-tooltip/>
        </el-table-column>
        <el-table-column label="周三" align="center">
          <el-table-column prop="wedBeginTime" label="开始时间" width="100" show-overflow-tooltip/>
          <el-table-column prop="wedEndTime" label="结束时间" width="100" show-overflow-tooltip/>
          <el-table-column prop="wedNo" label="放号数量" width="100" show-overflow-tooltip/>
        </el-table-column>
        <el-table-column label="周四" align="center">
          <el-table-column prop="thuBeginTime" label="开始时间" width="100" show-overflow-tooltip/>
          <el-table-column prop="thuEndTime" label="结束时间" width="100" show-overflow-tooltip/>
          <el-table-column prop="thuNo" label="放号数量" width="100" show-overflow-tooltip/>
        </el-table-column>
        <el-table-column label="周五" align="center">
          <el-table-column prop="friBeginTime" label="开始时间" width="100" show-overflow-tooltip/>
          <el-table-column prop="friEndTime" label="结束时间" width="100" show-overflow-tooltip/>
          <el-table-column prop="friNo" label="放号数量" width="100" show-overflow-tooltip/>
        </el-table-column>
        <el-table-column label="周六" align="center">
          <el-table-column prop="satBeginTime" label="开始时间" width="100" show-overflow-tooltip/>
          <el-table-column prop="satEndTime" label="结束时间" width="100" show-overflow-tooltip/>
          <el-table-column prop="satNo" label="放号数量" width="100" show-overflow-tooltip/>
        </el-table-column>
        <el-table-column label="周日" align="center">
          <el-table-column prop="sunBeginTime" label="开始时间" width="100" show-overflow-tooltip/>
          <el-table-column prop="sunEndTime" label="结束时间" width="100" show-overflow-tooltip/>
          <el-table-column prop="sunNo" label="放号数量" width="100" show-overflow-tooltip/>
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
      top="4%"
      width="60%"
      :show-close="false"
      :close-on-click-modal="false"
      :visible="dialog.visible"
      @opened="dialogOpened"
      @closed="dialogClosed">

      <!-- 模态框标题栏与功能按钮 -->
      <el-row slot="title">
        <el-col :span="5" style="font-size: 20px;">
          <span>医生出诊设置</span>
        </el-col>
        <el-col :span="19" style="text-align: right;">
          <el-button size="mini" type="primary" icon="el-icon-check" @click="editFormSubmit">提 交</el-button>
          <el-button size="mini" type="warning" icon="el-icon-right" @click="dialogClose">返 回</el-button>
        </el-col>
      </el-row>

      <el-form :model="editForm" ref="editForm" :rules="editFormRules" size="small" label-width="100px">
        <el-row>
          <el-col :span="11">
            <el-form-item label="医生姓名" prop="id">
              <el-select
                ref="id"
                v-model.trim="editForm.id"
                filterable
                placeholder="请选择">
                <el-option v-for="item in clinicUserList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="11">
            <el-form-item label="科室名称" prop="sysClinicRoomId">
              <el-select
                ref="sysClinicRoomId"
                v-model.trim="editForm.sysClinicRoomId"
                filterable
                placeholder="请选择">
                <el-option v-for="item in clinicRoomList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="2" :push="6">
            <el-form-item label="开始时间"/>
          </el-col>
          <el-col :span="2" :push="11">
            <el-form-item label="结束时间"/>
          </el-col>
          <el-col :span="2" :push="14">
            <el-form-item label="放号数量"/>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="1" :push="1">
            <el-form-item label="周一"/>
          </el-col>
          <el-col :span="23" :push="1">
            <el-row>
              <el-col :span="9">
                <el-form-item prop="monBeginTime">
                  <el-time-select
                    placeholder="开始时间"
                    v-model="editForm.monBeginTime"
                    :picker-options="{
                      start: timeRange.start,
                      step: timeRange.step,
                      end: timeRange.end
                     }"/>
                </el-form-item>
              </el-col>
              <el-col :span="9" :pull="2">
                <el-form-item prop="monEndTime">
                  <el-time-select
                    placeholder="结束时间"
                    v-model="editForm.monEndTime"
                    :picker-options="{
                       start: timeRange.start,
                      step: timeRange.step,
                      end: timeRange.end,
                      minTime: editForm.monBeginTime
                     }"/>
                </el-form-item>
              </el-col>
              <el-col :span="6" :pull="4">
                <el-form-item prop="monNo">
                  <el-input-number v-model="editForm.monNo" :controls="false" :max="100" :min="0" :precision="0"/>
                </el-form-item>
              </el-col>
            </el-row>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="1" :push="1">
            <el-form-item label="周二"/>
          </el-col>
          <el-col :span="23" :push="1">
            <el-row>
              <el-col :span="9">
                <el-form-item prop="tueBeginTime">
                  <el-time-select
                    placeholder="开始时间"
                    v-model="editForm.tueBeginTime"
                    :picker-options="{
                      start: timeRange.start,
                      step: timeRange.step,
                      end: timeRange.end
                     }"/>
                </el-form-item>
              </el-col>
              <el-col :span="9" :pull="2">
                <el-form-item prop="tueEndTime">
                  <el-time-select
                    placeholder="结束时间"
                    v-model="editForm.tueEndTime"
                    :picker-options="{
                       start: timeRange.start,
                      step: timeRange.step,
                      end: timeRange.end,
                      minTime: editForm.tueBeginTime
                     }"/>
                </el-form-item>
              </el-col>
              <el-col :span="6" :pull="4">
                <el-form-item prop="tueNo">
                  <el-input-number v-model="editForm.tueNo" :controls="false" :max="100" :min="0" :precision="0"/>
                </el-form-item>
              </el-col>
            </el-row>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="1" :push="1">
            <el-form-item label="周三"/>
          </el-col>
          <el-col :span="23" :push="1">
            <el-row>
              <el-col :span="9">
                <el-form-item prop="wedBeginTime">
                  <el-time-select
                    placeholder="开始时间"
                    v-model="editForm.wedBeginTime"
                    :picker-options="{
                      start: timeRange.start,
                      step: timeRange.step,
                      end: timeRange.end
                     }"/>
                </el-form-item>
              </el-col>
              <el-col :span="9" :pull="2">
                <el-form-item prop="wedEndTime">
                  <el-time-select
                    placeholder="结束时间"
                    v-model="editForm.wedEndTime"
                    :picker-options="{
                       start: timeRange.start,
                      step: timeRange.step,
                      end: timeRange.end,
                      minTime: editForm.wedBeginTime
                     }"/>
                </el-form-item>
              </el-col>
              <el-col :span="6" :pull="4">
                <el-form-item prop="wedNo">
                  <el-input-number v-model="editForm.wedNo" :controls="false" :max="100" :min="0" :precision="0"/>
                </el-form-item>
              </el-col>
            </el-row>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="1" :push="1">
            <el-form-item label="周四"/>
          </el-col>
          <el-col :span="23" :push="1">
            <el-row>
              <el-col :span="9">
                <el-form-item prop="thuBeginTime">
                  <el-time-select
                    placeholder="开始时间"
                    v-model="editForm.thuBeginTime"
                    :picker-options="{
                      start: timeRange.start,
                      step: timeRange.step,
                      end: timeRange.end
                     }"/>
                </el-form-item>
              </el-col>
              <el-col :span="9" :pull="2">
                <el-form-item prop="thuEndTime">
                  <el-time-select
                    placeholder="结束时间"
                    v-model="editForm.thuEndTime"
                    :picker-options="{
                       start: timeRange.start,
                      step: timeRange.step,
                      end: timeRange.end,
                      minTime: editForm.thuBeginTime
                     }"/>
                </el-form-item>
              </el-col>
              <el-col :span="6" :pull="4">
                <el-form-item prop="thuNo">
                  <el-input-number v-model="editForm.thuNo" :controls="false" :max="100" :min="0" :precision="0"/>
                </el-form-item>
              </el-col>
            </el-row>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="1" :push="1">
            <el-form-item label="周五"/>
          </el-col>
          <el-col :span="23" :push="1">
            <el-row>
              <el-col :span="9">
                <el-form-item prop="friBeginTime">
                  <el-time-select
                    placeholder="开始时间"
                    v-model="editForm.friBeginTime"
                    :picker-options="{
                      start: timeRange.start,
                      step: timeRange.step,
                      end: timeRange.end
                     }"/>
                </el-form-item>
              </el-col>
              <el-col :span="9" :pull="2">
                <el-form-item prop="friEndTime">
                  <el-time-select
                    placeholder="结束时间"
                    v-model="editForm.friEndTime"
                    :picker-options="{
                       start: timeRange.start,
                      step: timeRange.step,
                      end: timeRange.end,
                      minTime: editForm.friBeginTime
                     }"/>
                </el-form-item>
              </el-col>
              <el-col :span="6" :pull="4">
                <el-form-item prop="friNo">
                  <el-input-number v-model="editForm.friNo" :controls="false" :max="100" :min="0" :precision="0"/>
                </el-form-item>
              </el-col>
            </el-row>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="1" :push="1">
            <el-form-item label="周六"/>
          </el-col>
          <el-col :span="23" :push="1">
            <el-row>
              <el-col :span="9">
                <el-form-item prop="satBeginTime">
                  <el-time-select
                    placeholder="开始时间"
                    v-model="editForm.satBeginTime"
                    :picker-options="{
                      start: timeRange.start,
                      step: timeRange.step,
                      end: timeRange.end
                     }"/>
                </el-form-item>
              </el-col>
              <el-col :span="9" :pull="2">
                <el-form-item prop="satEndTime">
                  <el-time-select
                    placeholder="结束时间"
                    v-model="editForm.satEndTime"
                    :picker-options="{
                       start: timeRange.start,
                      step: timeRange.step,
                      end: timeRange.end,
                      minTime: editForm.satBeginTime
                     }"/>
                </el-form-item>
              </el-col>
              <el-col :span="6" :pull="4">
                <el-form-item prop="name">
                  <el-input-number v-model="editForm.satNo" :controls="false" :max="100" :min="0" :precision="0"/>
                </el-form-item>
              </el-col>
            </el-row>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="1" :push="1">
            <el-form-item label="周日"/>
          </el-col>
          <el-col :span="23" :push="1">
            <el-row>
              <el-col :span="9">
                <el-form-item prop="sunBeginTime">
                  <el-time-select
                    placeholder="开始时间"
                    v-model="editForm.sunBeginTime"
                    :picker-options="{
                      start: timeRange.start,
                      step: timeRange.step,
                      end: timeRange.end
                     }"/>
                </el-form-item>
              </el-col>
              <el-col :span="9" :pull="2">
                <el-form-item prop="sunEndTime">
                  <el-time-select
                    placeholder="结束时间"
                    v-model="editForm.sunEndTime"
                    :picker-options="{
                       start: timeRange.start,
                      step: timeRange.step,
                      end: timeRange.end,
                      minTime: editForm.sunBeginTime
                     }"/>
                </el-form-item>
              </el-col>
              <el-col :span="6" :pull="4">
                <el-form-item prop="sunNo">
                  <el-input-number v-model="editForm.sunNo" :controls="false" :max="100" :min="0" :precision="0"/>
                </el-form-item>
              </el-col>
            </el-row>
          </el-col>
        </el-row>

      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import {getPyCode} from '../../../../common/py'

export default {

  data () {
    return {
      queryForm: {
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
        visible: false
      },
      timeRange: {
        start: '08:00',
        step: '00:30',
        end: '22:30'
      },
      editForm: {
        id: '',
        sysClinicRoomId: '',
        monBeginTime: '',
        monEndTime: '',
        monNo: 0,
        tueBeginTime: '',
        tueEndTime: '',
        tueNo: 0,
        wedBeginTime: '',
        wedEndTime: '',
        wedNo: 0,
        thuBeginTime: '',
        thuEndTime: '',
        thuNo: 0,
        friBeginTime: '',
        friEndTime: '',
        friNo: 0,
        satBeginTime: '',
        satEndTime: '',
        satNo: 0,
        sunBeginTime: '',
        sunEndTime: '',
        sunNo: 0
      },
      editFormRules: {
        id: [
          {required: true, message: '不能为空'}
        ],
        sysClinicRoomId: [
          {required: true, message: '不能为空'}
        ],
        monNo: [
          {required: true, message: '不能为空'}
        ],
        tueNo: [
          {required: true, message: '不能为空'}
        ],
        wedNo: [
          {required: true, message: '不能为空'}
        ],
        thuNo: [
          {required: true, message: '不能为空'}
        ],
        friNo: [
          {required: true, message: '不能为空'}
        ],
        satNo: [
          {required: true, message: '不能为空'}
        ],
        sunNo: [
          {required: true, message: '不能为空'}
        ]
      }
    }
  }, // end data

  computed: {
    clinicUserList: function () {
      return this.$store.getters.clinicUserList
    },
    clinicRoomList: function () {
      return this.$store.getters.clinicRoomList
    }
  },

  mounted () {
    this.$store.dispatch('queryClinicUserList')
    this.$store.dispatch('queryClinicRoomList')
  }, // end mounted

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
      let row = this.dataGrid.row
      if (row) {
        // 如果用户所在机构与目前诊室所在机构不符 将目前诊室 ID 清空
        if (row.sysClinicId !== row.roomSysClinicId) {
          row.sysClinicRoomId = ''
        }

        for (let key in this.editForm) {
          if (row[key] !== undefined) {
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
          // 如果为 null 将发送一个空串到后台
          for (let key in this.editForm) {
            if (this.editForm[key] === null) {
              this.editForm[key] = ''
            }
          }
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
