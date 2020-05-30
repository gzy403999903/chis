<template>
  <div>
    <!-- 功能菜单 -->
    <el-card
      shadow="never"
      body-style="padding: 5px;"
      class="el-card-menus"
      style="padding-right: 10px;">
      <el-row>
        <el-col :span="20" align="left" class="count-div">
          <div>销售总额(含税): {{dataGrid.countMap ? dataGrid.countMap.hsxs : 0}}</div>
          <div>成本总额(含税): {{dataGrid.countMap ? dataGrid.countMap.hscb : 0}}</div>
          <div>毛利总额(含税): {{dataGrid.countMap ? dataGrid.countMap.hsml : 0}}</div>
          <div>销售总额(无税): {{dataGrid.countMap ? dataGrid.countMap.wsxs : 0}}</div>
          <div>成本总额(无税): {{dataGrid.countMap ? dataGrid.countMap.wscb : 0}}</div>
          <div>毛利总额(无税): {{dataGrid.countMap ? dataGrid.countMap.wsml : 0}}</div>
          <div>毛利率: {{dataGrid.countMap ? dataGrid.countMap.mll : 0}}%</div>
        </el-col>
        <el-col :span="4">
          <el-button type="default" size="mini" round icon="el-icon-search" @click="dialog.visible = true">条件查询</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 查询条件界面 -->
    <el-dialog
      top="2%"
      width="60%"
      :show-close="false"
      :close-on-click-modal="false"
      :visible="dialog.visible">
      <!-- 模态框标题栏与功能按钮 -->
      <el-row slot="title">
        <el-col :span="5" style="font-size: 20px;">
          <span>条件查询</span>
        </el-col>
        <el-col :span="19" style="text-align: right;">
          <el-button type="primary" size="mini" icon="el-icon-search"  @click="dataGridLoadData">查询</el-button>
          <el-button type="default" size="mini" icon="el-icon-refresh" @click="$refs.queryForm.resetFields()">重置</el-button>
          <el-button type="warning" size="mini" icon="el-icon-right" @click="dialog.visible=false">返 回</el-button>
        </el-col>
      </el-row>

      <el-form :model="queryForm" ref="queryForm" :inline="false" size="mini" label-width="100px" label-position="left" style="padding: 0 20px;">
        <el-row :gutter="40">
          <el-col :span="12">
            <el-form-item label="销售日期" prop="creationDate">
              <el-date-picker
                style="width: 280px;"
                v-model="queryForm.creationDate"
                type="daterange"
                align="right"
                unlink-panels
                :clearable="false"
                value-format="yyyy-MM-dd"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :picker-options="pickerOptions"/>
            </el-form-item>
            <el-form-item label="开票日期" prop="invoiceDate">
              <el-date-picker
                style="width: 280px;"
                v-model="queryForm.invoiceDate"
                type="daterange"
                align="right"
                unlink-panels
                value-format="yyyy-MM-dd"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :picker-options="pickerOptions"/>
            </el-form-item>
            <el-form-item label="机构名称" prop="sysClinicName" v-if="action === 'all'">
              <el-input v-model.trim="queryForm.sysClinicName" placeholder="机构名称 / 助记码"/>
            </el-form-item>
            <el-form-item label="流水号" prop="lsh">
              <el-input v-model.trim="queryForm.lsh" placeholder="流水号"/>
            </el-form-item>
            <el-form-item label="商品编码" prop="entityOid">
              <el-input v-model.trim="queryForm.entityOid" placeholder="商品编码"/>
            </el-form-item>
            <el-form-item label="销售名称" prop="entityName">
              <el-input v-model.trim="queryForm.entityName" placeholder="商品名称 / 项目名称 / 助记码"/>
            </el-form-item>
            <el-form-item label="主推分类" prop="sellClassifyId">
              <el-select
                ref="sellClassifyId"
                v-model.trim="queryForm.sellClassifyId"
                filterable
                multiple
                clearable
                default-first-option
                placeholder="请选择">
                <el-option v-for="item in sellClassifyList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
              </el-select>
            </el-form-item>
          </el-col> <!-- end left -->

          <el-col :span="12">
            <el-form-item label="会员姓名" prop="mrmMemberName">
              <el-input v-model.trim="queryForm.mrmMemberName" placeholder="会员姓名 / 助记码"/>
            </el-form-item>
            <el-form-item label="会员手机" prop="phone">
              <el-input v-model.trim="queryForm.phone" placeholder="会员手机"/>
            </el-form-item>
            <el-form-item label="销售人ID" prop="sellerId">
              <el-input v-model.trim="queryForm.sellerId" placeholder="销售人ID"/>
            </el-form-item>
            <el-form-item label="销售人" prop="sellerName">
              <el-input v-model.trim="queryForm.sellerName" placeholder="销售人姓名 / 助记码"/>
            </el-form-item>
            <el-form-item label="供应商编码" prop="pemSupplierOid">
              <el-input v-model.trim="queryForm.pemSupplierOid" placeholder="供应商编码"/>
            </el-form-item>
            <el-form-item label="供应商" prop="pemSupplierName">
              <el-input v-model.trim="queryForm.pemSupplierName" placeholder="供应商名称 / 助记码"/>
            </el-form-item>
          </el-col> <!-- end right -->
        </el-row> <!-- end row -->

        <el-form-item label="销售类型" prop="sysSellTypeId">
          <el-radio-group v-model="queryForm.sysSellTypeId" @change="sysSellTypeIdChange">
            <el-radio :label="null" border>全部</el-radio>
            <el-radio :label="sellType.GOODS" border>商品</el-radio>
            <el-radio :label="sellType.ITEM" border>项目</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="entityTypeId">
          <el-radio-group v-model="queryForm.entityTypeId">
            <el-radio :label="null" border v-if="queryForm.sysSellTypeId">全部</el-radio>
            <el-radio :label="goodsType.WESTERN_DRUGS" border v-if="queryForm.sysSellTypeId === sellType.GOODS">西药 / 中成药</el-radio>
            <el-radio :label="goodsType.CHINESE_DRUGS" border v-if="queryForm.sysSellTypeId === sellType.GOODS">中药</el-radio>
            <el-radio :label="goodsType.HYGIENIC_MATERIAL" border v-if="queryForm.sysSellTypeId === sellType.GOODS">卫生材料</el-radio>

            <el-radio :label="itemType.MEDICAL_ITEM" border v-if="queryForm.sysSellTypeId === sellType.ITEM">医技项目</el-radio>
            <el-radio :label="itemType.ADJUVANT_ITEM" border v-if="queryForm.sysSellTypeId === sellType.ITEM">辅助项目</el-radio>
            <el-radio :label="itemType.OTHER_ITEM" border v-if="queryForm.sysSellTypeId === sellType.ITEM">其他项目</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 数据表 -->
    <el-card
      shadow="never"
      body-style="padding: 0;">
      <el-table
        :height="$store.getters.dataGridHeight"
        :data="dataGrid.data"
        highlight-current-row
        stripe
        border
        size="mini">
        <el-table-column fixed="left" type="index" width="50"/>
        <el-table-column prop="creationDate" label="单据日期" width="160" show-overflow-tooltip/>
        <el-table-column label="流水号" width="220" show-overflow-tooltip>
          <template slot-scope="props">
            <span v-show="props.row.returned && props.row.quantity < 0" style="color: #F56C6C;">{{props.row.lsh}}</span>
            <span v-show="props.row.returned && props.row.quantity >= 0" style="color: #E6A23C;">{{props.row.lsh}}</span>
            <span v-show="!props.row.returned">{{props.row.lsh}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="sysSellWayName" label="销售方式" width="100" show-overflow-tooltip/>
        <!--<el-table-column prop="sysSellTypeName" label="销售类型" width="100" show-overflow-tooltip/>-->
        <el-table-column prop="entityTypeName" label="销售类型" width="110" show-overflow-tooltip/>
        <el-table-column prop="entityOid" label="编码" width="120" show-overflow-tooltip/>
        <el-table-column prop="entityName" label="名称" width="200" sortable show-overflow-tooltip/>
        <el-table-column prop="specs" label="规格" width="150" show-overflow-tooltip/>
        <el-table-column prop="unitsName" label="销售单位" width="100" show-overflow-tooltip/>
        <el-table-column prop="originName" label="产地" width="100" show-overflow-tooltip/>
        <el-table-column prop="manufacturerName" label="生产厂家" width="300" show-overflow-tooltip/>
        <el-table-column prop="retailPrice" label="零售单价" width="120" sortable show-overflow-tooltip/>
        <el-table-column prop="quantity" label="销售数量" width="120" sortable show-overflow-tooltip/>
        <el-table-column prop="actualRetailPrice" label="实收单价" sortable width="120" show-overflow-tooltip/>
        <el-table-column label="实收小计" width="100" show-overflow-tooltip>
          <template slot-scope="props">
            {{(props.row.actualRetailPrice * props.row.quantity).toFixed(2)}}
          </template>
        </el-table-column>
        <el-table-column prop="costPrice" label="成本价" width="120" sortable show-overflow-tooltip/>
        <el-table-column label="成本小计(含税)" width="120" show-overflow-tooltip>
          <template slot-scope="props">
            {{(props.row.costPrice * props.row.quantity).toFixed(2)}}
          </template>
        </el-table-column>
        <el-table-column prop="ph" label="批号" width="150" show-overflow-tooltip/>
        <el-table-column prop="pch" label="批次号" width="150" show-overflow-tooltip/>
        <el-table-column prop="billingTypeName" label="计费类型" width="120" sortable show-overflow-tooltip/>
        <el-table-column prop="goodsClassifyName" label="商品分类" width="150" sortable show-overflow-tooltip/>
        <el-table-column prop="expiryDate" label="有效期至" width="120" sortable show-overflow-tooltip/>
        <el-table-column prop="mrmMemberOid" label="会员编码" width="150" show-overflow-tooltip/>
        <el-table-column prop="mrmMemberName" label="会员姓名" width="100" show-overflow-tooltip/>
        <el-table-column prop="phone" label="会员电话" width="150" show-overflow-tooltip/>
        <el-table-column prop="invoiceTypeName" label="发票类型" width="120" show-overflow-tooltip/>
        <el-table-column prop="invoiceNo" label="发票号" width="100" show-overflow-tooltip/>
        <el-table-column prop="invoiceDate" label="开票日期" width="160" show-overflow-tooltip/>
        <el-table-column prop="sellClassifyName" label="主推属性" width="110" show-overflow-tooltip/>
        <el-table-column prop="sellerId" label="销售人ID" width="100" show-overflow-tooltip/>
        <el-table-column prop="sellerName" label="销售人" width="100" show-overflow-tooltip/>
        <el-table-column prop="operatorId" label="出库人ID" width="100" show-overflow-tooltip/>
        <el-table-column prop="operatorName" label="出库人" width="100" show-overflow-tooltip/>
        <el-table-column prop="cashierId" label="收银员ID" width="100" show-overflow-tooltip/>
        <el-table-column prop="cashierName" label="收银员" width="100" show-overflow-tooltip/>
        <el-table-column prop="sysClinicName" label="机构名称" min-width="400" show-overflow-tooltip/>
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

  </div>
</template>

<script>
export default {
  props: {
    action: {
      type: String,
      required: true
    }
  },

  data () {
    return {
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        }
      },
      sellType: this.$store.getters.sellType, // 销售类型
      goodsType: this.$store.getters.goodsType, // 商品类型
      itemType: this.$store.getters.itemType, // 项目类型
      dialog: {
        visible: false
      },
      queryForm: {
        creationDate: this.$store.getters.queryDate,
        invoiceDate: null,
        sysClinicName: null,
        lsh: null,
        sysSellTypeId: null,
        entityTypeId: null,
        entityOid: null,
        entityName: null,
        mrmMemberName: null,
        phone: null,
        sellerId: null,
        sellerName: null,
        pemSupplierOid: null,
        pemSupplierName: null,
        sellClassifyId: null
      },
      dataGrid: {
        data: [],
        countMap: {}
      },
      pagination: {
        total: this.$store.getters.pagination.total, /* 总记录数 */
        pageSize: this.$store.getters.pagination.pageSize, /* 每页显示的行数 */
        currentPage: this.$store.getters.pagination.currentPage, /* 当前页页码 */
        pagerCount: this.$store.getters.pagination.pagerCount, /* 分页页码按钮的数量 */
        pageSizes: this.$store.getters.pagination.pageSizes, /* 选取每页显示的行数 */
        layout: this.$store.getters.pagination.layout
      }
    }
  }, // end data

  computed: {
    sellClassifyList: function () {
      return this.$store.getters.sellClassifyList
    }
  }, // end computed

  methods: {
    /**
     * 当销售类型发生改变时执行的内容
     */
    sysSellTypeIdChange () {
      this.queryForm.entityTypeId = null
    },

    /**
     * 当前页显示行数发生改变时
     * @param value
     */
    paginationSizeChange (value) {
      this.pagination.pageSize = value
      this.dataGridLoadData()
    },

    /**
     * 当前页码发生改变时
     * @param value
     */
    paginationCurrentChange (value) {
      this.pagination.currentPage = value
      this.dataGridLoadData()
    },

    /**
     * 载入数据
     */
    dataGridLoadData () {
      this.dataGrid.countMap = {} // 初始化 countMap

      this.$loading()
      let url = (
        this.action === 'all'
          ? '/chisAPI/sellRecordReport/getByCriteria'
          : '/chisAPI/sellRecordReport/getClinicListByCriteria'
      )
      let params = this.queryForm
      params.pageNum = this.pagination.currentPage
      params.pageSize = this.pagination.pageSize

      this.$http.get(url, {params}).then((res) => {
        if (res.data.code === 200) {
          this.pagination.total = res.data.resultSet.page.total
          this.dataGrid.data = res.data.resultSet.page.list
          this.dataGrid.countMap = res.data.resultSet.countMap
        }

        this.dialog.visible = false
        this.$loading().close()
      })
    }

  } // end methods
}
</script>

<style scoped>
  .count-div {
    font-size: 12px;
    font-weight: 600;
    line-height: 30px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }
</style>
