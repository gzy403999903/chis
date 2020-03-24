<template>
  <div>
    <!--功能菜单-->
    <el-card
      shadow="never"
      body-style="padding: 5px;"
      class="el-card-menus">
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
        <el-form-item label="流水号" prop="lsh">
          <el-input v-model.trim="queryForm.lsh" placeholder="流水号"/>
        </el-form-item>
        <el-form-item label="处方类型" prop="entityTypeId">
          <el-select v-model="queryForm.entityTypeId" style="width: 140px;">
            <el-option label="全部" :value="null"/>
            <el-option label="西药处方" :value="goodsType.WESTERN_DRUGS"/>
            <el-option label="中药处方" :value="goodsType.CHINESE_DRUGS"/>
          </el-select>
        </el-form-item>
        <el-form-item label="医生" prop="sysDoctorName">
          <el-input v-model.trim="queryForm.sysDoctorName" placeholder="姓名 / 助记码" style="width: 140px;"/>
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
        <el-table-column fixed="left" label="操作" align="center" width="230">
          <template slot-scope="scope">
            <el-button size="mini" icon="el-icon-printer" @click="printPrescription(scope.row)">打印处方</el-button>
            <el-button size="mini" icon="el-icon-printer" :disabled="true">打印配药单</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="creationDate" label="处方日期" width="160" show-overflow-tooltip/>
        <el-table-column prop="lsh" label="流水号" width="220" show-overflow-tooltip/>
        <el-table-column prop="prescriptionType" label="处方类型" width="100" show-overflow-tooltip>
          <template slot-scope="props">
            {{props.row.entityTypeId === goodsType.WESTERN_DRUGS ? '西药处方' : '中药处方'}}
          </template>
        </el-table-column>
        <el-table-column prop="mrmMemberOid" label="会员编码" width="150" show-overflow-tooltip/>
        <el-table-column prop="mrmMemberName" label="会员姓名" width="100" show-overflow-tooltip/>
        <el-table-column prop="phone" label="联系电话" width="150" show-overflow-tooltip/>
        <el-table-column prop="sysDoctorName" label="医生姓名" min-width="100" show-overflow-tooltip/>
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

    <!-- 打印西药处方 -->
    <DrugsPrescription :prescriptionList="dataGrid.prescriptionList"/>
  </div>
</template>

<script>
import PubSub from 'pubsub-js'
import DrugsPrescription from '../../print_page/DrugsPrescription'
export default {
  components: {
    DrugsPrescription
  },

  data () {
    return {
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        }
      },
      goodsType: this.$store.getters.goodsType,
      queryForm: {
        creationDate: null,
        lsh: null,
        entityTypeId: null,
        sysDoctorName: null
      },
      dataGrid: {
        data: [],
        prescriptionList: []
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
      let url = '/chisAPI/sellPrescription/getClinicGroupListByCriteriaForPerform'
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

    /**
     * 根据流水号获取机构处方明细 [同步执行]
     * @param lsh
     */
    async loadPrescriptionListByLsh (lsh) {
      this.$loading()
      let url = '/chisAPI/sellPrescription/getClinicListByLsh'
      let params = {lsh}

      await this.$http.get(url, {params}).then((res) => {
        if (res.data.code === 200) {
          this.dataGrid.prescriptionList = res.data.resultSet.list
        }
        // this.$loading().close() // 在 printPrescription 方法中关闭
      })
    },

    /**
     * 打印处方 [同步执行]
     * @param row
     */
    async printPrescription (row) {
      this.dataGrid.prescriptionList = []
      await this.loadPrescriptionListByLsh(row.lsh)

      if (this.dataGrid.prescriptionList.length === 0) {
        this.$message.error('获取处方明细失败')
        return
      }

      // this.$loading() // 在 loadPrescriptionListByLsh 方法中开始
      let url = '/chisAPI/sellPrescription/printPrescription'
      this.$http.get(url).then((res) => {
        if (res.data.code === 200) {
          PubSub.publish('printWesternDrugsPrescription')
        }
        this.$loading().close()
      })
    }

  } // end methods
}
</script>

<style scoped>
</style>
