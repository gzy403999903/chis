<template>
  <!-- append-to-body 防止遮罩层在界面上边 -->
  <el-dialog
    class="fullscreen-dialog"
    width="75%"
    top="5%"
    append-to-body
    :show-close="false"
    :close-on-click-modal="false"
    :visible="visible"
    @opened="dialogOpened"
    @closed="dialogClosed">

    <!-- 模态框标题栏与功能按钮 -->
    <el-row slot="title">
      <el-col :span="5" style="font-size: 20px;">
        <span>历史处方</span>
      </el-col>
      <el-col :span="19" style="text-align: right;">
        <el-button size="mini" type="primary" icon="el-icon-check"
                   @click="loadSelectedPrescription" :disabled="dataGrid.detailData.length === 0">载 入</el-button>
        <el-button size="mini" type="warning" icon="el-icon-right" @click="dialogClose">返 回</el-button>
      </el-col>
    </el-row>

    <!-- 查询功能 -->
    <el-card
      shadow="never"
      body-style="padding: 5px;"
      class="el-card-menus"
      style="text-align: left; padding-left: 10px;">
      <el-form :model="queryForm" ref="queryForm" inline size="mini">
        <el-form-item label="处方日期" prop="creationDate">
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
        <el-form-item label="医生姓名" prop="sysDoctorName">
          <el-input v-model.trim="queryForm.sysDoctorName" placeholder="医生姓名 / 助记码"/>
        </el-form-item>
        <el-form-item>
          <el-button size="mini" type="default" round icon="el-icon-search"  @click="loadGroupPrescriptionList">查询</el-button>
          <el-button size="mini" type="default" round icon="el-icon-refresh" @click="$refs.queryForm.resetFields()">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表 -->
    <el-row>
      <el-col :span="14" style="border-right: #3BB878 1px dashed;">
        <el-table
          height="60vh"
          :data="dataGrid.groupData"
          stripe
          highlight-current-row
          size="mini">
          <el-table-column fixed="left" type="index" width="50"/>
          <el-table-column fixed="left" label="操作" align="center" width="80">
            <template slot-scope="scope">
              <el-button size="mini" @click="loadDetailPrescriptionList(scope.row.lsh)">查 看</el-button>
            </template>
          </el-table-column>
          <el-table-column prop="creationDate" label="处方日期" width="160" show-overflow-tooltip sortable/>
          <el-table-column prop="lsh" label="流水号" min-width="220" show-overflow-tooltip/>
          <el-table-column prop="sysDoctorName" label="医生姓名" width="100" show-overflow-tooltip sortable/>
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
      </el-col>

      <el-col :span="10">
        <el-table
          height="60vh"
          :data="dataGrid.detailData"
          stripe
          size="mini">
          <!--<el-table-column prop="oid" label="编码" min-width="120" show-overflow-tooltip/>-->
          <el-table-column prop="name" label="名称" min-width="200" show-overflow-tooltip sortable/>
          <el-table-column prop="quantity" label="数量" min-width="80" show-overflow-tooltip/>
          <el-table-column prop="unitsName" label="单位" min-width="80" show-overflow-tooltip/>
        </el-table>
      </el-col>
    </el-row>

  </el-dialog>
</template>

<script>
export default {
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    mrmMemberId: {
      type: Number,
      required: true
    },
    action: {
      type: String,
      required: true
    },
    sysSellTypeId: {
      type: Number,
      required: true
    },
    entityTypeId: {
      type: Number,
      required: true
    },
    dialogClose: {
      type: Function,
      required: true
    },
    loadFromTemplate: {
      type: Function,
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
        creationDate: [], // 历史处方创建日期
        sysDoctorName: null // 医生姓名
      },
      dataGrid: {
        groupData: [],
        detailData: []
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
     * 界面打开后执行的操作
     */
    dialogOpened () {
    },

    /**
     * 界面关闭后执行的操作
     */
    dialogClosed () {
      this.$refs.queryForm.resetFields()
      this.dataGrid.groupData = []
      this.dataGrid.detailData = []
    },

    /* -------------------------------------------------------------------------------------------------------------- */

    paginationSizeChange (value) {
      this.pagination.pageSize = value
      this.dataGridLoadData()
    },

    paginationCurrentChange (value) {
      this.pagination.currentPage = value
      this.dataGridLoadData()
    },

    /**
     * 载入处方汇总
     */
    loadGroupPrescriptionList () {
      this.$loading()
      let url = '/chisAPI/sellPrescription/getGroupListByCriteriaForTemplate'
      let params = this.queryForm
      params.pageNum = this.pagination.currentPage
      params.pageSize = this.pagination.pageSize
      params.sysSellTypeId = this.sysSellTypeId // 销售类型
      params.entityTypeId = this.entityTypeId // 实体类型
      params.mrmMemberId = this.mrmMemberId // 会员ID

      this.$http.get(url, {params}).then((res) => {
        if (res.data.code === 200) {
          this.pagination.total = res.data.resultSet.page.total
          this.dataGrid.groupData = res.data.resultSet.page.list
        } else {
          this.$message.error(res.data.msg)
        }
        this.$loading().close()
      })
    },

    /**
     * 载入处方明细
     * @param lsh
     */
    loadDetailPrescriptionList (lsh) {
      this.$loading()
      let url = '/chisAPI/sellPrescription/getByLshForTemplate'
      let params = {lsh}

      this.$http.get(url, {params}).then((res) => {
        if (res.data.code === 200) {
          this.dataGrid.detailData = res.data.resultSet.list
        } else {
          this.$message.error(res.data.msg)
        }
        this.$loading().close()
      })
    },

    /**
     * 载入选中的处方
     */
    loadSelectedPrescription () {
      // 关闭界面
      this.dialogClose()
      // 载入处方
      this.loadFromTemplate(this.dataGrid.detailData)
    }

  } // end methods
}
</script>

<style scoped>
</style>
