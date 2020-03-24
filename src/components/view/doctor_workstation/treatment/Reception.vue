<template>
  <div>
    <el-dialog
      class="fullscreen-dialog"
      fullscreen
      :show-close="false"
      :close-on-click-modal="false"
      :visible="visible"
      @opened="dialogOpened"
      @closed="dialogClosed">

      <!-- 模态框标题栏与功能按钮 -->
      <el-row slot="title">
        <el-col :span="5" style="font-size: 20px;">
          <span>医嘱开立</span>
        </el-col>
        <el-col :span="19" style="text-align: right;">
          <el-button size="mini" type="warning" icon="el-icon-s-promotion" @click="dialogCloseConfirm">返 回</el-button>
        </el-col>
      </el-row>

      <!-- 左侧患者信息卡 -->
      <div class="patients" :style="`height: ${$store.getters.dialogDataGridHeight}px`">
        <div class="patients-img">
          <img src="../../../../assets/images/girl.png" alt="Member" v-if="this.mrmMember.genderName === '女'">
          <img src="../../../../assets/images/boy.png" alt="Member" v-else>
        </div>
        <div class="patients-info">
          <p class="el-icon-edit-outline" style="color: #DD4A68;">
            {{this.dwtClinicalHistoryId ? '病历号: ' + this.dwtClinicalHistoryId : '病历未填写'}}
          </p>
          <p>姓名: {{mrmMember.name}}</p>
          <p>性别: {{mrmMember.genderName}}</p>
          <p>年龄: {{mrmMember.age}}</p>
          <p>出生日期: {{mrmMember.birth}}</p>
          <p>联系电话: {{mrmMember.phone}}</p>
        </div>
        <hr/>
        <div class="patients-info">
          <p>过敏史: <b>{{mrmMember.hasAllergy}}</b></p>
          <p>暴露史: <b>{{mrmMember.hasExposure}}</b></p>
          <p>既往史: <b>{{mrmMember.hasPrevious}}</b></p>
          <p>家族史: <b>{{mrmMember.hasFamily}}</b></p>
          <p>遗传病: <b>{{mrmMember.hasGeneticIllness}}</b></p>
          <p>残疾: <b style="padding-left: 28px;">{{mrmMember.hasDisability}}</b></p>
        </div>
        <hr/>
        <div class="patients-btn">
          <el-button size="mini" @click="healthArchiveDialogOpen">健康档案</el-button>
          <el-button size="mini" @click="clinicalHistoryRecordDialogOpen">历史病历</el-button>
        </div>
        <div class="patients-btn">
          <el-button size="mini" @click="appointmentVisitDialogOpen" style="width: 85%;">预约回访</el-button>
        </div>
      </div>

      <!-- 右侧选项卡 -->
      <div class="right-tabs">
        <el-tabs v-model="activeName" :before-leave="tabsChange">
          <el-tab-pane label="填写病例" name="clinicalHistory">
            <ClinicalHistory :mrmMemberId="mrmMemberId" :setDwtClinicalHistoryId="setDwtClinicalHistoryId"/>
          </el-tab-pane>
          <el-tab-pane label="西药处方" name="westernDrugsPrescription" :disabled="!Number(dwtClinicalHistoryId)">
            <WesternDrugsPrescription :mrmMemberId="mrmMemberId" :dwtClinicalHistoryId="dwtClinicalHistoryId"/>
          </el-tab-pane>
          <el-tab-pane label="中药处方" name="chineseDrugsPrescription" :disabled="!Number(dwtClinicalHistoryId)">
            <ChineseDrugsPrescription :mrmMemberId="mrmMemberId" :dwtClinicalHistoryId="dwtClinicalHistoryId"/>
          </el-tab-pane>
          <el-tab-pane label="检查/检验" name="medicalItemPrescription" :disabled="!Number(dwtClinicalHistoryId)">
            <MedicalItemPrescription :mrmMemberId="mrmMemberId" :dwtClinicalHistoryId="dwtClinicalHistoryId"/>
          </el-tab-pane>
          <el-tab-pane label="辅助治疗" name="adjuvantItemPrescription" :disabled="!Number(dwtClinicalHistoryId)">
            <AdjuvantItemPrescription :mrmMemberId="mrmMemberId" :dwtClinicalHistoryId="dwtClinicalHistoryId"/>
          </el-tab-pane>
          <el-tab-pane label="其他项目" name="otherItemPrescription" :disabled="!Number(dwtClinicalHistoryId)">
            <OtherItemPrescription :mrmMemberId="mrmMemberId" :dwtClinicalHistoryId="dwtClinicalHistoryId"/>
          </el-tab-pane>
          <el-tab-pane label="卫生材料" name="hygienicMaterialPrescription" :disabled="!Number(dwtClinicalHistoryId)">
            <HygienicMaterialPrescription :mrmMemberId="mrmMemberId" :dwtClinicalHistoryId="dwtClinicalHistoryId"/>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>

    <!-- 会员健康档案 -->
    <HealthArchive :visible="dialog.healthArchiveVisible" :row="mrmMember"
                   :dialog-close="healthArchiveDialogClose" :data-grid-load-data="loadMember"/>

    <!-- 历史病历 -->
    <ClinicalHistoryRecord :visible="dialog.clinicalHistoryRecordVisible" :mrmMember="mrmMember"
                           :dialog-close="clinicalHistoryRecordDialogClose"/>
    <!-- 预约回访 -->
    <AppointmentVisit :visible="dialog.appointmentVisitVisible" :mrmMember="mrmMember"
                      :dwtClinicalHistoryId="dwtClinicalHistoryId"
                      :dialogClose="appointmentVisitDialogClose"/>

  </div>
