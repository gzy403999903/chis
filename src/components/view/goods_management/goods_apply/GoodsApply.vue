<template>
  <div>
    <!--功能菜单-->
    <el-card
      shadow="never"
      body-style="padding: 5px;"
      class="el-card-menus">
      <el-form :model="queryForm" ref="queryForm" :inline="true" size="mini">
        <el-form-item label="申请日期" prop="creationDate">
          <el-date-picker
            style="width: 280px;"
            v-model="queryForm.creationDate"
            type="daterange"
            align="right"
            unlink-panels
            value-format="yyyy-MM-dd"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptions"/>
        </el-form-item>
        <el-form-item label="商品名称" prop="name">
          <el-input v-model.trim="queryForm.name" placeholder="商品名称 / 助记码" style="width: 150px;"/>
        </el-form-item>
        <el-form-item label="审批状态" prop="approveState">
          <el-select v-model="queryForm.approveState" placeholder="请选择" style="width: 100px;">
            <el-option label="全部" :value="null"/>
            <el-option label="待审批" :value="approveState.APPROVED"/>
            <el-option label="待审核" :value="approveState.PENDING"/>
            <el-option label="待定价" :value="approveState.PRICING"/>
            <el-option label="驳回" :value="approveState.UNAPPROVED"/>
            <el-option label="通过" :value="approveState.LAST_APPROVED"/>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" round icon="el-icon-search"  @click="dataGridLoadData">查询</el-button>
          <el-button type="default" round icon="el-icon-refresh" @click="$refs.queryForm.resetFields()">重置</el-button>
          <el-dropdown  @command="val => {dialogOpen(val,{})}">
            <el-button size="mini" round icon="el-icon-plus">
              新品申请<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item :command="belongGoodsType.WESTERN_DRUGS">西药 / 中成药</el-dropdown-item>
              <el-dropdown-item :command="belongGoodsType.CHINESE_DRUGS">中药</el-dropdown-item>
              <el-dropdown-item :command="belongGoodsType.HYGIENIC_MATERIAL">卫生材料</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
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
        <el-table-column fixed="left" label="操作" align="center" width="200">
          <template slot-scope="scope">
            <el-button size="mini" type="success" plain icon="el-icon-s-check" @click="approveDialogOpen(scope.row)">审批流程</el-button>
            <el-button size="mini" icon="el-icon-edit" @click="dialogOpen(scope.row.gsmGoodsTypeId, scope.row)">编 辑</el-button>
          </template>
        </el-table-column>
        <el-table-column fixed="left" prop="approveState" label="审批状态" width="80" :formatter="dataGridFormatterApproveSate" show-overflow-tooltip/>
        <el-table-column prop="gsmGoodsTypeName" label="商品分类" width="100" show-overflow-tooltip/>
        <el-table-column prop="oid" label="商品编码" width="100" show-overflow-tooltip/>
        <el-table-column prop="name" label="商品名" width="200" show-overflow-tooltip/>
        <el-table-column prop="creatorName" label="发起人" width="80" show-overflow-tooltip/>
        <el-table-column prop="creationDate" label="发起日期" width="110" show-overflow-tooltip/>
        <el-table-column prop="pricerName" label="定价人" width="80" show-overflow-tooltip/>
        <el-table-column prop="pricingDate" label="定价日期" width="110" show-overflow-tooltip/>
        <el-table-column prop="approverName" label="审核人" width="80" show-overflow-tooltip/>
        <el-table-column prop="approveDate" label="审核日期" width="110" show-overflow-tooltip/>
        <el-table-column prop="lastApproverName" label="审批人" width="80" show-overflow-tooltip/>
        <el-table-column prop="lastApproveDate" label="审批日期" min-width="110" show-overflow-tooltip/>
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

    <!-- 新品申请 -->
    <GoodsApplyEdit :title="title" :goodsType="goodsType" :action="action" :row="dataGrid.row" :visible="dialog.visible"
                    :dialog-close="dialogClose" :data-grid-load-data="dataGridLoadData"/>

    <!-- 新品审批流程 -->
    <GoodsApprove :row="dataGrid.row" :visible="dialog.approveVisible"
                  :dialogClose="approveDialogClose" :dataGridLoadData="dataGridLoadData"/>

  </div>
