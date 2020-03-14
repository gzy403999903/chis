<template>
  <div>
    <!--功能菜单-->
    <el-card
      shadow="never"
      body-style="padding: 5px;"
      class="el-card-menus">
      <el-form :model="queryForm" ref="queryForm" inline size="mini">
        <el-form-item label="盘点类型" prop="checkType">
          <el-select
            style="width: 120px;"
            v-model.trim="queryForm.checkType"
            @change="downloadable = false"
            placeholder="请选择">
            <el-option label="实盘" value="current"/>
            <el-option label="动盘" value="changed"/>
          </el-select>
        </el-form-item>

        <el-form-item label="盘点方式" prop="checkWay">
          <el-select
            style="width: 120px;"
            v-model.trim="queryForm.checkWay"
            @change="downloadable = false"
            placeholder="请选择">
            <el-option label="按商品" value="goods"/>
            <el-option label="按批号" value="ph"/>
          </el-select>
        </el-form-item>

        <el-form-item label="商品分类" prop="checkGoodsType">
          <el-select
            style="width: 120px;"
            v-model.trim="queryForm.gsmGoodsTypeId"
            @change="downloadable = false"
            placeholder="请选择">
            <el-option label="全部" :value="null"/>
            <el-option label="西药 / 中成药" :value="goodsType.WESTERN_DRUGS"/>
            <el-option label="中药" :value="goodsType.CHINESE_DRUGS"/>
            <el-option label="卫生材料" :value="goodsType.HYGIENIC_MATERIAL"/>
          </el-select>
        </el-form-item>

        <el-form-item label="日期范围" prop="checkDate">
          <el-date-picker
            :disabled="queryForm.checkType === 'current'"
            style="width: 350px;"
            v-model="queryForm.checkDate"
            @change="downloadable = false"
            type="datetimerange"
            align="right"
            unlink-panels
            value-format="yyyy-MM-dd HH:mm:ss"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptions"/>
        </el-form-item>

        <el-form-item>
          <el-button type="default" round icon="el-icon-document" @click="dataGridLoadData">生成盘点表</el-button>
          <el-button type="default" round icon="el-icon-download"
                     @click="downloadExcelAuthc" :disabled="!downloadable">导出Excel</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表 stockTake -->
    <el-card
      shadow="never"
      body-style="padding: 0;">
      <el-table
        :height="$store.getters.dataGridHeight"
        :data="dataGrid.data"
        stripe
        highlight-current-row
        size="mini">
        <el-table-column fixed="left" type="index" width="50"/>
        <el-table-column prop="gsmGoodsOid" label="商品编码" width="100" show-overflow-tooltip/>
        <el-table-column prop="gsmGoodsName" label="名称" width="200" show-overflow-tooltip/>
        <el-table-column prop="gsmGoodsSpecs" label="规格" width="130" show-overflow-tooltip/>
        <el-table-column prop="goodsUnitsName" label="单位(整)" width="80" show-overflow-tooltip/>
        <el-table-column prop="splitUnitsName" label="单位(拆)" width="80" show-overflow-tooltip/>
        <el-table-column prop="originName" label="产地" width="100" show-overflow-tooltip/>
        <el-table-column prop="manufacturerName" label="生产厂家" min-width="250" show-overflow-tooltip/>
        <el-table-column prop="goodsClassifyName" label="商品分类" width="200" show-overflow-tooltip/>
        <el-table-column prop="sysSecondClassifyName" label="二级分类" width="150" show-overflow-tooltip/>
        <el-table-column prop="iymShelfPositionName" label="货位"  width="120" show-overflow-tooltip/>
        <el-table-column prop="ph" label="批号"  width="150" show-overflow-tooltip/>
        <el-table-column prop="expiryDate" label="有效期至"  width="120" show-overflow-tooltip/>
        <el-table-column fixed="right" prop="inventoryIntactQuantity" label="账面数量(整)" width="100" show-overflow-tooltip/>
        <el-table-column fixed="right" prop="inventorySplitQuantity" label="账面数量(拆)" width="100" show-overflow-tooltip/>
        <el-table-column fixed="right" prop="totalCostAmount" label="含税成本总额" width="120" show-overflow-tooltip/>
        <el-table-column prop="addQuantity" label="+采购入库" width="100" show-overflow-tooltip/>
        <el-table-column prop="subtractQuantity" label="-采购退货出库" width="120" show-overflow-tooltip/>
        <el-table-column prop="sellIntactQuantity" label="-销售出库(整)" width="110" show-overflow-tooltip/>
        <el-table-column prop="returnedIntactQuantity" label="+销售退货入库(整)" width="140" show-overflow-tooltip/>
        <el-table-column prop="sellSplitQuantity" label="-销售出库(拆)" width="110" show-overflow-tooltip/>
        <el-table-column prop="returnedSplitQuantity" label="+销售退货入库(拆)" width="140" show-overflow-tooltip/>
        <el-table-column prop="usedIntactQuantity" label="-领用出库(整)" width="110" show-overflow-tooltip/>
        <el-table-column prop="usedSplitQuantity" label="-领用出库(拆)" width="110" show-overflow-tooltip/>
        <el-table-column prop="lossIntactQuantity" label="-报损出库(整)" width="110" show-overflow-tooltip/>
        <el-table-column prop="lossSplitQuantity" label="-报损出库(拆)" width="110" show-overflow-tooltip/>
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
import jwtDecode from 'jwt-decode'
export default {
  data () {
    return {
      goodsType: this.$store.getters.goodsType, // 商品类型
      payload: jwtDecode(this.$store.getters.token),
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        }
      },
      downloadable: false,
      queryForm: {
        checkType: 'current',
        checkWay: 'goods',
        gsmGoodsTypeId: null,
        checkDate: []
      },
      dataGrid: {
        data: [],
        currentRow: {}
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
    /**
     * 数据载入
     */
    dataGridLoadData () {
      let url = ''
      if (this.queryForm.checkType === 'changed') {
        if (this.queryForm.checkDate.length === 0) {
          this.$message.error('动盘必须选择日期范围')
          return false
        }
        url = `/chisAPI/inventoryCheckReport/getClinicByCriteriaForChanged`
      } else {
        url = `/chisAPI/inventoryCheckReport/getClinicByCriteriaForCurrent`
      }

      this.$loading()
      let params = this.queryForm
      params.pageNum = this.pagination.currentPage
      params.pageSize = this.pagination.pageSize

      this.$http.get(url, {params}).then((res) => {
        if (res.data.code === 200) {
          this.pagination.total = res.data.resultSet.page.total
          this.dataGrid.data = res.data.resultSet.page.list
          this.downloadable = true // 设置可下载
        } else {
          this.$message.error(res.data.msg)
        }
        this.$loading().close()
      })
    },

    /**
     * 获取下载盘点表权限
     */
    downloadExcelAuthc () {
      this.$loading()
      let url = `/chisAPI/inventoryCheckReport/downloadExcelAuthc`

      this.$http.get(url).then((res) => {
        if (res.data.code === 200) {
          this.downloadExcel()
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
      let fileName = ''
      if (this.queryForm.checkType === 'changed') {
        if (this.queryForm.checkDate.length === 0) {
          this.$message.error('动盘必须选择日期范围')
          return false
        }
        fileName = this.payload.clinicName + '_动盘盘点表_' + new Date().toLocaleDateString() + '.xlsx' // 下载文件名
      } else {
        fileName = this.payload.clinicName + '_实盘盘点表_' + new Date().toLocaleDateString() + '.xlsx' // 下载文件名
      }

      this.$loading()
      let params = this.queryForm
      let url = `/chisAPI/inventoryCheckReport/downloadExcel`

      this.$http({method: 'GET', url, params, responseType: 'blob'}).then(res => {
        const blob = new Blob([res.data], {type: 'application/vnd.ms-excel;charset=utf-8'}) // 创建 Blob 对象
        const url = window.URL.createObjectURL(blob) // 获取下载地址
        const aLink = document.createElement('a') // 创建下载元素(a标签)
        aLink.style.display = 'none' // 隐藏当前该下载元素
        aLink.href = url // 设置该下载标签的下载地址
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
