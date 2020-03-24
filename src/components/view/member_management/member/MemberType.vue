<template>
  <div>
    <!--功能菜单-->
    <el-card
      shadow="never"
      body-style="padding: 5px;"
      class="el-card-menus">
      <el-form :model="queryForm" ref="queryForm" :inline="true" size="mini">
        <el-form-item label="会员类型名称" prop="name">
          <el-input v-model.trim="queryForm.name" placeholder="会员类型名称 / 助记码"/>
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
        <el-table-column fixed="left" type="index" width="50"/>
        <el-table-column fixed="left" label="操作" align="center" width="120">
          <template slot-scope="scope">
            <el-button size="mini" icon="el-icon-edit" @click="dialogOpen(scope.row)"/>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="dataGridDelete(scope.row)"/>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="会员类型名称" width="200" show-overflow-tooltip/>
        <el-table-column label="充值赠额" width="250" show-overflow-tooltip>
          <template slot-scope="props">
            {{props.row.depositAmount === 0 ? '无' : '充值金额每满 ' + props.row.depositAmount + ' 元 赠送 ' + props.row.givenAmount + ' 元'}}
          </template>
        </el-table-column>
        <el-table-column label="消费积分" width="250" show-overflow-tooltip>
          <template slot-scope="props">
            {{props.row.paymentAmount === 0 ? '无' : '消费金额每满 ' + props.row.paymentAmount + ' 元 赠送 1 积分'}}
          </template>
        </el-table-column>
        <el-table-column prop="discountRate" label="享受折扣" width="120" show-overflow-tooltip/>
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

    <!-- 添加 / 编辑 -->
    <el-dialog
      title="会员类型"
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
        <el-form-item label="会员类型名称" prop="name">
          <el-input v-model.trim="editForm.name" ref="name" @keyup.enter.native="editFormValidateToNextFocus('name', 'deposit')"
                    @blur="editFormSetPyCode('name', 'code')" @change="editFormSetPyCode('name', 'code')"/>
        </el-form-item>
        <el-form-item label="助记码" prop="code">
          <el-input v-model.trim="editForm.code"/>
        </el-form-item>

        <el-row>
          <el-col :span="12">
            <el-form-item label="充值金额" prop="depositAmount">
              <el-input-number v-model="editForm.depositAmount" :controls="false" :max="99999" :min="0" :precision="2"
                               ref="depositAmount" @keyup.enter.native="editFormValidateToNextFocus('depositAmount', 'givenAmount')"
                               style="width: 75%;"/> &nbsp;&nbsp;元
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="赠送金额" prop="givenAmount">
              <el-input-number v-model="editForm.givenAmount" :controls="false" :max="99999" :min="0" :precision="2"
                               ref="givenAmount" @keyup.enter.native="editFormValidateToNextFocus('givenAmount', 'paymentAmount')"
                               style="width: 75%;"/> &nbsp;&nbsp;元
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="消费金额" prop="paymentAmount">
              <el-input-number v-model="editForm.paymentAmount" :controls="false" :max="99999" :min="0" :precision="2"
                               ref="paymentAmount" @keyup.enter.native="editFormValidateToNextFocus('paymentAmount', 'discountRate')"
                               style="width: 75%;"/> &nbsp;&nbsp;元
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="赠送积分">
              1&nbsp;&nbsp;分
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="享受折扣" prop="discountRate">
              <el-input-number v-model="editForm.discountRate" :controls="false" :max="9.9" :min="0" :precision="1"
                               ref="discountRate" style="width: 75%;"/> &nbsp;&nbsp;折
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="状态" prop="state">
          <el-radio-group v-model="editForm.state">
            <el-radio :label="true">启用</el-radio>
            <el-radio :label="false">禁用</el-radio>
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
        method: 'POST',
        visible: false
      },
      editForm: {
        id: '',
        name: '',
        code: '',
        depositAmount: 0,
        givenAmount: 0,
        paymentAmount: 0,
        givenPoints: 0,
        discountRate: 0,
        state: true
      },
      editFormRules: {
        name: [
          {required: true, message: '不能为空'},
          {max: 30, message: '长度不合法[1-30]'}
        ],
        code: [
          {required: true, message: '不能为空'},
          {max: 30, message: '长度不合法[1-30]'}
        ],
        depositAmount: [
          {required: true, message: '不能为空'}
        ],
        givenAmount: [
          {required: true, message: '不能为空'}
        ],
        paymentAmount: [
          {required: true, message: '不能为空'}
        ],
        givenPoints: [
          {required: true, message: '不能为空'}
        ],
        discountRate: [
          {required: true, message: '不能为空'}
        ]
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
    dataGridFormatterState (row, column, cellValue) {
      return cellValue ? '启用' : '禁用'
    },

    /**
     * 数据载入
     */
    dataGridLoadData () {
      this.$loading()
      const url = `/chisAPI/memberType/getByCriteria`
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
        const url = `/chisAPI/memberType/delete`
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
      this.$refs.name.focus()
      let row = this.dataGrid.row
      if (row) {
        for (let key in this.editForm) {
          if (row[key] !== undefined) {
            this.editForm[key] = row[key]
          }
        }
        this.dialog.url = `/chisAPI/memberType/update`
        this.dialog.method = 'PUT'
      } else {
        this.dialog.url = `/chisAPI/memberType/save`
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
     * 验证当前输入通过后获取下一个焦点
     * @param currentProp
     * @param nextRef
     */
    editFormValidateToNextFocus (currentProp, nextRef) {
      this.$refs.editForm.validateField(currentProp, (valid) => {
        if (!valid) {
          this.$refs[nextRef].focus()
        } else {
          return false
        }
      })
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
