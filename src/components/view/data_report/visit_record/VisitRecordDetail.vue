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
        <span>患者回访</span>
      </el-col>
      <el-col :span="19" style="text-align: right;">
        <el-button size="mini" type="warning" icon="el-icon-right" @click="dialogClose">返 回</el-button>
      </el-col>
    </el-row>

    <div class="clinical-history">
      <div class="patients-info">
        <span>姓 名:&nbsp;{{row.mrmMemberName}}</span>
        <span>性 别:&nbsp;{{row.genderName}}</span>
        <span>年 龄:&nbsp;{{row.age}}</span>
        <span>民 族:&nbsp;{{row.nationalityName}}</span>
        <span>血 型:&nbsp;{{row.bloodTypeName}}</span>
        <span>R  H:&nbsp;{{row.rhName}}</span>
        <span>婚姻状况:&nbsp;{{row.maritalName}}</span>
        <span>联系电话:&nbsp;{{row.phone}}</span>
      </div>

      <el-row>
        <el-col :span="13" class="left-info">
          <div>
            <div class="div2">主 诉:</div>
            <div class="div3">{{row.chiefComplaint}}</div>
          </div>
          <div>
            <div class="div2">现病史:</div>
            <div class="div3">{{row.presentIllness}}</div>
          </div>
          <div>
            <div class="div2">查 体:</div>
            <div class="div3">{{row.physicalExamination}}</div>
          </div>
          <div>
            <div class="div2">既往史:</div>
            <div class="div3">{{row.pastHistory}}</div>
          </div>
          <div>
            <div class="div2">过敏史:</div>
            <div class="div3">{{row.allergenHistory}}</div>
          </div>
          <div>
            <div class="div2">辅助检查:</div>
            <div class="div3">{{row.auxiliaryExamination}}</div>
          </div>
          <div>
            <div class="div2">辩 证:</div>
            <div class="div3">{{row.dialectical}}</div>
          </div>
          <div>
            <div class="div2">诊 断:</div>
            <div class="div3" style="color: #DD4A68;">{{formatterDiagnoseJson(row.diagnoseJson)}}</div>
          </div>
        </el-col> <!-- end left-info -->
        <el-col :span="11" class="right-info">
          <el-card shadow="hover" v-for="(prescription, index) in prescriptionList" :key="index" style="margin-bottom: 10px;">
            <div v-for="(detail, index) in prescription" :key="index" v-html="parsePrescription(prescription, detail)"></div>
          </el-card>
        </el-col>
      </el-row>

      <div class="visit-content">
        回访内容
        <el-input type="textarea" v-model.trim="visitContent" :rows="3" resize="none" maxlength="200" show-word-limit
                  placeholder="" :readonly="true"/>
      </div>
      <span style="font-size: 12px;">* 滚动鼠标滑轮查看隐藏内容, 在提交时选择下一次预约时间将自动创建下一次回访</span>
    </div>

  </el-dialog>
</template>

<script>
export default {
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    row: {
      type: Object,
      required: true
    },
    dialogClose: {
      type: Function,
      required: true
    },
    dataGridLoadData: {
      type: Function,
      required: true
    }
  },

  data () {
    return {
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() < Date.now()
        }
      },
      sellType: this.$store.getters.sellType, // 销售类型
      goodsType: this.$store.getters.goodsType, // 商品类型
      prescriptionList: [], // 处方集合
      visitContent: '' // 回访内容
    }
  },

  methods: {
    /**
     * 界面打开后执行的操作
     */
    dialogOpened () {
      if (this.row.dwtClinicalHistoryId) {
        this.loadPrescription(this.row.dwtClinicalHistoryId)
      }
      if (this.row.visitContent) {
        this.visitContent = this.row.visitContent
      }
    },

    /**
     * 界面关闭后执行的操作
     */
    dialogClosed () {
      this.prescriptionList = []
      this.visitContent = ''
    },

    /**
     * 载入处方
     */
    loadPrescription (dwtClinicalHistoryId) {
      this.$loading()
      const url = '/chisAPI/sellPrescription/getByClinicalHistoryId'
      let params = {dwtClinicalHistoryId}

      this.$http.get(url, {params}).then((res) => {
        if (res.data.code === 200) {
          if (res.data.resultSet.list.length > 0) {
            this.prescriptionListGroupByLsh(res.data.resultSet.list)
          }
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
     * @param detail
     */
    parsePrescription (prescription, detail) {
      // 解析项目类型处方
      if (detail.sysSellTypeId === this.sellType.ITEM) {
        return detail.name + '&nbsp;&nbsp;' + detail.quantity + detail.unitsName
      } else {
        // 解析西药处方
        // 阿莫西林胶囊 250mg×12# sig:500mg Potid [药名是阿莫西林，剂型是胶囊，单位剂量是每粒250毫克，领取数量是12粒，用法是每次500毫克(2粒)，口服，每日3次]
        // 药品名称_剂型_基本剂量+基本剂量单位_X销售数量+销售单位_sig:_基本剂量*单次剂量+基本剂量单位_给药途径_用药频次
        if (detail.entityTypeId === this.goodsType.WESTERN_DRUGS) {
          let sig = JSON.parse(detail.sigJson)
          return detail.name + '&nbsp;&nbsp;' + sig.doseTypeName + '&nbsp;&nbsp;' +
            sig.dose + sig.doseUnitsName + '×' + detail.quantity + detail.unitsName +
            '&nbsp;&nbsp;sig:' + sig.dose + sig.doseUnitsName + '×' + sig.onceDose +
            '&nbsp;&nbsp;' + sig.drugUsageName.split('/')[0] + sig.drugFrequencyName.split('/')[0]
        }
        // 解析中药处方
        if (detail.entityTypeId === this.goodsType.CHINESE_DRUGS) {
          let lastDetail = prescription[prescription.length - 1]
          if (lastDetail.id === detail.id) {
            let sig = JSON.parse(detail.sigJson)
            return detail.name + '&nbsp;&nbsp;' + detail.quantity + detail.unitsName +
              '<hr style="margin: 10px 0;"/> sig:' + sig.sig
          } else {
            return detail.name + '&nbsp;&nbsp;' + detail.quantity + detail.unitsName
          }
        }
      }
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
  .left-info, .right-info {
    height: 300px;
    overflow-y: auto;
    padding-top: 10px;
    border-top: #3BB878 2px solid;
    border-bottom: #3BB878 2px solid;
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
    font-size: 40px;
    font-weight: 400;
    font-family: 华文宋体;
  }
  .clinical-history .r-word {
    position:  absolute;
    left: 54%;
    top: 0;
  }
  .clinical-history .p-word {
    position:  absolute;
    left: 56%;
    top: 5%;
  }
  .right-info {
    border-left: #3BB878 1px dashed;
    /*border-top: #606266 2px solid;
    border-bottom: #606266 2px solid;*/
  }
  .visit-content {
    font-size: 14px;
    font-weight: 600;
    padding-top: 5px;
  }
</style>
