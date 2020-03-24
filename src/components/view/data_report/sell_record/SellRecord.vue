<template>
  <div>
    <!--功能菜单-->
    <el-card
      shadow="never"
      body-style="padding: 5px;"
      class="el-card-menus">
      <el-form :model="queryForm" ref="queryForm" inline size="mini">
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
        <el-form-item label="流水号" prop="lsh">
          <el-input v-model.trim="queryForm.lsh" placeholder="流水号" style="width: 210px;"/>
        </el-form-item>
        <el-form-item label="销售人" prop="sellerName">
          <el-input v-model.trim="queryForm.sellerName" placeholder="姓名 / 助记码"/>
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
        <el-table-column prop="entityName" label="名称" width="200" show-overflow-tooltip/>
        <el-table-column prop="specs" label="规格" width="150" show-overflow-tooltip/>
        <el-table-column prop="unitsName" label="销售单位" width="100" show-overflow-tooltip/>
        <el-table-column prop="originName" label="产地" width="100" show-overflow-tooltip/>
        <el-table-column prop="manufacturerName" label="生产厂家" width="300" show-overflow-tooltip/>
        <el-table-column prop="retailPrice" label="零售单价" width="100" show-overflow-tooltip/>
        <el-table-column prop="quantity" label="销售数量" width="100" show-overflow-tooltip/>
        <el-table-column prop="actualRetailPrice" label="实收单价" width="100" show-overflow-tooltip/>
        <el-table-column label="实收小计" width="100" show-overflow-tooltip>
          <template slot-scope="props">
            {{(props.row.actualRetailPrice * props.row.quantity).toFixed(2)}}
          </template>
        </el-table-column>
        <el-table-column prop="costPrice" label="成本价" width="100" show-overflow-tooltip/>
        <el-table-column label="成本小计(含税)" width="120" show-overflow-tooltip>
          <template slot-scope="props">
            {{(props.row.costPrice * props.row.quantity).toFixed(2)}}
          </template>
        </el-table-column>
        <el-table-column prop="ph" label="批号" width="150" show-overflow-tooltip/>
        <el-table-column prop="pch" label="批次号" width="150" show-overflow-tooltip/>
        <el-table-column prop="billingTypeName" label="计费类型" width="120" show-overflow-tooltip/>
        <el-table-column prop="goodsClassifyName" label="商品分类" width="150" show-overflow-tooltip/>
        <el-table-column prop="expiryDate" label="有效期至" width="120" show-overflow-tooltip/>
        <el-table-column prop="mrmMemberOid" label="会员编码" width="150" show-overflow-tooltip/>
        <el-table-column prop="mrmMemberName" label="会员姓名" width="100" show-overflow-tooltip/>
        <el-table-column prop="phone" label="会员电话" width="150" show-overflow-tooltip/>
        <el-table-column prop="sellerName" label="销售人" width="100" show-overflow-tooltip/>
        <el-table-column prop="operatorName" label="出库人" width="100" show-overflow-tooltip/>
        <el-table-column prop="cashierName" label="收银员" width="100" show-overflow-tooltip/>
        <el-table-column prop="sysClinicName" label="机构名称" min-width="400" show-overflow-tooltip/>
      </el-table>
      <!--
      <div class="total-div">
        <el-row>
          <el-col :span="4">含税成本:</el-col>
          <el-col :span="4">无税成本:</el-col>
          <el-col :span="4">含税销售额:</el-col>
          <el-col :span="4">无税销售额:</el-col>
          <el-col :span="4">含税毛利:</el-col>
          <el-col :span="4">无税毛利:</el-col>
        </el-row>
      </div>
      -->
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
      queryForm: {
        creationDate: null,
        lsh: null,
        sellerName: null
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
      let url = `/chisAPI/sellRecordReport/${this.action}`
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
  .total-div {
    line-height: 30px;
    font-size: 14px;
    padding-left: 5px;
    background-color: rgb(250, 250, 250);
  }
</style>
