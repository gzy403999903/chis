<template>
  <div>
    <!--功能菜单-->
    <el-card
      shadow="never"
      body-style="padding: 5px;"
      class="el-card-menus">
      <el-form :model="queryForm" ref="queryForm" :inline="true" size="mini">
        <el-form-item :label="`${title}名称`" prop="name">
          <el-input v-model.trim="queryForm.name" :placeholder="`${title}名称 / 助记码`"/>
        </el-form-item>
        <el-form-item label="项目分类" prop="itemClassifyId">
          <el-select
            v-model.trim="queryForm.itemClassifyId"
            filterable
            default-first-option
            placeholder="请选择">
            <el-option :value="''" label="全部"/>
            <el-option v-for="item in itemClassifyList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
          </el-select>
        </el-form-item>
        <el-form-item label="医保项目" prop="ybItem">
          <el-select v-model="queryForm.ybItem" placeholder="请选择" style="width: 100px;">
            <el-option label="全部" :value="null"/>
            <el-option label="是" :value="true"/>
            <el-option label="否" :value="false"/>
          </el-select>
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
          <el-button type="default" round icon="el-icon-plus"    @click="editFormOpen(null)">添加</el-button>
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
        <el-table-column fixed="left" label="操作" align="center" width="120">
          <template slot-scope="scope">
            <el-button size="mini" icon="el-icon-edit" v-if="!scope.row.required" @click="editFormOpen(scope.row)"/>
            <el-button size="mini" type="danger" icon="el-icon-delete" v-if="!scope.row.required" @click="dataGridDelete(scope.row)"/>
          </template>
        </el-table-column>
        <el-table-column prop="name" :label="`${title}名称`" width="200" show-overflow-tooltip/>
        <el-table-column prop="itemUnitsName" label="单位" width="100" show-overflow-tooltip/>
        <el-table-column prop="befitGenderName" label="适用性别" width="150" :formatter="dataGridFormatterBefitGenderName" show-overflow-tooltip/>
        <el-table-column prop="billingTypeName" label="计费类型" width="150" show-overflow-tooltip/>
        <el-table-column prop="retailPrice" label="零售单价" width="100" show-overflow-tooltip/>
        <el-table-column prop="quantity" label="包含次数" width="100" show-overflow-tooltip/>
        <el-table-column prop="discountable" label="参与打折" width="100" :formatter="dataGridFormatterDiscountable" show-overflow-tooltip/>
        <el-table-column prop="returnable" label="可退费" width="100" :formatter="dataGridFormatterReturnable" show-overflow-tooltip/>
        <el-table-column prop="state" label="状态" :formatter="dataGridFormatterState" show-overflow-tooltip/>
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
      width="65%"
      :show-close="false"
      :close-on-click-modal="false"
      :visible="dialog.visible"
      @opened="editFormOpened"
      @closed="editFormClosed">

      <!-- 模态框标题栏与功能按钮 -->
      <el-row slot="title">
        <el-col :span="5" style="font-size: 20px;">
          <span>{{title}}</span>
        </el-col>
        <el-col :span="19" style="text-align: right;">
          <el-button type="primary" size="mini" icon="el-icon-check" @click="editFormSubmit">确 定</el-button>
          <el-button type="warning" size="mini" icon="el-icon-right" @click="dialog.visible=false">取 消</el-button>
        </el-col>
      </el-row>

      <!-- 编辑表单 -->
      <el-form :model="editForm" ref="editForm" :rules="editFormRules" size="small" label-width="100px">
        <el-form-item prop="id" v-show="false">
          <el-input v-model.trim="editForm.id"/>
        </el-form-item>

        <el-row>
          <el-col :span="12">
            <el-form-item label="项目名称" prop="name">
              <el-input v-model.trim="editForm.name" autofocus ref="name"
                        @blur="editFormSetPyCode" @change="editFormSetPyCode"
                        @keyup.enter.native="editFormValidateField('name', 'itemUnitsId')"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="助记码" prop="code">
              <el-input v-model.trim="editForm.code"/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="8">
            <el-form-item label="单位" prop="itemUnitsId">
              <el-select
                ref="itemUnitsId"
                @keyup.enter.native="editFormValidateField('itemUnitsId', 'befitGenderId')"
                v-model.trim="editForm.itemUnitsId"
                filterable
                default-first-option
                placeholder="请选择">
                <el-option v-for="item in itemUnitsList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8" :offset="4">
            <el-form-item label="适用性别" prop="befitGenderId">
              <el-select
                ref="befitGenderId"
                @keyup.enter.native="editFormValidateField('befitGenderId', 'quantity')"
                v-model.trim="editForm.befitGenderId"
                filterable
                default-first-option
                placeholder="请选择">
                <el-option :value="''" label="全部"/>
                <el-option v-for="item in befitGenderList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="8">
            <el-form-item label="可执行次数" prop="quantity">
              <el-input-number v-model="editForm.quantity" :controls="false" :max="100" :min="1" :precision="0"
                               ref="quantity" @keyup.enter.native="editFormValidateField('quantity', (dialog.editable ? 'retailPrice' : 'billingTypeId'))"/>
            </el-form-item>
          </el-col>
          <el-col :span="8" :offset="4">
            <el-form-item label="零售单价" prop="retailPrice">
              <el-input-number v-model="editForm.retailPrice" :controls="false" :max="9999" :min="0" :precision="2"
                               ref="retailPrice" style="width: 80%;" v-if="dialog.editable"
                               @keyup.enter.native="editFormValidateField('retailPrice', 'billingTypeId')"/>
              <span v-if="dialog.editable">&nbsp;&nbsp;元</span>
              <span v-if="!dialog.editable">{{editForm.retailPrice}} &nbsp;&nbsp;元</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-alert style="height: 30px; margin-bottom: 20px;"
                  title="可执行次数指单次销售所包含的次数, 例如 1疗程 12次, 可执行次数就填写 12"
                  :closable="false"
                  type="info"/>

        <el-row>
          <el-col :span="12">
            <el-form-item label="计费类型" prop="billingTypeId">
              <el-select
                ref="billingTypeId"
                @keyup.enter.native="editFormValidateField('billingTypeId', 'itemClassifyId')"
                v-model.trim="editForm.billingTypeId"
                filterable
                default-first-option
                placeholder="请选择">
                <el-option v-for="item in billingTypeList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="项目分类" prop="itemClassifyId">
              <el-select
                ref="itemClassifyId"
                @keyup.enter.native="editFormValidateField('itemClassifyId', 'explains')"
                v-model.trim="editForm.itemClassifyId"
                filterable
                default-first-option
                placeholder="请选择">
                <el-option :value="''" label="无"/>
                <el-option v-for="item in itemClassifyList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="项目说明" prop="explains">
          <el-input v-model.trim="editForm.explains" ref="explains"/>
        </el-form-item>

        <el-row>
          <el-col :span="6">
            <el-form-item label="参与打折" prop="discountable">
              <el-radio-group v-model="editForm.discountable">
                <el-radio :label="true">是</el-radio>
                <el-radio :label="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="可退费" prop="returnable">
              <el-radio-group v-model="editForm.returnable">
                <el-radio :label="true">是</el-radio>
                <el-radio :label="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="医保项目" prop="ybItem">
              <el-radio-group v-model="editForm.ybItem">
                <el-radio :label="true">是</el-radio>
                <el-radio :label="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="状态" prop="state">
              <el-radio-group v-model="editForm.state">
                <el-radio :label="true">启用</el-radio>
                <el-radio :label="false">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>

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
        name: '',
        itemClassifyId: '',
        ybItem: null,
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
        editable: true
      },
      editForm: {
        id: '',
        name: '',
        code: '',
        itemUnitsId: '',
        befitGenderId: '',
        billingTypeId: '',
        itemClassifyId: '',
        retailPrice: 0,
        quantity: 1,
        explains: '',
        discountable: true,
        returnable: true,
        ybItem: false,
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
        itemUnitsId: [
          {required: true, message: '不能为空'}
        ],
        befitGenderId: [
          /* {required: true, message: '不能为空'} */
        ],
        billingTypeId: [
          {required: true, message: '不能为空'}
        ],
        retailPrice: [
          {required: true, message: '不能为空'}
        ],
        quantity: [
          {required: true, message: '不能为空'}
        ],
        explains: [
          {max: 30, message: '长度不合法[1-30]'}
        ]
      }
    }
  },

  props: {
    title: {
      type: String,
      required: true
    },
    action: {
      type: String,
      required: true
    }
  },

  computed: {
    itemUnitsList: function () {
      return this.$store.getters.itemUnitsList
    },
    itemClassifyList: function () {
      return this.$store.getters.itemClassifyList
    },
    befitGenderList: function () {
      return this.$store.getters.befitGenderList
    },
    billingTypeList: function () {
      return this.$store.getters.billingTypeList
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
    dataGridIndex (index) {
      return ++index
    },
    dataGridFormatterDiscountable (row, column, cellValue) {
      return cellValue ? '是' : '否'
    },
    dataGridFormatterReturnable (row, column, cellValue) {
      return cellValue ? '是' : '否'
    },
    dataGridFormatterState (row, column, cellValue) {
      return cellValue ? '启用' : '禁用'
    },
    dataGridFormatterBefitGenderName (row, column, cellValue) {
      return cellValue === undefined ? '全部' : cellValue
    },
    dataGridLoadData () {
      this.$loading()
      const url = `/chisAPI/${this.action}/getByCriteria`
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
    dataGridDelete (row) {
      this.$confirm('确认删除吗? 该操作不可恢复！', '提示', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', showClose: false
      }).then(() => {
        this.$loading()
        const url = `/chisAPI/${this.action}/delete`
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
    editFormOpen (row) {
      this.dataGrid.row = row
      this.dialog.visible = true
    },
    editFormOpened () {
      this.$refs.name.focus() // 自动获取焦点位置
      let row = this.dataGrid.row
      if (row) {
        for (let key in this.editForm) {
          if (row[key] !== undefined) {
            this.editForm[key] = row[key]
          }
        }
        this.dialog.editable = false
        this.dialog.url = `/chisAPI/${this.action}/update`
        this.dialog.method = 'PUT'
      } else {
        this.dialog.editable = true
        this.dialog.url = `/chisAPI/${this.action}/save`
        this.dialog.method = 'POST'
      }
    },
    editFormClosed () {
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
