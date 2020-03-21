<template>
  <el-dialog
    width="75%"
    top="4%"
    :show-close="false"
    :close-on-click-modal="false"
    :visible="visible"
    @opened="dialogOpened"
    @closed="dialogClosed">

    <!-- 模态框标题栏与功能按钮 -->
    <el-row slot="title">
      <el-col :span="5" style="font-size: 20px;">
        <span>患者病历</span>
      </el-col>
      <el-col :span="19" style="text-align: right;">
        <el-button size="mini" type="warning" icon="el-icon-right" @click="dialogClose">返 回</el-button>
      </el-col>
    </el-row>

    <div class="clinical-history">
      <div class="patients-info">
        <span>姓 名:&nbsp;{{mrmMember.name}}</span>
        <span>性 别:&nbsp;{{mrmMember.genderName}}</span>
        <span>年 龄:&nbsp;{{mrmMember.age}}</span>
        <span>民 族:&nbsp;{{mrmMember.nationalityName}}</span>
        <span>血 型:&nbsp;{{mrmMember.bloodTypeName}}</span>
        <span>R  H:&nbsp;{{mrmMember.rhName}}</span>
        <span>婚姻状况:&nbsp;{{mrmMember.maritalName}}</span>
        <span>联系电话:&nbsp;{{mrmMember.phone}}</span>
      </div>

      <hr/>

      <div class="el-icon-date doctor-info">
        <span>{{clinicalHistory.creationDate}}</span>
        <span>{{clinicalHistory.sysDoctorName}}</span>
        <span>{{clinicalHistory.sysClinicRoomName}}</span>

        <span class="r-word">R</span>
        <span class="p-word">P</span>
      </div> <!-- end el-icon-date div1 -->

      <el-row>
        <el-col :span="13" class="left-info">
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
        </el-col> <!-- end left-info -->
        <el-col :span="11" class="right-info">
          <el-card shadow="hover" v-for="(prescription, index) in prescriptionList" :key="index" style="margin-bottom: 10px;">
            <div v-html="parsePrescription(prescription)"></div>
          </el-card>
        </el-col>
      </el-row>
      <span style="font-size: 12px;">* 滚动鼠标滑轮查看隐藏内容</span>
    </div>
    <el-pagination
      :page-size="pagination.pageSize"
      :total="pagination.total"
      :current-page="pagination.currentPage"
      :pager-count="pagination.pagerCount"
      :page-sizes="pagination.pageSizes"
      layout="prev, pager, next, total, jumper"
      @size-change="paginationSizeChange"
      @current-change="paginationCurrentChange">
    </el-pagination>

  </el-dialog>
</template>

