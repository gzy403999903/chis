<template>
  <div>
    <!-- 功能菜单 -->
    <el-card
      shadow="never"
      body-style="padding: 5px;"
      class="el-card-menus"
      style="padding-right: 10px;">
      <el-button type="default" size="mini" round icon="el-icon-search" @click="dialog.visible = true">条件查询</el-button>
    </el-card>

    <!-- 查询条件界面 -->
    <el-dialog
      width="45%"
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

      <el-form :model="queryForm" ref="queryForm" :inline="false" size="mini" label-width="120px" label-position="left" style="padding: 0 20px;">
        <el-form-item label="单据日期" prop="creationDate">
          <el-date-picker
            v-model="queryForm.creationDate"
            type="daterange"
            align="right"
            unlink-panels
            value-format="yyyy-MM-dd"
            range-separator="至"
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
        <el-form-item label="商品毛利率差" prop="goodsMarginRate">
          <el-select v-model="queryForm.goodsMarginRateLogical" size="mini" placeholder="请选择" style="width: 100px;"
                     @change="logicalJoin('goodsMarginRateLogical', 'goodsMarginRate')">
            <el-option v-for="item in $store.getters.numLogicalList" :key="item.value" :label="item.label" :value="item.value"/>
          </el-select>
          <el-input-number v-model="queryForm.goodsMarginRate" :controls="false" :max="99" :min="-99" :precision="0"
                           @change="logicalJoin('goodsMarginRateLogical', 'goodsMarginRate')"
                           style="width: 100px;"/> &nbsp;%
        </el-form-item>
        <el-form-item label="整单毛利率差" prop="marginRate">
          <el-select v-model="queryForm.marginRateLogical" size="mini" placeholder="请选择" style="width: 100px;"
                     @change="logicalJoin('marginRateLogical', 'marginRate')">
            <el-option v-for="item in $store.getters.numLogicalList" :key="item.value" :label="item.label" :value="item.value"/>
          </el-select>
          <el-input-number v-model="queryForm.marginRate" :controls="false" :max="99" :min="-99" :precision="0"
                           @change="logicalJoin('marginRateLogical', 'marginRate')"
                           style="width: 100px;"/> &nbsp;%
        </el-form-item>
        <el-form-item label="商品折扣" prop="goodsDiscountRate">
          <el-select v-model="queryForm.goodsDiscountRateLogical" size="mini" placeholder="请选择" style="width: 100px;"
                     :disabled="true">
            <el-option v-for="item in $store.getters.numLogicalList" :key="item.value" :label="item.label" :value="item.value"/>
          </el-select>
          <el-input-number v-model="queryForm.goodsDiscountRate" :controls="false" :max="99" :min="0" :precision="0"
                           style="width: 100px;"/> &nbsp;折
        </el-form-item>
        <el-form-item label="项目折扣" prop="itemDiscountRate">
          <el-select v-model="queryForm.itemDiscountRateLogical" size="mini" placeholder="请选择" style="width: 100px;"
                     :disabled="true">
            <el-option v-for="item in $store.getters.numLogicalList" :key="item.value" :label="item.label" :value="item.value"/>
          </el-select>
          <el-input-number v-model="queryForm.itemDiscountRate" :controls="false" :max="99" :min="0" :precision="0"
                           style="width: 100px;"/> &nbsp;折
        </el-form-item>
        <el-form-item label="整单折扣" prop="discountRate">
          <el-select v-model="queryForm.discountRateLogical" size="mini" placeholder="请选择" style="width: 100px;"
                     :disabled="true">
            <el-option v-for="item in $store.getters.numLogicalList" :key="item.value" :label="item.label" :value="item.value"/>
          </el-select>
          <el-input-number v-model="queryForm.discountRate" :controls="false" :max="99" :min="0" :precision="0"
                           style="width: 100px;"/> &nbsp;折
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
        stripe
        border
        show-summary
        highlight-current-row
        size="mini">
        <el-table-column fixed="left" type="index" width="50"/>
        <el-table-column prop="creationDate" label="单据日期" width="160" show-overflow-tooltip/>
        <el-table-column prop="lsh" label="流水号" width="220" show-overflow-tooltip/>
        <el-table-column prop="sysSellWayName" label="销售方式" width="100" show-overflow-tooltip/>
        <el-table-column prop="goodsCostAmount" label="商品成本合计(含税)" width="150" show-overflow-tooltip/>
        <el-table-column prop="goodsRetailAmount" label="商品应收合计(含税)" width="150" show-overflow-tooltip/>
        <el-table-column label="商品应收毛利率" width="150" show-overflow-tooltip>
          <template slot-scope="props">
            {{props.row.goodsRetailMarginRate + ' %'}}
          </template>
        </el-table-column>
        <el-table-column prop="goodsActualAmount" label="商品实收合计(含税)" width="150" show-overflow-tooltip/>
        <el-table-column label="商品实收毛利率" width="150" show-overflow-tooltip>
          <template slot-scope="props">
            {{props.row.goodsActualMarginRate + ' %'}}
          </template>
        </el-table-column>
        <el-table-column label="商品毛利率差" width="150" show-overflow-tooltip>
          <template slot-scope="props">
            {{(props.row.goodsRetailMarginRate - Math.abs(props.row.goodsActualMarginRate)).toFixed(2) + ' %'}}
          </template>
        </el-table-column>
        <el-table-column label="商品折扣率" width="120" show-overflow-tooltip>
          <template slot-scope="props">
            {{formatterDiscountRate(props.row.goodsDiscountRate)}}
          </template>
        </el-table-column>
        <el-table-column prop="itemRetailAmount" label="项目应收合计" width="120" show-overflow-tooltip/>
        <el-table-column prop="itemActualAmount" label="项目实收合计" width="120" show-overflow-tooltip/>
        <el-table-column prop="itemDiscountRate" label="项目折扣率" width="120" show-overflow-tooltip>
          <template slot-scope="props">
            {{formatterDiscountRate(props.row.itemDiscountRate)}}
          </template>
        </el-table-column>
        <el-table-column prop="costAmount" label="整单成本合计(含税)" width="150" show-overflow-tooltip/>
        <el-table-column prop="retailAmount" label="整单应收合计(含税)" width="150" show-overflow-tooltip/>
        <el-table-column label="整单应收毛利率" width="150" show-overflow-tooltip>
          <template slot-scope="props">
            {{props.row.retailMarginRate + ' %'}}
          </template>
        </el-table-column>
        <el-table-column prop="actualAmount" label="整单实收合计(含税)" width="150" show-overflow-tooltip/>
        <el-table-column label="整单实收毛利率" width="150" show-overflow-tooltip>
          <template slot-scope="props">
            {{props.row.actualMarginRate + ' %'}}
          </template>
        </el-table-column>
        <el-table-column label="整单毛利率差" width="150" show-overflow-tooltip>
          <template slot-scope="props">
            {{(props.row.retailMarginRate - Math.abs(props.row.actualMarginRate)).toFixed(2) + ' %'}}
          </template>
        </el-table-column>
        <el-table-column prop="discountRate" label="整单折扣率" width="120" show-overflow-tooltip>
          <template slot-scope="props">
            {{formatterDiscountRate(props.row.discountRate)}}
          </template>
        </el-table-column>
        <!--
         <el-table-column label="销售人ID" width="120" show-overflow-tooltip>
          <template slot-scope="props">
            {{props.row.sellerId + ' '}}
          </template>
        </el-table-column>
        <el-table-column prop="sellerName" label="销售人姓名" width="120" show-overflow-tooltip/>
        -->
        <el-table-column label="收银员ID" width="120" show-overflow-tooltip>
          <template slot-scope="props">
            {{props.row.cashierId + ' '}}
          </template>
        </el-table-column>
        <el-table-column prop="cashierName" label="收银员姓名" width="120" show-overflow-tooltip/>
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
import moment from 'moment'
export default {
  props: {
    action: {
      type: String,
      required: true
    }
  }, // end props

  data () {
    return {
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        }
      },
      dialog: {
        visible: false
      },
      queryForm: {
        creationDate: [new Date(moment().subtract(1, 'months')), new Date()],
        sysClinicName: null,
        lsh: null,
        goodsMarginRate: undefined,
        goodsMarginRateLogical: '>=',
        marginRate: undefined,
        marginRateLogical: '>=',
        goodsDiscountRate: undefined,
        goodsDiscountRateLogical: '<=',
        itemDiscountRate: undefined,
        itemDiscountRateLogical: '<=',
        discountRate: undefined,
        discountRateLogical: '<='
      },
      dataGrid: {
        data: []
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

  methods: {
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
     * 格式化折扣率
     */
    formatterDiscountRate (value) {
      return value === 100 || value === 0 ? '' : (value % 10 === 0 ? (value / 10).toFixed(0) + ' 折' : value + ' 折')
    },

    /**
     * 拼接查询逻辑运算符和字段值
     */
    logicalJoin (logical, field) {
      let logicalValue = this.queryForm[logical] ? this.queryForm[logical] : this.$store.getters.numLogicalList[0].value
      let fieldValue = (this.queryForm[field] || this.queryForm[field] === 0) ? this.queryForm[field] : undefined
      if (fieldValue || fieldValue === 0) {
        fieldValue.toString().indexOf(' ') !== -1
          ? this.queryForm[field] = (logicalValue + ' ' + fieldValue.split(' ')[1])
          : this.queryForm[field] = (logicalValue + ' ' + fieldValue)
      }
    },

    /**
     * 调整表格高度
     * 此方法主要解决 el-table 合计行会出现错位的情况
     * 必须在数据加载完毕后调用
     */
    adjustTableHeight () {
      // 表单总高度
      let tableHeight = document.getElementsByClassName('el-table')[0].offsetHeight
      // 表头高度
      let headerHeight = document.getElementsByClassName('el-table__header-wrapper')[0].offsetHeight
      // 要等表单渲染完成后才能拿到合计行的高度
      this.$nextTick(() => {
        // 合计行高度
        let footerHeight = document.getElementsByClassName('el-table__footer-wrapper')[0].offsetHeight
        // 设置表单正文高度
        document.getElementsByClassName('el-table__body-wrapper')[0].style.height = tableHeight - headerHeight - footerHeight + 'px'
      })
    },

    /**
     * 载入数据
     */
    dataGridLoadData () {
      this.$loading()
      let url = (
        this.action === 'all'
          ? '/chisAPI/sellRecordReport/getLshMarginRateListByCriteria'
          : '/chisAPI/sellRecordReport/getClinicLshMarginRateListByCriteria'
      )
      let params = this.queryForm
      params.pageNum = this.pagination.currentPage
      params.pageSize = this.pagination.pageSize

      this.$http.get(url, {params}).then((res) => {
        if (res.data.code === 200) {
          this.pagination.total = res.data.resultSet.page.total
          this.dataGrid.data = res.data.resultSet.page.list
          this.adjustTableHeight()
        }
        this.dialog.visible = false
        this.$loading().close()
      })
    }

  } // end methods
}
</script>

<style scoped>
</style>
