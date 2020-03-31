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
      top="4%"
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

      <el-form :model="queryForm" ref="queryForm" :inline="false" size="mini" label-width="110px" label-position="left" style="padding: 0 20px;">
        <el-form-item label="销售日期" prop="creationDate">
          <el-date-picker
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
        <el-form-item label="机构名称" prop="sysClinicName" v-if="action === 'all'">
          <el-input v-model.trim="queryForm.sysClinicName" placeholder="机构名称 / 助记码"/>
        </el-form-item>
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
        <el-form-item label="商品编码" prop="entityOid">
          <el-input v-model.trim="queryForm.entityOid" placeholder="商品编码"/>
        </el-form-item>
        <el-form-item label="销售名称" prop="entityName">
          <el-input v-model.trim="queryForm.entityName" placeholder="商品名称 / 项目名称 / 助记码"/>
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
        <el-table-column prop="entityTypeName" label="销售类型" width="110" show-overflow-tooltip/>
        <el-table-column prop="entityOid" label="编码" width="120" show-overflow-tooltip/>
        <el-table-column prop="entityName" label="名称" width="200" show-overflow-tooltip/>
        <el-table-column prop="specs" label="规格" width="150" show-overflow-tooltip/>
        <el-table-column prop="quantity" label="销售数量" width="100" show-overflow-tooltip/>
        <el-table-column prop="unitsName" label="销售单位" width="100" show-overflow-tooltip/>
        <el-table-column prop="originName" label="产地" width="100" show-overflow-tooltip/>
        <el-table-column prop="manufacturerName" label="生产厂家" width="300" show-overflow-tooltip/>
        <el-table-column prop="billingTypeName" label="计费类型" width="120" show-overflow-tooltip/>
        <el-table-column prop="goodsClassifyName" label="商品分类" width="150" show-overflow-tooltip/>
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
        sysClinicName: null,
        sysSellTypeId: null,
        entityTypeId: null,
        entityOid: null,
        entityName: null
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
      this.$loading()
      let url = (
        this.action === 'all'
          ? '/chisAPI/sellRecordReport/getSortSellRecordByCriteria'
          : '/chisAPI/sellRecordReport/getClinicSortSellRecordByCriteria'
      )
      let params = this.queryForm
      params.pageNum = this.pagination.currentPage
      params.pageSize = this.pagination.pageSize

      this.$http.get(url, {params}).then((res) => {
        if (res.data.code === 200) {
          this.pagination.total = res.data.resultSet.page.total
          this.dataGrid.data = res.data.resultSet.page.list
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