</template>

<script>
import PubSub from 'pubsub-js'
import ClinicalHistory from './ClinicalHistory'

import WesternDrugsPrescription from './WesternDrugsPrescription'
import ChineseDrugsPrescription from './ChineseDrugsPrescription'
import HygienicMaterialPrescription from './HygienicMaterialPrescription'
import MedicalItemPrescription from './MedicalItemPrescription'
import AdjuvantItemPrescription from './AdjuvantItemPrescription'
import OtherItemPrescription from './OtherItemPrescription'

import HealthArchive from '../../member_management/member_health/HealthArchiveEdit'
import ClinicalHistoryRecord from './ClinicalHistoryRecord'
import AppointmentVisit from './AppointmentVisit'

export default {
  components: {
    ClinicalHistory, // 病例
    WesternDrugsPrescription, // 西药处方
    ChineseDrugsPrescription, // 中药处方
    HygienicMaterialPrescription, // 卫生材料处方
    MedicalItemPrescription, // 医技项目处方
    AdjuvantItemPrescription, // 辅助项目处方
    OtherItemPrescription, // 其他项目处方
    HealthArchive, // 会员健康档案
    ClinicalHistoryRecord, // 历史病历
    AppointmentVisit // 预约回访
  },

  props: {
    visible: {
      type: Boolean,
      required: true
    },
    mrmMemberId: {
      type: Number,
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
      activeName: 'clinicalHistory', // 激活标签页名称
      dwtClinicalHistoryId: 0, // 病例 ID
      mrmMember: {}, // 会员信息
      dialog: {
        healthArchiveVisible: false, // 健康档案界面开关
        clinicalHistoryRecordVisible: false, // 病历界面开关
        appointmentVisitVisible: false // 预约回访界面开关
      }
    }
  }, // end data

  methods: {
    /* -------------------------------------------------------------------------------------------------------------- */
    /**
     * 界面打开后执行的内容
     */
    dialogOpened () {
      if (this.mrmMemberId) {
        // 载入会员及健康档案
        this.loadMember()
        // 载入会员未进行归档的病例
        PubSub.publish('loadLastUnfinishedForClinicalHistory')
      } else {
        this.$message.error('获取会员信息失败')
      }
    },

    /**
     * 界面关闭确认
     */
    dialogCloseConfirm () {
      // 关闭界面
      this.dialogClose()
      // 初始化其他标签页
      PubSub.publish('receptionTabsPageReset')
    },

    /**
     * 初始化页面
     */
    dialogClosed () {
      // 设置默认打开的标签页
      this.activeName = 'clinicalHistory'
      // 初始化病例ID
      this.dwtClinicalHistoryId = 0
      // 初始化会员信息
      this.mrmMember = {}
    },

    /**
     * 当标签页发生改变时执行的内容
     */
    tabsChange (activeName, oldActiveName) {
      // 返回 false 可阻止标签切换
    },

    /* -------------------------------------------------------------------------------------------------------------- */
    /**
     * 载入会员信息
     * 如果正确返回 它的 loading 会在 PubSub.publish('loadLastUnfinishedForClinicalHistory') 执行结束被该方法终止
     */
    loadMember () {
      this.$loading()
      const url = '/chisAPI/member/getByIdForTreatment'
      let params = {id: this.mrmMemberId}
      this.$http.get(url, {params}).then((res) => {
        if (res.data.code === 200) {
          this.mrmMember = res.data.resultSet.member
        } else {
          this.$loading().close()
        }
      })
    },

    /**
     * 设置病例
     */
    setDwtClinicalHistoryId (id) {
      this.dwtClinicalHistoryId = id
    },

    /* -------------------------------------------------------------------------------------------------------------- */

    /**
     * 打开会员健康档案
     */
    healthArchiveDialogOpen () {
      this.dialog.healthArchiveVisible = true
    },

    /**
     * 关闭会员健康档案
     */
    healthArchiveDialogClose () {
      this.dialog.healthArchiveVisible = false
    },

    /**
     * 打开病历
     */
    clinicalHistoryRecordDialogOpen () {
      this.dialog.clinicalHistoryRecordVisible = true
    },

    /**
     * 关闭病历
     */
    clinicalHistoryRecordDialogClose () {
      this.dialog.clinicalHistoryRecordVisible = false
    },

    /**
     * 预约回访界面打开
     */
    appointmentVisitDialogOpen () {
      if (!this.dwtClinicalHistoryId) {
        this.$message.error('填写并提交病例后方可进行预约')
        return false
      }
      this.dialog.appointmentVisitVisible = true
    },

    /**
     * 预约回访界面关闭
     */
    appointmentVisitDialogClose () {
      this.dialog.appointmentVisitVisible = false
    }
  } // end methods
}
</script>

<style scoped>
  .patients {background-color: #3BB878; width: 220px; float: left; margin-right: 15px;}
  .patients-img {text-align: center; padding: 15px 0;}
  .patients img {max-width: 45%;}
  .patients hr {margin: 11px 0; border:none; border-top:2px white solid;}
  .patients-info {padding-left: 15px;}
  .patients-info p {font-size: 14px; font-weight: 600; padding-bottom: 10px; color: white;}
  .patients-info b {padding-left: 15px;}
  .patients-info i {font-size: 25px; padding-bottom: 10px; color: #DD4A68;}
  .patients-btn {padding-left: 15px; padding-bottom: 10px;}
  .right-tabs {margin-right: 15px;}
</style>
<style>
</style>