<script>
export default {
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    mrmMember: {
      type: Object,
      required: true
    },
    dialogClose: {
      type: Function,
      required: true
    }
  },

  data () {
    return {
      sellType: this.$store.getters.sellType, // 销售类型
      goodsType: this.$store.getters.goodsType, // 商品类型
      clinicalHistory: {}, // 病例数据
      prescriptionList: [], // 处方集合
      pagination: {
        total: this.$store.getters.pagination.total, /* 总记录数 */
        pageSize: 1, /* 每页显示的行数 */
        currentPage: this.$store.getters.pagination.currentPage, /* 当前页页码 */
        pagerCount: this.$store.getters.pagination.pagerCount, /* 分页页码按钮的数量 */
        pageSizes: this.$store.getters.pagination.pageSizes, /* 选取每页显示的行数 */
        layout: this.$store.getters.pagination.layout
      }
    }
  }, // end data

  methods: {
    /**
     * 病例界面打开后执行的操作
     */
    dialogOpened () {
      // 获取病例内容
      this.loadClinicalHistory()
    },

    /**
     * 病例界面关闭后执行的操作
     */
    dialogClosed () {
      // 初始化当前页码
      this.pagination.currentPage = this.$store.getters.pagination.currentPage
      // 初始化病例数据
      this.clinicalHistory = {}
      // 初始化处方集合
      this.prescriptionList = []
    },

    /* -------------------------------------------------------------------------------------------------------------- */
    paginationSizeChange (value) {
      this.pagination.pageSize = value
      this.loadClinicalHistory()
    },

    paginationCurrentChange (value) {
      this.pagination.currentPage = value
      this.loadClinicalHistory()
    },

    loadClinicalHistory () {
      this.$loading()
      const url = '/chisAPI/clinicalHistory/getByMrmMemberId'
      let params = {mrmMemberId: this.mrmMember.id}
      params.pageNum = this.pagination.currentPage
      params.pageSize = this.pagination.pageSize

      this.$http.get(url, {params}).then((res) => {
        if (res.data.code === 200) {
          this.pagination.total = res.data.resultSet.page.total
          if (res.data.resultSet.page.list.length > 0) {
            this.clinicalHistory = res.data.resultSet.page.list[0]
          }
          // this.prescriptionList = res.data.resultSet.prescriptionList
          this.prescriptionListGroupByLsh(res.data.resultSet.prescriptionList)
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
     * 将处方按流水号分组进行返回
     * @param prescriptionList
     */
    prescriptionListGroupByLsh (prescriptionList) {
      const map = new Map()
      prescriptionList.forEach(item => {
        let list = []
        if (map.get(item.lsh)) {
          list = map.get(item.lsh)
        }
        list.push(item)
        map.set(item.lsh, list)
      })

      // 获取分组后的集合
      this.prescriptionList = []
      map.forEach(val => {
        this.prescriptionList.push(val)
      })
    },

    /**
     * 解析处方, 返回对应的处方格式
     * @param prescription
     */
    parsePrescription (prescription) {
      let detail = ''
      prescription.forEach((row, index) => {
        // 解析西药处方
        // 阿莫西林胶囊 250mg×12# sig:500mg Potid [药名是阿莫西林，剂型是胶囊，单位剂量是每粒250毫克，领取数量是12粒，用法是每次500毫克(2粒)，口服，每日3次]
        // 药品名称_剂型_基本剂量+基本剂量单位_X销售数量+销售单位_sig:_基本剂量*单次剂量+基本剂量单位_给药途径_用药频次
        if (row.entityTypeId === this.goodsType.WESTERN_DRUGS) {
          // 解析用法 JSON
          let sig = JSON.parse(row.sigJson)
          // 拼接西药处方格式 [药品名称_剂型_基本剂量+基本剂量单位_X销售数量+销售单位_sig:_基本剂量*单次剂量+基本剂量单位_给药途径_用药频次]
          let rp = row.name + '&nbsp;&nbsp;' + sig.doseTypeName + '&nbsp;&nbsp;' +
            sig.dose + sig.doseUnitsName + '×' + row.quantity + row.unitsName + '&nbsp;&nbsp;sig:' +
            sig.dose + sig.doseUnitsName + '×' + sig.onceDose + '&nbsp;&nbsp;' +
            sig.drugUsageName.split('/')[0] + sig.drugFrequencyName.split('/')[0]
          // 返回西药处方
          detail = detail + '<div style="margin-top: 5px;">' + rp + '</div>'
        }

        // 中药处方
        if (row.entityTypeId === this.goodsType.CHINESE_DRUGS) {
          let sig = JSON.parse(row.sigJson)
          let rp = row.name + '&nbsp;&nbsp;' + row.quantity + row.unitsName /* + (sig.drugsPrepareMethodName ? (' [' + sig.drugsPrepareMethodName + ']') : '') */
          // 返回中药处方
          detail = detail + '<div style="margin-top: 5px; width: 25%; float: left;">' + rp + '</div>'
          if ((prescription.length - 1) === index) {
            detail = detail + '<div style="clear: both;"></div><hr style="margin: 10px 0;"/> sig: ' + sig.sig
          }
        }
      })

      return detail
    }

  } // end methods
}
</script>

<style scoped>
  .clinical-history {
    padding: 0 20px 20px 20px;
  }
  .clinical-history hr {
    height:3px;
    border:none;
    border-top:3px double #3BB878;
  }
  .patients-info {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 10px;
  }
  .patients-info span {
    padding-right: 40px;
  }
  .doctor-info {
    margin: 20px 0;
    font-size: 16px;
    font-weight: 600;
    color: #3BB878;
  }
  .doctor-info span {
    padding-right: 15px;
  }
  .left-info, .right-info {
    height: 330px;
    overflow-y: auto;
    padding-top: 10px;
  }
  .left-info::-webkit-scrollbar{ /* 隐藏滑动条 鼠标滑轮可进行滑动 */
    display:none;
  }
  .right-info::-webkit-scrollbar{ /* 隐藏滑动条 鼠标滑轮可进行滑动 */
    display:none;
  }
  .left-info .div2 {
    clear: both;
    float: left;
    width: 80px;
    font-size: 14px;
    font-weight: 600;
    text-align: right;
    letter-spacing: 3px;
    margin-bottom: 15px;
  }
  .left-info .div3 {
    float: left;
    width: 500px;
    padding-left: 10px;
  }
  .clinical-history .r-word, .p-word {
    color: #606266;
    font-size: 30px;
    font-weight: 800;
    font-family: 华文宋体;
  }
  .clinical-history .r-word {
    position:  absolute;
    left: 54%;
    top: 20%;
  }
  .clinical-history .p-word {
    position:  absolute;
    left: 55.8%;
    top: 22%;
  }
  .right-info {
    border-top: #606266 2px solid;
    border-bottom: #606266 2px solid;
  }
</style>

<style>
  /*
  .patients-clinical-history input.el-input__inner {
    font-size: 14px;
    background-color: transparent;
    border: 0;
    outline: none;
    cursor: auto;
    border-bottom: 1px solid #aaa;
    border-radius: 1px;
  }
  */
</style>
