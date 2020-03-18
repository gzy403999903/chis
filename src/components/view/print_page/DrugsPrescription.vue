<template>
  <div id="print-body" style="display: none;">
    <!--
    <div style=" width: 190mm; height: 148mm; border: black 1px solid">
      <div style="margin-top: 10px; text-align: center; font-size: 20px; font-weight: 600;">
        <div>{{payload.clinicName}}</div>
        <div>处方笺</div>
      </div>

      <div style="margin-top: 15px; display: flex; flex-direction: row;">
        <div style="width: 75mm;">处方号: {{prescriptionList.length > 0 ? prescriptionList[0].lsh : ''}}</div>
        <div style="width: 60mm;">处方日期: {{prescriptionList.length > 0 ? prescriptionList[0].creationDate : ''}}</div>
        <div>科别: {{prescriptionList.length > 0 ? prescriptionList[0].sysClinicRoomName : ''}}</div>
      </div>

      <div style="margin-top: 5px; display: flex; flex-direction: row;">
        <div style="width: 35mm;">姓名: {{prescriptionList.length > 0 ? prescriptionList[0].mrmMemberName : ''}}</div>
        <div style="width: 40mm;">性别: {{prescriptionList.length > 0 ? (prescriptionList[0].genderName.length > 2 ? '未知' : prescriptionList[0].genderName) : ''}}</div>
        <div style="width: 25mm;">年龄: {{prescriptionList.length > 0 ? prescriptionList[0].age : ''}}</div>
        <div>电话: {{prescriptionList.length > 0 ? prescriptionList[0].phone : ''}}</div>
      </div>

      <div style="margin-top: 5px; display: flex; flex-direction: row;">
        <div style="width: 95mm;">临床诊断: {{getDiagnoseStr()}}</div>
        <div>住址: {{prescriptionList.length > 0 ? prescriptionList[0].address : ''}}</div>
      </div>
    </div>

    <div style="width: 91.5%; margin: 20px;">
      <div style="margin-top: 10px; border: black 2px solid; height: 85mm; padding-left: 20px; position: relative;">
        <div style="font-size: 28px; padding: 10px 0;">
          <div style="float: left;">R</div>
          <div style="float: left; position: relative; top: 10px;">P</div>
          <div>:</div>
        </div>
        <div v-html="parsePrescription()"></div>
      </div>
      <div style="border-left: black 2px solid; border-bottom: black 2px solid; border-right: black 2px solid; line-height: 30px;">
        <div style="float: left; width: 15%; padding-left: 5px;">剂数: {{prescriptionList.length > 0 ? prescriptionList[0].foldQuantity : 1}}</div>
        <div>用法: {{getChineseDrugsSig()}}</div>
      </div>
      <div style="clear: both;"></div>
      <div style="border-left: black 2px solid; border-bottom: black 2px solid; border-right: black 2px solid; line-height: 30px;">
        <div style="float: left; width: 15%; padding-left: 5px;">医师: {{prescriptionList.length > 0 ? prescriptionList[0].sysDoctorName : ''}}</div>
        <div style="float: left; width: 15%; border-right: black 2px solid;">识别码: {{prescriptionList.length > 0 ? prescriptionList[0].sysDoctorId : ''}}</div>
        <div style="float: left; width: 15%; padding-left: 20px;">审核:</div>
        <div style="float: left; width: 15%;">调配:</div>
        <div style="float: left; width: 15%;">复核:</div>
        <div>发药:</div>
      </div>
      <div style="clear: both;"></div>
    </div>
    -->
  </div>
</template>

<script>
import {getLodop} from '../../../common/LodopFuncs'
import PubSub from 'pubsub-js'
import jwtDecode from 'jwt-decode'
export default {
  props: {
    prescriptionList: {
      type: Array,
      required: true
    }
  },

  data () {
    return {
      payload: jwtDecode(this.$store.getters.token),
      goodsType: this.$store.getters.goodsType // 商品类型
    }
  },

  mounted () {
    PubSub.subscribe('printWesternDrugsPrescription', (msg) => {
      this.printPage()
    })
  }, // end computed

  destroyed () {
    // 当页面销毁时取消订阅
    PubSub.unsubscribe('printWesternDrugsPrescription')
  }, // end destroyed

  methods: {
    /**
     * 打印页面
     */
    printPage () {
      let LODOP = getLodop()
      LODOP.PRINT_INIT('处方笺')
      LODOP.ADD_PRINT_HTM(0, '6mm', '210mm', '148mm', document.getElementById('print-body').innerHTML) // ADD_PRINT_HTM(上边距(不写单位默认为px) 左边距 打印区域宽度 打印区域高度 打印内容)
      // LODOP.PRINT()
      // LODOP.PRINTA()
      LODOP.PREVIEW()
    },

    /**
     * 获取诊断
     */
    getDiagnoseStr () {
      if (this.prescriptionList.length === 0) {
        return ''
      }
      let diagnoseList = JSON.parse(this.prescriptionList[0].diagnoseJson)
      return diagnoseList.map(item => item.name).toString()
    },

    /**
     * 解析处方, 返回对应的处方格式
     */
    parsePrescription () {
      let detail = ``

      for (let i = 0; i < this.prescriptionList.length; i++) {
        let row = this.prescriptionList[i]
        // 西药处方
        if (row.entityTypeId === this.goodsType.WESTERN_DRUGS) {
          // 解析用法 JSON
          let sig = JSON.parse(row.sigJson)
          // 拼接西药处方格式 [药品名称_剂型_基本剂量+基本剂量单位_X销售数量+销售单位_sig:_基本剂量*单次剂量+基本剂量单位_给药途径_用药频次]
          let rp = row.name + '&nbsp;&nbsp;' + sig.doseTypeName + '&nbsp;&nbsp;' +
            sig.dose + sig.doseUnitsName + '×' + row.quantity + row.unitsName + '&nbsp;&nbsp;sig:' +
            sig.dose + sig.doseUnitsName + '×' + sig.onceDose + '&nbsp;&nbsp;' +
            sig.drugUsageName.split('/')[0] + sig.drugFrequencyName.split('/')[0]
          // 拼接返回西药处方
          detail = detail + '<div style="margin-left: 20px; margin-top: 10px;">' + rp + '</div>'
        }

        // 中药处方
        if (row.entityTypeId === this.goodsType.CHINESE_DRUGS) {
          let sig = JSON.parse(row.sigJson)
          let rp = row.name + '&nbsp;&nbsp;' + row.quantity + row.unitsName + (sig.drugsPrepareMethodName ? (' [' + sig.drugsPrepareMethodName + ']') : '')
          // 拼接返回中药处方
          detail = detail + '<div style="margin-top: 10px; width: 25%; float: left;">' + rp + '</div>'
        }
      }

      return detail
    },

    /**
     * 获取中药处方用法
     * @returns {*}
     */
    getChineseDrugsSig () {
      if (this.prescriptionList.length === 0) {
        return ''
      }
      let sigData = JSON.parse(this.prescriptionList[0].sigJson)
      return sigData.sig
    }
  } // end methods
}
</script>

<style scoped>
</style>
