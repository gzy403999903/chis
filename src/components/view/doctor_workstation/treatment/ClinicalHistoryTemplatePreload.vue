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
        <span>{{action === 'record' ? '历史病历' : '病历模板'}}</span>
      </el-col>
      <el-col :span="19" style="text-align: right;">
        <el-button size="mini" type="primary" icon="el-icon-check"
                   @click="loadSelectedRow(clinicalHistory)" :disabled="!clinicalHistory.id">载 入</el-button>
        <el-button size="mini" type="warning" icon="el-icon-right" @click="dialogClose">返 回</el-button>
      </el-col>
    </el-row>

    <el-card
      shadow="never"
      body-style="padding: 5px;"
      class="el-card-menus"
      style="text-align: left; padding-left: 10px;">
      <el-form :model="queryForm" ref="queryForm" inline size="mini">
        <el-form-item label="诊断类型" prop="dwtDiagnoseTypeId">
          <el-select v-model="queryForm.dwtDiagnoseTypeId" placeholder="请选择" style="width: 150px;">
            <el-option label="全部" :value="null"/>
            <el-option label="西医" :value="diagnoseType.WESTERN_DIAGNOSE"/>
            <el-option label="中医" :value="diagnoseType.CHINESE_DIAGNOSE"/>
          </el-select>
        </el-form-item>
        <el-form-item label="病历日期" prop="creationDate" v-show="action === 'record'">
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
        <el-form-item label="病历模板名称" prop="name" v-show="action === 'template'">
          <el-input v-model.trim="queryForm.name" placeholder="病历模板名称 / 助记码"/>
        </el-form-item>
        <el-form-item>
          <el-button size="mini" type="default" round icon="el-icon-search"  @click="loadClinicalHistory">查询</el-button>
          <el-button size="mini" type="default" round icon="el-icon-refresh" @click="$refs.queryForm.resetFields()">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表 -->
    <el-row>
      <el-col :span="12" style="border-right: #3BB878 1px dashed;">
        <el-table
          height="60vh"
          :data="dataGrid.data"
          stripe
          highlight-current-row
          size="mini">
          <el-table-column fixed="left" type="index" width="50"/>
          <el-table-column fixed="left" label="操作" align="center" width="80">
            <template slot-scope="scope">
              <el-button size="mini" @click="showSelectedRow(scope.row)">查 看</el-button>
            </template>
          </el-table-column>
          <el-table-column prop="dwtDiagnoseTypeName" label="病历类型" width="100" show-overflow-tooltip/>
          <el-table-column prop="name" label="病例名称" min-width="160" show-overflow-tooltip v-if="action === 'template'"/>
          <el-table-column prop="creationDate" label="创建日期" min-width="160" show-overflow-tooltip v-if="action === 'record'"/>
          <el-table-column prop="sysDoctorName" label="创建人" width="100" show-overflow-tooltip/>
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
      </el-col> <!-- end left -->
      <el-col :span="12">
        <div class="right-info">
          <div>
            <div class="div2">主 诉:</div>
            <div class="div3">{{clinicalHistory.chiefComplaint}}</div>
          </div>
          <div>
            <div class="div2">现病史:</div>
            <div class="div3">{{clinicalHistory.presentIllness}}</div>
          </div>
          <div>
            <div class="div2">查 体:</div>
            <div class="div3">{{clinicalHistory.physicalExamination}}</div>
          </div>
          <div>
            <div class="div2">既往史:</div>
            <div class="div3">{{clinicalHistory.pastHistory}}</div>
          </div>
          <div>
            <div class="div2">过敏史:</div>
            <div class="div3">{{clinicalHistory.allergenHistory}}</div>
          </div>
          <div>
            <div class="div2">辅助检查:</div>
            <div class="div3">{{clinicalHistory.auxiliaryExamination}}</div>
          </div>
          <div>
            <div class="div2">辩 证:</div>
            <div class="div3">{{clinicalHistory.dialectical}}</div>
          </div>
          <div>
            <div class="div2">诊 断:</div>
            <div class="div3" style="color: #DD4A68;">{{formatterDiagnoseJson(clinicalHistory.diagnoseJson)}}</div>
          </div>
        </div> <!-- end right-info -->
        <div class="div4"> {{clinicalHistory.notes}} </div>
      </el-col> <!-- end right-->
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
      diagnoseType: this.$store.getters.diagnoseType, // 诊断类型
      clinicalHistory: {}, // 病历内容
      queryForm: {
        creationDate: [], // 历史病例创建日期
        dwtDiagnoseTypeId: null, // 病例诊断类型
        shareState: true, // 病例模板共享状态
        name: null // 病例名称
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
     * 界面打开后执行的操作
     */
    dialogOpened () {
    },

    /**
     * 界面关闭后执行的操作
     */
    dialogClosed () {
      this.$refs.queryForm.resetFields()
      this.clinicalHistory = {}
      this.dataGrid.data = []
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
     * 载入病例
     */
    loadClinicalHistory () {
      this.$loading()
      // clinicalHistoryTemplate
      let url = ''
      if (this.action === 'record') {
        url = `/chisAPI/clinicalHistory/getByCriteria`
      } else {
        url = `/chisAPI/clinicalHistoryTemplate/getByCriteria`
      }
      let params = this.queryForm
      params.pageNum = this.pagination.currentPage
      params.pageSize = this.pagination.pageSize
      params.mrmMemberId = this.mrmMemberId // 会员ID

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
     * 将诊断 JSON 解析成字符串
     */
    formatterDiagnoseJson (diagnoseJson) {
      if (diagnoseJson) {
        let str = ''
        JSON.parse(diagnoseJson).forEach(item => {
          str = str + item.name + '、'
        })
        return str
      }
    },

    /**
     * 显示选中行的内容
     * @param row
     */
    showSelectedRow (row) {
      this.clinicalHistory = row
    },

    /**
     * 载入选中行到病例界面
     * @param row
     */
    loadSelectedRow (clinicalHistory) {
      // 清空ID
      clinicalHistory.id = ''
      // 载入操作
      this.loadFromTemplate(clinicalHistory)
      // 关闭界面
      this.dialogClose()
    }

  } // end methods
}
</script>

<style scoped>
  .right-info {
    margin: 5px 10px;
    height: 350px;
    overflow-y: auto;
    padding: 10px 0;
    border-top: #606266 2px solid; /* #3BB878  #606266*/
    border-bottom: #606266 2px solid;
  }
  .right-info::-webkit-scrollbar{ /* 隐藏滑动条 鼠标滑轮可进行滑动 */
    display:none;
  }
  .right-info .div2 {
    clear: both;
    float: left;
    width: 80px;
    font-size: 14px;
    font-weight: 600;
    text-align: right;
    letter-spacing: 3px;
    margin-bottom: 20px;
  }
  .right-info .div3 {
    float: left;
    width: 80%;
    padding-left: 10px;
  }
  .div4 {
    margin: 10px;
    height: 100px;
    padding: 10px;
    overflow-y: auto;
  }
  .div4::-webkit-scrollbar{ /* 隐藏滑动条 鼠标滑轮可进行滑动 */
    display:none;
  }
</style>
