<template>
  <div>
    <!-- 功能菜单 -->
    <el-card
      shadow="never"
      body-style="padding: 5px;"
      class="el-card-menus"
      style="padding-right: 10px;">
      <el-button type="default" size="mini" round icon="el-icon-search" @click="visible = true">条件查询</el-button>
    </el-card>

    <!-- 查询条件界面 -->
    <el-dialog
      top="4%"
      width="45%"
      :show-close="false"
      :close-on-click-modal="false"
      :visible="visible">
      <!-- 模态框标题栏与功能按钮 -->
      <el-row slot="title">
        <el-col :span="5" style="font-size: 20px;">
          <span>条件查询</span>
        </el-col>
        <el-col :span="19" style="text-align: right;">
          <el-button type="primary" size="mini" icon="el-icon-search"  @click="dataGridLoadData">查询</el-button>
          <el-button type="default" size="mini" icon="el-icon-refresh" @click="$refs.queryForm.resetFields()">重置</el-button>
          <el-button type="warning" size="mini" icon="el-icon-right" @click="visible=false">返 回</el-button>
        </el-col>
      </el-row>

      <el-form :model="queryForm" ref="queryForm" size="mini" label-width="110px" label-position="left" style="padding: 0 20px;">
        <el-form-item label="销售日期" prop="creationDate" v-if="action === 'sellRecordReport'">
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
        <el-form-item label="商品编码" prop="gsmGoodsOid">
          <el-input v-model.trim="queryForm.gsmGoodsOid" placeholder="商品编码"/>
        </el-form-item>
        <el-form-item label="商品名称" prop="gsmGoodsName">
          <el-input v-model.trim="queryForm.gsmGoodsName" placeholder="商品名称 / 助记码"/>
        </el-form-item>
        <el-form-item label="供应商编码" prop="pemSupplierOid">
          <el-input v-model.trim="queryForm.pemSupplierOid" placeholder="供应商编码"/>
        </el-form-item>
        <el-form-item label="供应商名称" prop="pemSupplierName">
          <el-input v-model.trim="queryForm.pemSupplierName" placeholder="供应商名称 / 助记码"/>
        </el-form-item>
        <el-form-item label="机构名称" prop="sysClinicName" v-if="groupBy === 'clinic'">
          <el-input v-model.trim="queryForm.sysClinicName" placeholder="机构名称 / 助记码"/>
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
        highlight-current-row
        size="mini">
        <el-table-column fixed="left" type="index" width="50"/>
        <el-table-column prop="gsmGoodsTypeName" label="商品类型" width="120" show-overflow-tooltip/>
        <el-table-column prop="gsmGoodsOid" label="商品编码" width="100" show-overflow-tooltip/>
        <el-table-column prop="gsmGoodsName" label="商品名称" width="250" show-overflow-tooltip/>
        <el-table-column prop="gsmGoodsSpecs" label="规格" width="150" show-overflow-tooltip/>
        <el-table-column prop="quantity" label="库存数量" width="100" show-overflow-tooltip/>
        <el-table-column prop="goodsUnitsName" label="单位" width="100" show-overflow-tooltip/>
        <el-table-column prop="retailPrice" label="零售单价" width="100" show-overflow-tooltip/>
        <el-table-column prop="costPrice" label="发票成本价" width="120" show-overflow-tooltip/>
        <el-table-column prop="firstCostPrice" label="一成本价" width="100" show-overflow-tooltip/>
        <el-table-column prop="secondCostPrice" label="二成本价" width="100" show-overflow-tooltip/>
        <el-table-column prop="originName" label="产地" width="100" show-overflow-tooltip/>
        <el-table-column prop="manufacturerName" label="生产厂家" width="250" show-overflow-tooltip/>
        <el-table-column prop="pemSupplierOid" label="供应商编码" width="100" show-overflow-tooltip/>
        <el-table-column prop="pemSupplierName" label="供应商名称" width="250" show-overflow-tooltip/>
        <el-table-column prop="sysClinicName" label="机构名称" min-width="400" show-overflow-tooltip
                         v-if="groupBy === 'clinic'"/>
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
    },
    groupBy: {
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
      visible: false,
      queryForm: {
        creationDate: this.$store.getters.queryDate,
        gsmGoodsOid: '',
        gsmGoodsName: '',
        pemSupplierOid: '',
        pemSupplierName: '',
        sysClinicName: ''
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
      let url = this.action === 'inventoryReport'
        ? '/chisAPI/inventoryReport/getInventoryAssessCostByCriteria'
        : '/chisAPI/sellRecordReport/getSellAssessCostByCriteria'
      let params = this.queryForm
      params.pageNum = this.pagination.currentPage
      params.pageSize = this.pagination.pageSize
      params.groupBy = this.groupBy

      this.$http.get(url, {params}).then((res) => {
        if (res.data.code === 200) {
          this.pagination.total = res.data.resultSet.page.total
          this.dataGrid.data = res.data.resultSet.page.list
          // this.adjustTableHeight()
        }
        this.visible = false
        this.$loading().close()
      })
    }

  } // end methods
}
</script>

<style scoped>
</style>
