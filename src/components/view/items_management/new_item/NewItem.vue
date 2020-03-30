<template>
  <div>
    <!--功能菜单-->
    <el-card
      shadow="never"
      body-style="padding: 5px;"
      class="el-card-menus">
      <el-form :model="queryForm" ref="queryForm" :inline="true" size="mini">
        <el-form-item label="申请日期" prop="creationDate">
          <el-date-picker
            style="width: 280px;"
            v-model="queryForm.creationDate"
            type="daterange"
            align="right"
            unlink-panels
            value-format="yyyy-MM-dd"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptions"/>
        </el-form-item>
        <el-form-item label="项目名称" prop="name">
          <el-input v-model.trim="queryForm.name" placeholder="项目名称 / 助记码" style="width: 150px;"/>
        </el-form-item>
        <el-form-item label="审批状态" prop="approveState">
          <el-select v-model="queryForm.approveState" placeholder="请选择" style="width: 100px;">
            <el-option label="全部" :value="null"/>
            <el-option label="待审核" :value="approveState.PENDING"/>
            <el-option label="待定价" :value="approveState.PRICING"/>
            <el-option label="通过" :value="approveState.APPROVED"/>
            <el-option label="驳回" :value="approveState.UNAPPROVED"/>
            <el-option label="撤销" :value="approveState.CANCEL"/>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" round icon="el-icon-search"  @click="dataGridLoadData">查询</el-button>
          <el-button type="default" round icon="el-icon-refresh" @click="$refs.queryForm.resetFields()">重置</el-button>
          <el-button type="default" round icon="el-icon-plus"    @click="editFormOpen(null)" v-if="action === 'apply'">新项目申请</el-button>
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
        stripe
        size="mini">
        <el-table-column fixed="left" type="index" width="50"/>
        <el-table-column fixed="left" label="操作" align="center" width="80">
          <template slot-scope="scope">
            <el-button size="mini" @click="editFormOpen(scope.row)">查 看</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="cimItemTypeName" label="项目类型" width="80" show-overflow-tooltip/>
        <el-table-column prop="name" label="项目名称" width="200" show-overflow-tooltip/>
        <el-table-column prop="creatorName" label="申请人" width="80" show-overflow-tooltip/>
        <el-table-column prop="creationDate" label="申请日期" width="100" show-overflow-tooltip/>
        <el-table-column prop="pricerName" label="定价人" width="80" show-overflow-tooltip/>
        <el-table-column prop="pricingDate" label="定价日期" width="100" show-overflow-tooltip/>
        <el-table-column prop="approverName" label="审批人" width="80" show-overflow-tooltip/>
        <el-table-column prop="approveDate" label="审批日期" width="100" show-overflow-tooltip/>
        <el-table-column prop="approveState" label="审批状态" width="80" :formatter="dataGridFormatterApproveSate" show-overflow-tooltip/>
        <el-table-column prop="creatorClinicName" label="申请机构" min-width="250" show-overflow-tooltip/>
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
      width="60%"
      :show-close="false"
      :close-on-click-modal="false"
      :visible="dialog.visible"
      @opened="editFormOpened"
      @closed="editFormClosed">

      <!-- 模态框标题栏与功能按钮-->
      <el-row slot="title">
        <el-col :span="5" style="font-size: 20px;">
          <span>收费项目</span>
        </el-col>
        <el-col :span="19" style="text-align: right;">
          <!--
          <el-button type="info" size="mini" icon="el-icon-remove-outline" @click="editFormDoAction('cancel')"
                     v-if="(dataGrid.row) && (dataGrid.row.approveState === approveState.PRICING) && (action === 'apply')">撤销</el-button>
           -->
          <el-button type="primary" size="mini" icon="el-icon-circle-check" @click="editFormDoAction('pricing')"
                     v-if="(dataGrid.row) && (dataGrid.row.approveState === approveState.PRICING) && (action === 'pricing')">定 价</el-button>
          <el-button type="danger" size="mini" icon="el-icon-remove-outline" @click="editFormDoAction('unapproved')"
                     v-if="(dataGrid.row) && (dataGrid.row.approveState === approveState.PENDING) && (action === 'approve')">项目驳回</el-button>
          <el-button type="danger" size="mini" icon="el-icon-remove-outline" @click="editFormDoAction('cancelPricing')"
                     v-if="(dataGrid.row) && (dataGrid.row.approveState === approveState.PENDING) && (action === 'approve')">定价驳回</el-button>
          <el-button type="success" size="mini" icon="el-icon-circle-check" @click="editFormDoAction('approved')"
                     v-if="(dataGrid.row) && (dataGrid.row.approveState === approveState.PENDING) && (action === 'approve')">通 过</el-button>
          <el-button type="primary" size="mini" icon="el-icon-check" @click="editFormSave"
                     v-if="(!dataGrid.row) && (action === 'apply')">提 交</el-button>
          <el-button type="warning" size="mini" icon="el-icon-right" @click="dialog.visible=false">返 回</el-button>
        </el-col>
      </el-row>

      <!-- 编辑表单 -->
      <el-form :model="editForm" ref="editForm" :rules="editFormRules" size="small" label-width="100px">
        <el-form-item prop="id" v-show="false">
          <el-input v-model.trim="editForm.id"/>
        </el-form-item>

        <el-row>
          <el-col :span="24">
            <el-form-item label="项目分类" prop="cimItemTypeId">
              <el-radio-group v-model="editForm.cimItemTypeId" v-if="dialog.editable">
                <el-radio :label="itemType.MEDICAL_ITEM" border>医技项目</el-radio>
                <el-radio :label="itemType.ADJUVANT_ITEM" border>理疗项目</el-radio>
                <el-radio :label="itemType.OTHER_ITEM" border>其他项目</el-radio>
              </el-radio-group>
              <span v-if="!dialog.editable">{{editFormGetItemTypeName(editForm.cimItemTypeId)}}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="项目名称" prop="name">
              <el-input v-model.trim="editForm.name" v-show="dialog.editable"
                        ref="name"
                        @blur="editFormSetPyCode" @change="editFormSetPyCode"
                        @keyup.enter.native="editFormValidateField('name', 'itemUnitsId')"/>
              <span v-if="!dialog.editable">{{editForm.name}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="助记码" prop="code">
              <el-input v-model.trim="editForm.code" v-if="dialog.editable"/>
              <span v-if="!dialog.editable">{{editForm.code}}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="8">
            <el-form-item label="单位" prop="itemUnitsId">
              <el-select
                v-if="dialog.editable"
                ref="itemUnitsId"
                @keyup.enter.native="editFormValidateField('itemUnitsId', 'befitGenderId')"
                v-model.trim="editForm.itemUnitsId"
                filterable
                default-first-option
                placeholder="请选择">
                <el-option v-for="item in itemUnitsList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
              </el-select>
              <span v-if="!dialog.editable">{{editFormGetName(editForm.itemUnitsId, itemUnitsList)}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="8" :offset="4">
            <el-form-item label="适用性别" prop="befitGenderId">
              <el-select
                v-if="dialog.editable"
                ref="befitGenderId"
                @keyup.enter.native="editFormValidateField('befitGenderId', 'quantity')"
                v-model.trim="editForm.befitGenderId"
                filterable
                default-first-option
                placeholder="请选择">
                <el-option :value="''" label="全部"/>
                <el-option v-for="item in befitGenderList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
              </el-select>
              <span v-if="!dialog.editable">{{editFormGetName(editForm.befitGenderId, befitGenderList)}}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="8">
            <el-form-item label="可执行次数" prop="quantity">
              <el-input-number v-model.trim="editForm.quantity" :controls="false" :max="100" :min="1" :precision="0"
                               v-if="dialog.editable"
                               ref="quantity" @keyup.enter.native="editFormValidateField('quantity', 'billingTypeId')"/>
              <span v-if="!dialog.editable">{{editForm.quantity}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="8" :offset="4">
            <el-form-item label="零售单价" prop="retailPrice" style="border: #F56C6C 1px dashed;">
              <el-input-number v-model.trim="editForm.retailPrice" :controls="false" :max="99999" :min="0" :precision="2"
                               ref="retailPrice" style="width: 80%;" v-if="dialog.retailPriceEditable"/>
              <span v-if="dialog.retailPriceEditable">&nbsp;&nbsp;元</span>
              <div v-if="!dialog.retailPriceEditable">{{editForm.retailPrice}}&nbsp;&nbsp;元</div>
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
                v-if="dialog.editable"
                ref="billingTypeId"
                @keyup.enter.native="editFormValidateField('billingTypeId', 'itemClassifyId')"
                v-model.trim="editForm.billingTypeId"
                filterable
                default-first-option
                placeholder="请选择">
                <el-option v-for="item in billingTypeList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
              </el-select>
              <span v-if="!dialog.editable">{{editFormGetName(editForm.billingTypeId, billingTypeList)}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="项目分类" prop="itemClassifyId">
              <el-select
                v-if="dialog.editable"
                ref="itemClassifyId"
                @keyup.enter.native="editFormValidateField('itemClassifyId', 'explains')"
                v-model.trim="editForm.itemClassifyId"
                filterable
                default-first-option
                placeholder="请选择">
                <el-option :value="''" label="无"/>
                <el-option v-for="item in itemClassifyList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
              </el-select>
              <span v-if="!dialog.editable">{{editFormGetName(editForm.itemClassifyId, itemClassifyList)}}</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="项目说明" prop="explains">
          <el-input v-model.trim="editForm.explains" v-if="dialog.editable"
                    ref="explains"/>
          <span v-if="!dialog.editable">{{editForm.explains}}</span>
        </el-form-item>

        <el-row>
          <el-col :span="8">
            <el-form-item label="参与打折" prop="discountable">
              <el-radio-group v-model="editForm.discountable" :disabled="!dialog.editable">
                <el-radio :label="true">是</el-radio>
                <el-radio :label="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="可退费" prop="returnable">
              <el-radio-group v-model="editForm.returnable" :disabled="!dialog.editable">
                <el-radio :label="true">是</el-radio>
                <el-radio :label="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="医保项目" prop="ybItem">
              <el-radio-group v-model="editForm.ybItem" :disabled="!dialog.editable">
                <el-radio :label="true">是</el-radio>
                <el-radio :label="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
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
      approveState: this.$store.getters.approveState,
      itemType: this.$store.getters.itemType, // 收费项目类型
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        }
      },
      queryForm: {
        name: '',
        creationDate: this.$store.getters.queryDate,
        approveState: null
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
        editable: true,
        retailPriceEditable: true
      },
      editForm: {
        id: '',
        cimItemTypeId: '',
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
        ybItem: false
      },
      editFormRules: {
        cimItemTypeId: [
          {required: true, message: '不能为空'}
        ],
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
    dataGridFormatterApproveSate (row, column, cellValue) {
      switch (cellValue) {
        case this.$store.getters.approveState.UNAPPROVED: return '驳回'
        case this.$store.getters.approveState.APPROVED: return '通过'
        case this.$store.getters.approveState.CANCEL: return '撤销'
        case this.$store.getters.approveState.PURCHASING: return '待采购'
        case this.$store.getters.approveState.PRICING: return '待定价'
        case this.$store.getters.approveState.PENDING: return '待审核'
        default: return '未知状态'
      }
    },

    dataGridLoadData () {
      this.$loading()
      const url = `/chisAPI/itemApply/getByCriteria`
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

    /* -------------------------------------------------------------------------------------------------------------- */
    editFormOpen (row) {
      if (row) {
        if (this.action === 'pricing' && row.approveState === this.approveState.PRICING) {
          this.dialog.editable = false
          this.dialog.retailPriceEditable = true
        } else {
          this.dialog.editable = false
          this.dialog.retailPriceEditable = false
        }
      } else {
        this.dialog.editable = true
        this.dialog.retailPriceEditable = false
      }

      this.dataGrid.row = row
      this.dialog.visible = true
    },
    editFormOpened () {
      // this.$refs.cimItemTypeId.focus() // 自动获取焦点位置
      let row = this.dataGrid.row
      if (row) {
        for (let key in this.editForm) {
          if (this.editForm.hasOwnProperty(key) && row[key] !== undefined) {
            this.editForm[key] = row[key]
          }
        }
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
    editFormGetItemTypeName (id) {
      switch (id) {
        case this.itemType.MEDICAL_ITEM: return '医技项目'
        case this.itemType.ADJUVANT_ITEM: return '理疗项目'
        case this.itemType.OTHER_ITEM: return '其他项目'
        default: return '未知'
      }
    },
    editFormGetName (id, selectData) {
      let data = selectData.find((item) => {
        return item.id === id
      })

      if (data) {
        return data.name
      }

      return '全部'
    },
    editFormSetPyCode () {
      this.editForm.code = getPyCode(this.editForm.name)
    },
    editFormDoAction (action) {
      let row = this.dataGrid.row
      if (!row) {
        this.$message.error('缺少提交参数')
        return false
      }

      this.$confirm('确认要执行该操作吗? 该操作不可撤销！', '提示', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', showClose: false
      }).then(() => {
        this.$loading()
        const url = `/chisAPI/itemApply/${action}`
        let method = 'PUT'
        let params = {
          id: row.id
        }

        // 如果是定价则携带零售单价作为参数
        if (action === 'pricing') {
          params.retailPrice = this.editForm.retailPrice
        }

        this.$http({method, url, params}).then((res) => {
          if (res.data.code === 200) {
            this.$message.success(res.data.msg)
            this.dataGridLoadData()
            this.dialog.visible = false
          } else {
            this.$loading().close()
          }
        })
      }).catch(() => {})
    },
    editFormSave () {
      this.$refs.editForm.validate((valid) => {
        if (valid) {
          this.$loading()
          let url = `/chisAPI/itemApply/save`
          let method = 'POST'
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
