<template>
  <div>
    <!--功能菜单-->
    <el-card
      shadow="never"
      body-style="padding: 5px;"
      class="el-card-menus">
      <el-form :model="queryForm" ref="queryForm" inline size="mini">
        <el-form-item label="机构名称" prop="sysClinicName" v-if="action === 'all'">
          <el-input v-model.trim="queryForm.sysClinicName" placeholder="机构名称 / 助记码" style="width: 140px;"/>
        </el-form-item>
        <el-form-item label="库房名称" prop="iymInventoryTypeId" v-if="action === 'clinic'">
          <el-select
            style="width: 120px;"
            ref="iymInventoryTypeId"
            v-model.trim="queryForm.iymInventoryTypeId"
            filterable
            placeholder="请选择">
            <el-option label="全部" :value="null"/>
            <el-option label="药品库" :value="inventoryType.WESTERN_DRUGS_INVENTORY"/>
            <el-option label="药材库" :value="inventoryType.CHINESE_DRUGS_INVENTORY"/>
            <el-option label="物资库" :value="inventoryType.HYGIENIC_MATERIAL_INVENTORY"/>
            <el-option label="退货库" :value="inventoryType.SUBTRACT_INVENTORY"/>
          </el-select>
        </el-form-item>
        <el-form-item label="商品编码" prop="gsmGoodsOid">
          <el-input v-model.trim="queryForm.gsmGoodsOid" placeholder="商品编码" style="width: 140px;"/>
        </el-form-item>
        <el-form-item label="商品名称" prop="gsmGoodsName">
          <el-input v-model.trim="queryForm.gsmGoodsName" placeholder="商品名称 / 助记码" style="width: 140px;"/>
        </el-form-item>
        <el-form-item label="批号" prop="ph">
          <el-input v-model.trim="queryForm.ph" style="width: 140px;"/>
        </el-form-item>
        <el-form-item label="显示0库存" prop="showZero">
          <el-switch v-model="queryForm.showZero" active-color="#13ce66" inactive-color="#ff4949"/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" round icon="el-icon-search"  @click="dataGridLoadData">查询</el-button>
          <el-button type="default" round icon="el-icon-refresh" @click="$refs.queryForm.resetFields()">重置</el-button>
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
        border
        highlight-current-row
        size="mini">
        <el-table-column fixed="left" type="index" width="50"/>
        <el-table-column prop="iymInventoryTypeName" label="仓库名称" width="80" show-overflow-tooltip/>
        <el-table-column prop="gsmGoodsTypeName" label="商品类型" width="110" show-overflow-tooltip/>
        <el-table-column prop="gsmGoodsOid" label="商品编码" width="100" show-overflow-tooltip/>
        <el-table-column prop="gsmGoodsName" label="商品名称" width="150" show-overflow-tooltip/>
        <el-table-column prop="gsmGoodsSpecs" label="整装规格" width="150" show-overflow-tooltip/>
        <el-table-column prop="goodsUnitsName" label="单位" width="70" show-overflow-tooltip/>
        <el-table-column prop="retailPrice" label="零售价" width="100" show-overflow-tooltip/>
        <el-table-column prop="quantity" label="库存数量" width="100" show-overflow-tooltip/>
        <el-table-column prop="ph" label="批号" width="150" show-overflow-tooltip/>
        <!--<el-table-column prop="costPrice" label="批次进价" width="100" show-overflow-tooltip/>-->
        <el-table-column prop="expiryDate" label="有效期至" width="100" show-overflow-tooltip/>
        <el-table-column prop="originName" label="产地" width="120" show-overflow-tooltip/>
        <el-table-column prop="manufacturerName" label="生产厂家" width="300" show-overflow-tooltip/>
        <el-table-column prop="sysClinicName" label="机构名称" min-width="400" show-overflow-tooltip/>
        <el-table-column/>
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
      inventoryType: this.$store.getters.inventoryType, // 仓库类型
      queryForm: {
        sysClinicName: null,
        iymInventoryTypeId: null,
        gsmGoodsOid: null,
        gsmGoodsName: null,
        ph: null,
        showZero: false
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
      let url = ''
      if (this.action === 'all') {
        url = '/chisAPI/inventory/getPhListByCriteria'
      } else {
        url = '/chisAPI/inventory/getClinicPhListByCriteria'
      }
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
    }

  } // end methods
}
</script>

<style scoped>
</style>
