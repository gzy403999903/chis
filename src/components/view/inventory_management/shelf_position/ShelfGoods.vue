<template>
  <div>
    <!--功能菜单-->
    <el-card
      shadow="never"
      body-style="padding: 5px;"
      class="el-card-menus">
      <el-form :model="queryForm" ref="queryForm" :inline="true" size="mini">
        <el-form-item label="商品类型" prop="gsmGoodsTypeId">
          <el-select v-model="queryForm.gsmGoodsTypeId" placeholder="请选择" style="width: 120px;">
            <el-option label="全部" :value="null"/>
            <el-option label="西药 / 中成药" :value="goodsType.WESTERN_DRUGS"/>
            <el-option label="中药" :value="goodsType.CHINESE_DRUGS"/>
            <el-option label="卫生材料" :value="goodsType.HYGIENIC_MATERIAL"/>
          </el-select>
        </el-form-item>
        <el-form-item label="商品编码" prop="gsmGoodsOid">
          <el-input v-model.trim="queryForm.gsmGoodsOid" placeholder="商品编码"
                    style="width: 120px;"/>
        </el-form-item>
        <el-form-item label="商品名称" prop="gsmGoodsName">
          <el-input v-model.trim="queryForm.gsmGoodsName" placeholder="商品名称 / 助记码"
                    style="width: 130px;"/>
        </el-form-item>
        <el-form-item label="货位名称" prop="iymShelfPositionName">
          <el-input v-model.trim="queryForm.iymShelfPositionName" placeholder="货位名称 / 助记码"
                    style="width: 130px;"/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" round icon="el-icon-search"  @click="dataGridLoadData">查询</el-button>
          <el-button type="default" round icon="el-icon-refresh" @click="$refs.queryForm.resetFields()">重置</el-button>
          <el-button type="success" round icon="el-icon-check" @click="submitData">保存货位</el-button>
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
        highlight-current-row
        @row-dblclick="editRow"
        size="mini">
        <el-table-column fixed="left" type="index" width="50"/>
        <el-table-column prop="gsmGoodsOid" label="商品编码" width="100" show-overflow-tooltip/>
        <el-table-column prop="gsmGoodsName" label="名称" width="200" show-overflow-tooltip/>
        <el-table-column prop="specs" label="规格" width="130" show-overflow-tooltip/>
        <el-table-column prop="goodsUnitsName" label="单位" width="80" show-overflow-tooltip/>
        <el-table-column prop="originName" label="产地" width="100" show-overflow-tooltip/>
        <el-table-column prop="manufacturerName" label="生产厂家" width="250" show-overflow-tooltip/>
        <el-table-column prop="goodsClassifyName" label="商品分类" min-width="200" show-overflow-tooltip/>
        <el-table-column fixed="right" label="货位" width="180" show-overflow-tooltip>
          <template slot-scope="props">
            <el-select
              v-show="props.row.editable"
              :ref="'iymShelfPositionId' + props.$index"
              v-model.trim="props.row.iymShelfPositionId"
              @change="shelfPositionListChange"
              filterable
              default-first-option
              size="small"
              placeholder="请选择">
              <el-option v-for="item in clinicShelfPositionList" :key="item.id" :value="item.id" :label="item.name"/>
            </el-select>
            <span v-show="!props.row.editable">{{props.row.iymShelfPositionName}}</span>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="库存上限" width="100" show-overflow-tooltip>
          <template slot-scope="props">
            <el-input-number v-model="props.row.maxQuantity" :controls="false" :max="30000" :min="0" :precision="0"
                             size="small" :ref="'maxQuantity' + props.$index" v-show="props.row.editable"/>
            <span v-show="!props.row.editable">{{props.row.maxQuantity}}</span>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="库存下限" width="100" show-overflow-tooltip>
          <template slot-scope="props">
            <el-input-number v-model="props.row.minQuantity" :controls="false" :max="30000" :min="0" :precision="0"
                             size="small" :ref="'minQuantity' + props.$index" v-show="props.row.editable"/>
            <span v-show="!props.row.editable">{{props.row.minQuantity}}</span>
          </template>
        </el-table-column>
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
  data () {
    return {
      goodsType: this.$store.getters.goodsType, // 商品类型
      queryForm: {
        gsmGoodsTypeId: null,
        gsmGoodsOid: null,
        gsmGoodsName: null,
        iymShelfPositionName: null
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

  computed: {
    clinicShelfPositionList: function () {
      return this.$store.getters.clinicShelfPositionList
    }
  }, // end computed

  mounted () {
    this.$store.dispatch('queryClinicShelfPositionList')
  }, // end mounted

  methods: {
    /* -------------------------------------------------------------------------------------------------------------- */
    paginationSizeChange (value) {
      if (this.hasEditRow()) {
        this.$confirm('当前页面有未保存的货位信息, 确认放弃吗?', '提示', {
          confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', showClose: false
        }).then(() => {
          this.pagination.pageSize = value
          this.dataGridLoadData()
        }).catch(() => {})
      } else {
        this.pagination.pageSize = value
        this.dataGridLoadData()
      }
    },

    paginationCurrentChange (value) {
      if (this.hasEditRow()) {
        this.$confirm('当前页面有未保存的货位信息, 确认放弃吗?', '提示', {
          confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', showClose: false
        }).then(() => {
          this.pagination.currentPage = value
          this.dataGridLoadData()
        }).catch(() => {})
      } else {
        this.pagination.currentPage = value
        this.dataGridLoadData()
      }
    },

    /* -------------------------------------------------------------------------------------------------------------- */
    /**
     * 数据载入
     */
    dataGridLoadData () {
      this.$loading()
      const url = `/chisAPI/shelfGoods/getClinicListByCriteria`
      let params = this.queryForm
      params.pageNum = this.pagination.currentPage
      params.pageSize = this.pagination.pageSize

      this.$http.get(url, {params}).then((res) => {
        if (res.data.code === 200) {
          this.pagination.total = res.data.resultSet.page.total
          // 添加编辑属性 在赋值给 data, 否则无法开启编辑功能
          res.data.resultSet.page.list.forEach(item => {
            item.editable = false
            item.iymShelfPositionIdRecord = item.iymShelfPositionId
            item.iymShelfPositionNameRecord = item.iymShelfPositionName
            item.maxQuantityRecord = item.maxQuantity
            item.minQuantityRecord = item.minQuantity
          })

          this.dataGrid.data = res.data.resultSet.page.list
        }
        this.$loading().close()
      })
    },

    /* -------------------------------------------------------------------------------------------------------------- */
    /**
     * 检查是否有编辑的行
     */
    hasEditRow () {
      return this.dataGrid.data.some(item => item.editable)
    },

    /**
     * 验证一行
     */
    validateRow (row) {
      return (
        row.iymShelfPositionId &&
        parseFloat(row.maxQuantity).toString() !== 'NaN' &&
        parseFloat(row.minQuantity).toString() !== 'NaN'
      )
    },

    /**
     * 重置一行
     */
    resetRow (row) {
      row.iymShelfPositionId = row.iymShelfPositionIdRecord
      row.iymShelfPositionName = row.iymShelfPositionNameRecord
      row.maxQuantity = row.maxQuantityRecord
      row.minQuantity = row.minQuantityRecord
    },

    /**
     * 编辑一行
      * @param row
     * @param column
     * @param event
     */
    editRow (row, column, event) {
      // 如果目标行在编辑状态则不继续执行
      if (row.editable) {
        return
      }

      // 获取当前行
      this.dataGrid.currentRow = this.dataGrid.data.find(item => {
        return item.editable === true
      })

      // 如果当前行为空 则设置当前行并开启编辑
      if (!this.dataGrid.currentRow) {
        this.dataGrid.currentRow = row
        row.editable = true
        return
      }

      // 如果当前行未完成编辑则询问是否放弃
      if (!this.validateRow(this.dataGrid.currentRow)) {
        this.$confirm('当前行尚未完成编辑, 确认要放弃编辑吗?', '提示', {
          confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', showClose: false
        }).then(() => {
          this.resetRow(this.dataGrid.currentRow) // 重置当前行
          this.dataGrid.currentRow.editable = false // 设置当前行不可编辑
          this.dataGrid.currentRow = row // 设置目标行为当前行
          this.dataGrid.currentRow.editable = true // 开启编辑
        }).catch(() => {})
      } else {
        this.dataGrid.currentRow.editable = false // 设置当前行不可编辑
        this.dataGrid.currentRow = row // 设置目标行为当前行
        this.dataGrid.currentRow.editable = true // 开启编辑
      }
    },

    /**
     * 当货位发生改变执行的内容
     * @param id
     */
    shelfPositionListChange (id) {
      let shelfPosition = this.clinicShelfPositionList.find(item => {
        return item.id === id
      })
      this.dataGrid.currentRow.iymShelfPositionName = shelfPosition.name
    },

    /**
     * 获取提交数据
     */
    getSubmitData () {
      let shelfGoodsList = []
      this.dataGrid.data.forEach(row => {
        // 如果当前行有效
        if (this.validateRow(row)) {
          // 只要当前行任意一个参数与记录不相符就进行提交
          if (row.iymShelfPositionId !== row.iymShelfPositionIdRecord ||
              row.maxQuantity !== row.maxQuantityRecord ||
              row.minQuantity !== row.minQuantityRecord) {
            let shelfGoods = {}
            shelfGoods.id = row.id
            shelfGoods.iymShelfPositionId = row.iymShelfPositionId
            shelfGoods.gsmGoodsId = row.gsmGoodsId
            shelfGoods.maxQuantity = row.maxQuantity
            shelfGoods.minQuantity = row.minQuantity

            shelfGoodsList.push(shelfGoods)
          }
        }
      })

      return shelfGoodsList
    },

    /**
     * 保存数据
     */
    submitData () {
      if (this.getSubmitData().length === 0) {
        return false
      }

      // 如果当前行无效 则进行重置 并停止编辑
      if (!this.validateRow(this.dataGrid.currentRow)) {
        this.$message.error('当前行未完成编辑, 不能进行提交')
        return
      } else {
        this.dataGrid.currentRow.editable = false // 设置当前行不可编辑
      }

      this.$confirm('确认提交吗?', '提示', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', showClose: false
      }).then(() => {
        // 提交数据
        this.$loading()
        const url = '/chisAPI/shelfGoods/saveOrUpdateList'
        let method = 'POST'
        let data = {
          shelfGoodsListJson: JSON.stringify(this.getSubmitData())
        }

        this.$http({method, url, data}).then((res) => {
          if (res.data.code === 200) {
            this.$message.success(res.data.msg)
            this.dataGridLoadData()
          } else {
            this.$loading().close()
          }
        })
      }).catch(() => {})
    }

  } // end methods
}
</script>

<style scoped>
</style>