</template>

<script>
import GoodsApplyEdit from '../goods/GoodsEdit'
import GoodsApprove from './GoodsApprove'
import jwtDecode from 'jwt-decode'
export default {
  components: {
    GoodsApplyEdit,
    GoodsApprove
  },

  data () {
    return {
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        }
      },
      payload: jwtDecode(this.$store.getters.token),
      approveState: this.$store.getters.approveState,
      goodsType: 0, // 商品类型
      belongGoodsType: this.$store.getters.goodsType, // 属于哪个商品类型
      queryForm: {
        name: '',
        creationDate: this.$store.getters.queryDate,
        approveState: null,
        useCreatorId: false
      },
      title: '',
      action: '',
      dataGrid: {
        data: [],
        row: {}
      },
      pagination: {
        total: this.$store.getters.pagination.total, /* 总记录数 */
        pageSize: this.$store.getters.pagination.pageSize, /* 每页显示的行数 */
        currentPage: this.$store.getters.pagination.currentPage, /* 当前页页码 */
        pagerCount: this.$store.getters.pagination.pagerCount, /* 分页页码按钮的数量 */
        pageSizes: this.$store.getters.pagination.pageSizes, /* 选取每页显示的行数 */
        layout: this.$store.getters.pagination.layout
      },
      dialog: {
        visible: false,
        approveVisible: false
      }
    }
  },

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
    dataGridFormatterApproveSate (row, column, cellValue) {
      switch (cellValue) {
        case this.$store.getters.approveState.APPROVED: return '待审批'
        case this.$store.getters.approveState.PRICING: return '待定价'
        case this.$store.getters.approveState.PENDING: return '待审核'
        case this.$store.getters.approveState.UNAPPROVED: return '驳回'
        case this.$store.getters.approveState.LAST_APPROVED: return '通过'
        default: return '未知状态'
      }
    },

    dataGridLoadData () {
      this.$loading()
      const url = `/chisAPI/goodsApply/getByCriteria`
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
    },

    /* -------------------------------------------------------------------------------------------------------------- */
    /**
     * 打开商品申请界面
     * @param command
     * @param row
     */
    dialogOpen (command, row) {
      // 判断是哪个商品类型的操作
      switch (command) {
        case this.belongGoodsType.WESTERN_DRUGS:
          this.title = '西药 / 中成药'
          this.goodsType = this.belongGoodsType.WESTERN_DRUGS
          this.action = 'goodsApply/westernDrugs'
          break
        case this.belongGoodsType.CHINESE_DRUGS:
          this.title = '中药'
          this.goodsType = this.belongGoodsType.CHINESE_DRUGS
          this.action = 'goodsApply/chineseDrugs'
          break
        case this.belongGoodsType.HYGIENIC_MATERIAL:
          this.title = '卫生材料'
          this.goodsType = this.belongGoodsType.HYGIENIC_MATERIAL
          this.action = 'goodsApply/hygienicMaterial'
          break
      }

      // 如果可以获取到商品类型ID 说明是一个编辑操作
      if (row.gsmGoodsTypeId) {
        // 判断是否操作人和创建人一致
        if (row.creatorId !== this.payload.userId) {
          this.$message.error('只能由发起人进行编辑')
          return
        }
        // 判断是否允许编辑
        if (row.approveState !== this.approveState.UNAPPROVED) {
          this.$message.error('当前状态不允许编辑')
          return
        }
        // 更新 action 为编辑
        this.action = 'goodsApply'
      }

      this.dataGrid.row = row
      this.dialog.visible = true
    },

    /**
     * 关闭商品申请界面
     */
    dialogClose () {
      this.dialog.visible = false
    },

    /**
     * 开启审批界面
     * @param row
     */
    approveDialogOpen (row) {
      this.dataGrid.row = row
      this.dialog.approveVisible = true
    },

    /**
     * 关闭审批界面
     */
    approveDialogClose () {
      this.dialog.approveVisible = false
    }

  } // end methods

}
</script>

<style scoped>
</style>
