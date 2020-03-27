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
        <span>更正处方</span>
      </el-col>
      <el-col :span="19" style="text-align: right;">
        <el-button size="mini" type="primary" icon="el-icon-edit-outline" @click="loadSelectedPrescription"
                   :disabled="dataGrid.detailData.length === 0">更 正</el-button>
        <el-button size="mini" type="warning" icon="el-icon-right" @click="dialogClose">返 回</el-button>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="14" style="border-right: #3BB878 1px dashed;">
        <el-table
          height="70vh"
          :data="dataGrid.groupData"
          @row-dblclick="loadPrescriptionDetail"
          :stripe="true"
          highlight-current-row
          size="mini">
          <el-table-column fixed="left" type="index" width="50"/>
          <el-table-column fixed="left" label="操作" align="center" width="140">
            <template slot-scope="scope">
              <el-button size="mini" type="danger" @click="deleteSelectedPrescription(scope.row)">撤 销</el-button>
              <el-button size="mini" @click="loadPrescriptionDetail(scope.row)">查 看</el-button>
            </template>
          </el-table-column>
          <el-table-column prop="creationDate" label="处方日期" width="160" show-overflow-tooltip sortable/>
          <el-table-column prop="lsh" label="流水号" min-width="220" show-overflow-tooltip/>
          <el-table-column prop="sysDoctorName" label="医生姓名" width="100" show-overflow-tooltip sortable/>
        </el-table>
      </el-col>

      <el-col :span="10">
        <el-table
          height="70vh"
          :data="dataGrid.detailData"
          :stripe="true"
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
    loadFromCache: {
      type: Function,
      required: true
    },
    loadCountPrescription: {
      type: Function,
      required: true
    }
  },

  data () {
    return {
      dataGrid: {
        groupData: [],
        detailData: []
      }
    }
  }, // end data

  methods: {
    /**
     * 界面打开后执行的操作
     */
    dialogOpened () {
      // 从缓存载入未进行结算的处方
      this.loadPrescriptionGroup()
    },

    /**
     * 界面关闭后执行的操作
     */
    dialogClosed () {
      this.dataGrid.groupData = []
      this.dataGrid.detailData = []
    },

    /**
     * 载入处方汇总
     */
    loadPrescriptionGroup () {
      if (!this.mrmMemberId) {
        this.$message.error('未获取会员信息')
        return false
      }

      this.$loading()
      const url = '/chisAPI/sellPrescription/getClinicDoctorGroupListByCriteriaFromCache'
      const params = {
        mrmMemberId: this.mrmMemberId,
        sysSellTypeId: this.sysSellTypeId,
        entityTypeId: this.entityTypeId
      }
      this.$http.get(url, {params}).then(res => {
        if (res.data.code === 200) {
          this.dataGrid.groupData = res.data.resultSet.list
        }
        this.$loading().close()
      })
    },

    /**
     * 载入处方明细
     * @param row
     */
    loadPrescriptionDetail (row) {
      this.$loading()
      const url = '/chisAPI/sellPrescription/getByLshFromCache'
      const params = {
        lsh: row.lsh
      }
      this.$http.get(url, {params}).then(res => {
        if (res.data.code === 200) {
          this.dataGrid.detailData = res.data.resultSet.list
        }
        this.$loading().close()
      })
    },

    /**
     * 载入选中的处方明细
     */
    loadSelectedPrescription () {
      this.loadFromCache(this.dataGrid.detailData)
      this.dialogClose()
    },

    /**
     * 删除选中的处方
     * @param row
     */
    deleteSelectedPrescription (row) {
      this.$confirm('确认删除吗? 该操作不可恢复！', '提示', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', showClose: false
      }).then(() => {
        this.$loading()
        const url = '/chisAPI/sellPrescription/deleteByLshFromCache'
        let method = 'DELETE'
        let params = {
          lsh: row.lsh
        }
        this.$http({method, url, params}).then((res) => {
          if (res.data.code === 200) {
            this.$message.success(res.data.msg)
            this.loadPrescriptionGroup()
            this.dataGrid.detailData = []
            this.loadCountPrescription()
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
