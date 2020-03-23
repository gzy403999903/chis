<template>
  <div>
    <!--功能菜单-->
    <el-card
      shadow="never"
      body-style="padding: 5px;"
      class="el-card-menus">
      <el-form :model="queryForm" ref="queryForm" inline size="mini">
        <el-form-item label="机构名称" prop="sysClinicName" v-if="action === 'all'">
          <el-input v-model.trim="queryForm.sysClinicName" placeholder="机构名称 / 助记码"/>
        </el-form-item>
        <el-form-item label="效期天数小于" prop="filterDays">
          <el-input-number v-model="queryForm.filterDays" :controls="false" :max="366" :min="0" :precision="0"
                           style="width: 100px;"/> &nbsp;天
        </el-form-item>
        <el-form-item>
          <el-button type="primary" round icon="el-icon-search"  @click="dataGridLoadData">查询</el-button>
          <el-button type="default" round icon="el-icon-refresh" @click="$refs.queryForm.resetFields()">重置</el-button>
          <el-button type="default" round icon="el-icon-download" @click="downloadExcel" :disabled="!dataGrid.data.length">导出Excel</el-button>
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
        <el-table-column fixed="left" label="距离过期 / 天" width="110" show-overflow-tooltip>
          <template slot-scope="props">
            <span v-show="props.row.days > 90">{{props.row.days}}</span>
            <span v-show="props.row.days < 90" style="color: #F56C6C;">{{props.row.days}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="iymInventoryTypeName" label="所在库房" width="100" show-overflow-tooltip/>
        <el-table-column prop="gsmGoodsTypeName" label="商品类型" width="110" show-overflow-tooltip/>
        <el-table-column prop="gsmGoodsOid" label="商品编码" width="100" show-overflow-tooltip/>
        <el-table-column prop="gsmGoodsName" label="商品名称" width="150" show-overflow-tooltip/>
        <el-table-column prop="gsmGoodsSpecs" label="整装规格" width="180" show-overflow-tooltip/>
        <el-table-column prop="goodsUnitsName" label="单位" width="70" show-overflow-tooltip/>
        <el-table-column prop="retailPrice" label="零售价" width="100" show-overflow-tooltip/>
        <el-table-column prop="quantity" label="库存数量" width="100" show-overflow-tooltip/>
        <el-table-column prop="ph" label="批号" width="150" show-overflow-tooltip/>
        <el-table-column prop="costPrice" label="批次进价" width="100" show-overflow-tooltip/>
        <el-table-column prop="expiryDate" label="有效期至" width="100" show-overflow-tooltip/>
        <el-table-column prop="originName" label="产地" width="120" show-overflow-tooltip/>
        <el-table-column prop="manufacturerName" label="生产厂家" width="300" show-overflow-tooltip/>
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
  }, // end props

  data () {
    return {
      queryForm: {
        sysClinicName: null,
        filterDays: 120
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
          ? '/chisAPI/inventoryReport/getExpiryDateListByCriteria'
          : '/chisAPI/inventoryReport/getClinicExpiryDateListByCriteria'
      )
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

    /**
     * 下载 excel
     */
    downloadExcel () {
      this.$loading()
      let params = this.queryForm
      let url = (
        this.action === 'all'
          ? '/chisAPI/inventoryReport/downloadExpiryDateExcel'
          : '/chisAPI/inventoryReport/downloadClinicExpiryDateExcel'
      )

      this.$http({method: 'GET', url, params, responseType: 'blob'}).then(res => {
        const blob = new Blob([res.data], {type: 'application/vnd.ms-excel;charset=utf-8'}) // 创建 Blob 对象
        const url = window.URL.createObjectURL(blob) // 获取下载地址
        const aLink = document.createElement('a') // 创建下载元素(a标签)
        aLink.style.display = 'none' // 隐藏当前该下载元素
        aLink.href = url // 设置该下载标签的下载地址
        let fileName = '近效期库存表_' + new Date().toLocaleDateString() + '.xlsx' // 下载文件名
        aLink.setAttribute('download', fileName) // 设置下载属性
        document.body.appendChild(aLink) // 将标签添加至 body
        aLink.click() // 点击进行下载
        document.body.removeChild(aLink) // 下载完成移除该下载元素
        window.URL.revokeObjectURL(url) // 释放掉 Blob 对象
        this.$loading().close() // 关闭 loading
      })
    }

  } // end methods
}
</script>

<style scoped>
</style>
