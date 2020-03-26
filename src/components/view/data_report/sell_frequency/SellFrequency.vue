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
        <el-form-item label="机构名称" prop="sysClinicName" v-if="action === 'all'">
          <el-input v-model.trim="queryForm.sysClinicName" placeholder="机构名称 / 助记码"/>
        </el-form-item>
        <el-form-item label="商品类型" prop="gsmGoodsTypeId">
          <el-radio-group v-model="queryForm.gsmGoodsTypeId">
            <el-radio :label="''" border>全部</el-radio>
            <el-radio :label="goodsType.WESTERN_DRUGS" border>西药 / 中成药</el-radio>
            <el-radio :label="goodsType.CHINESE_DRUGS" border>中药</el-radio>
            <el-radio :label="goodsType.HYGIENIC_MATERIAL" border>卫生材料</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="商品编码" prop="gsmGoodsOid">
          <el-input v-model.trim="queryForm.gsmGoodsOid" placeholder="商品编码"/>
        </el-form-item>
        <el-form-item label="商品名称" prop="gsmGoodsName">
          <el-input v-model.trim="queryForm.gsmGoodsName" placeholder="商品名称 / 助记码"/>
        </el-form-item>
        <el-form-item label="动销天数" prop="days">
          <el-input-number v-model="queryForm.days" :controls="false" :max="366" :min="1" :precision="0"
                           style="width: 100px;"/>
        </el-form-item>
        <el-form-item label="库存数量" prop="quantity">
          <el-input-number v-model="queryForm.quantity" :controls="false" :max="10000" :min="1" :precision="0"
                           style="width: 100px;"/> &nbsp;[大于等于]
        </el-form-item>
        <el-form-item label="销售频次" prop="sellFrequency">
          <el-input-number v-model="queryForm.sellFrequency" :controls="false" :max="100" :min="0" :precision="0"
                           style="width: 100px;"/> &nbsp;[小于等于]
        </el-form-item>
        <el-form-item label="销售数量" prop="sellQuantity">
          <el-input-number v-model="queryForm.sellQuantity" :controls="false" :max="10000" :min="0" :precision="0"
                           style="width: 100px;"/> &nbsp;[小于等于]
        </el-form-item>
        <el-form-item label="最小库龄" prop="minAge">
          <el-input-number v-model="queryForm.minAge" :controls="false" :max="366" :min="0" :precision="0"
                           style="width: 100px;"/> &nbsp;[大于等于]
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
        <el-table-column prop="gsmGoodsTypeName" label="商品类型" width="120" show-overflow-tooltip/>
        <el-table-column prop="gsmGoodsOid" label="商品编码" width="100" show-overflow-tooltip/>
        <el-table-column prop="gsmGoodsName" label="商品名称" width="200" show-overflow-tooltip/>
        <el-table-column prop="gsmGoodsSpecs" label="规格" width="150" show-overflow-tooltip/>
        <el-table-column prop="goodsUnitsName" label="单位" width="100" show-overflow-tooltip/>
        <el-table-column prop="quantity" label="库存数量" width="100" show-overflow-tooltip/>
        <el-table-column prop="minAge" label="最小库龄 / 天" width="110" show-overflow-tooltip/>
        <el-table-column prop="sellQuantity" :label="queryForm.days + '天内销售数量'" width="140" show-overflow-tooltip/>
        <el-table-column prop="sellFrequency" label="销售频次" width="100" show-overflow-tooltip/>
        <el-table-column prop="averageQuantity" label="平均销售数量" width="110" show-overflow-tooltip/>
        <el-table-column prop="maxQuantity" label="最大一次销售数量" width="140" show-overflow-tooltip/>
        <el-table-column prop="minQuantity" label="最小一次销售数量" width="140" show-overflow-tooltip/>
        <el-table-column prop="lastCreationDate" label="最后一次销售时间" width="160" show-overflow-tooltip/>
        <el-table-column prop="originName" label="产地" width="100" show-overflow-tooltip/>
        <el-table-column prop="manufacturerName" label="生产厂家" width="260" show-overflow-tooltip/>
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
      goodsType: this.$store.getters.goodsType, // 商品类型
      dialog: {
        visible: false
      },
      queryForm: {
        sysClinicName: null,
        gsmGoodsTypeId: '',
        gsmGoodsOid: '',
        gsmGoodsName: '',
        days: 30,
        quantity: 1,
        sellFrequency: undefined,
        sellQuantity: undefined,
        minAge: undefined
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
     * 载入数据
     */
    dataGridLoadData () {
      this.$loading()
      let url = (
        this.action === 'all'
          ? '/chisAPI/inventoryReport/getSellFrequencyListByCriteria'
          : '/chisAPI/inventoryReport/getClinicSellFrequencyListByCriteria'
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
