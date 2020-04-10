<template>
  <div class="left-bar">
    <el-menu
      :style="`max-height: ${$store.getters.leftBarMaxHeight}px`"
      :default-active="defaultActivePath"
      :unique-opened="true"
      @select="renderView"
      :collapse="isFoldLeftBar"
      background-color="#3BB878"
      text-color="#FFFFFF"
      active-text-color="#FFFFFF">
      <div class="system-logo">
        <img src="../../assets/images/system-logo.png"/>
        <div v-show="!isFoldLeftBar">
          <!--{{payload.clinicName}}-->
          <div class="system-cn-name">雨思社区卫生信息系统</div>
          <div class="system-en-name">Community Health Information System</div>
        </div>
      </div>
      <hr style="background-color: #FFFFFF; border: none; height: 1px; margin-bottom: 5px;"/>
      <!------------------------------------------------医生工作站------------------------------------------------------>
      <template v-if="moduleName==='doctorWorkstation'">
        <el-submenu index="/doctorWorkstation-0">
          <template slot="title">
            <i class="el-icon-edit-outline"></i>
            <span slot="title">医生问诊</span>
          </template>
          <el-menu-item index="/main/doctorWorkstation/registrationList">待诊患者</el-menu-item>
          <el-menu-item index="/main/doctorWorkstation/clinicalHistoryDoctorCheck">接诊记录</el-menu-item>
        </el-submenu>
        <el-submenu index="/doctorWorkstation-1">
          <template slot="title">
            <i class="el-icon-s-claim"></i>
            <span slot="title">医嘱执行</span>
          </template>
          <el-menu-item index="/main/doctorWorkstation/performItem">医嘱执行</el-menu-item>
          <el-menu-item index="/main/doctorWorkstation/performItemRecord">医嘱执行记录</el-menu-item>
        </el-submenu>
        <el-submenu index="/doctorWorkstation-2">
          <template slot="title">
            <i class="el-icon-s-order"></i>
            <span slot="title">模板维护</span>
          </template>
          <el-menu-item index="/main/doctorWorkstation/clinicalHistoryTemplate">病历模板</el-menu-item>
          <el-menu-item index="/main/error/404#chineseDrugTemplate">中医协定处方</el-menu-item>
        </el-submenu>
        <el-submenu index="/doctorWorkstation-3">
          <template slot="title">
            <i class="el-icon-mobile"></i>
            <span slot="title">常用诊断维护</span>
          </template>
          <el-menu-item index="/main/doctorWorkstation/westernCommonDiagnose">西医常用诊断</el-menu-item>
          <el-menu-item index="/main/doctorWorkstation/chineseCommonDiagnose">中医常用诊断</el-menu-item>
        </el-submenu>
        <el-menu-item index="/main/doctorWorkstation/visitRecord">
          <i class="el-icon-chat-dot-square"></i>
          <span slot="title">患者回访</span>
        </el-menu-item>
        <el-menu-item index="/main/error/404#internetTreatment">
          <i class="el-icon-monitor"></i>
          <span slot="title">互联网+医疗</span>
        </el-menu-item>
      </template>
      <!------------------------------------------------护士工作站------------------------------------------------------>
      <template v-if="moduleName==='nurseWorkstation'">
        <el-submenu index="/nurseWorkstation-1">
          <template slot="title">
            <i class="el-icon-user"></i>
            <span slot="title">挂号</span>
          </template>
          <el-menu-item index="/main/nurseWorkstation/registration">即时挂号</el-menu-item>
          <el-menu-item index="/main/nurseWorkstation/registrationRecord">挂号查询</el-menu-item>
        </el-submenu>
        <el-submenu index="/nurseWorkstation-2">
          <template slot="title">
            <i class="el-icon-money"></i>
            <span slot="title">收费</span>
          </template>
          <el-menu-item index="/main/nurseWorkstation/chargeFeePrescription">处方收费</el-menu-item>
          <el-menu-item index="/main/nurseWorkstation/chargeFeePosEdit">POS收费</el-menu-item>
          <el-menu-item index="/main/nurseWorkstation/chargeFeeRecord">收费记录</el-menu-item>
        </el-submenu>
        <el-menu-item index="/main/nurseWorkstation/goodsOutInventory">
          <i class="el-icon-files"></i>
          <span slot="title">商品出库</span>
        </el-menu-item>
        <el-menu-item index="/main/nurseWorkstation/performDrugs">
          <i class="el-icon-tickets"></i>
          <span slot="title">处方查询</span>
        </el-menu-item>
        <el-menu-item index="/main/nurseWorkstation/memberDeposit">
          <i class="el-icon-coin"></i>
          <span slot="title">会员储值</span>
        </el-menu-item>
        <el-menu-item index="/main/error/404#memberManagement-4-1">
          <i class="el-icon-qn-integral_fill"></i>
          <span slot="title">积分兑换</span>
        </el-menu-item>
        <el-menu-item index="/main/nurseWorkstation/paymentRecord">
          <i class="el-icon-s-data"></i>
          <span slot="title">收退费查询</span>
        </el-menu-item>
      </template>
      <!-------------------------------------------------会员管理------------------------------------------------------->
      <template v-if="moduleName==='memberManagement'">
        <el-submenu index="/memberManagement-1">
          <template slot="title">
            <i class="el-icon-user-solid"></i>
            <span slot="title">会员信息</span>
          </template>
          <el-menu-item index="/main/memberManagement/member">会员信息</el-menu-item>
          <el-menu-item index="/main/memberManagement/memberType">会员类型</el-menu-item>
        </el-submenu>
        <el-submenu index="/memberManagement-2">
          <template slot="title">
            <i class="el-icon-office-building"></i>
            <span slot="title">社区管理</span>
          </template>
          <el-menu-item index="/main/memberManagement/township">乡镇(街道)管理</el-menu-item>
          <el-menu-item index="/main/memberManagement/committee">村(居委会)管理</el-menu-item>
        </el-submenu>
        <el-submenu index="/memberManagement-3">
          <template slot="title">
            <i class="el-icon-collection"></i>
            <span slot="title">健康管理</span>
          </template>
          <el-menu-item index="/main/memberManagement/healthArchive">健康档案</el-menu-item>
          <el-menu-item index="/main/error/404#memberManagement-2-1">健康体检</el-menu-item>
          <el-menu-item index="/main/error/404#memberManagement-2-2">医院转诊</el-menu-item>
          <el-menu-item index="/main/error/404#memberManagement-2-3">家庭医生</el-menu-item>
          <el-menu-item index="/main/error/404#memberManagement-2-4">孕产妇管理</el-menu-item>
          <el-menu-item index="/main/error/404#memberManagement-2-5">儿童健康管理</el-menu-item>
        </el-submenu>
        <el-submenu index="/memberManagement-5">
          <template slot="title">
            <i class="el-icon-s-data"></i>
            <span slot="title">储消记录</span>
          </template>
          <el-menu-item index="/main/memberManagement/depositRecord">储值记录</el-menu-item>
          <el-menu-item index="/main/memberManagement/expendRecord">消费记录</el-menu-item>
          <el-menu-item index="/main/memberManagement/pointsRecord">积分记录</el-menu-item>
        </el-submenu>
      </template>
      <!-------------------------------------------------商品管理------------------------------------------------------->
      <template v-if="moduleName==='goodsManagement'">
        <el-menu-item index="/main/goodsManagement/westernDrugs">
          <i class="el-icon-wallet"></i>
          <span slot="title">西药 / 中成药</span>
        </el-menu-item>
        <el-menu-item index="/main/goodsManagement/chineseDrugs">
          <i class="el-icon-wallet"></i>
          <span slot="title">中药</span>
        </el-menu-item>
        <el-menu-item index="/main/goodsManagement/hygienicMaterial">
          <i class="el-icon-wallet"></i>
          <span slot="title">卫生材料</span>
        </el-menu-item>
        <el-submenu index="/goodsManagement-1">
          <template slot="title">
            <i class="el-icon-crop"></i>
            <span slot="title">厂家与产地维护</span>
          </template>
          <el-menu-item index="/main/systemManagement/manufacturer">生产厂家</el-menu-item>
          <el-menu-item index="/main/systemManagement/origin">产地信息</el-menu-item>
        </el-submenu>
        <el-menu-item index="/main/goodsManagement/goodsApply">
          <i class="el-icon-crop"></i>
          <span slot="title">新品维护</span>
        </el-menu-item>
        <el-submenu index="/goodsManagement-3">
          <template slot="title">
            <i class="el-icon-crop"></i>
            <span slot="title">价格维护</span>
          </template>
          <el-menu-item index="/main/goodsManagement/goodsAdjustPriceApply">调价申请</el-menu-item>
          <el-menu-item index="/main/goodsManagement/goodsAdjustPriceApprove">调价审批</el-menu-item>
        </el-submenu>
      </template>
      <!-------------------------------------------------采购管理------------------------------------------------------->
      <template v-if="moduleName==='purchaseManagement'">
        <el-submenu index="/purchaseManagement-0">
          <template slot="title">
            <i class="el-icon-user-solid"></i>
            <span slot="title">供应商信息</span>
          </template>
          <el-menu-item index="/main/purchaseManagement/supplier">供应商信息</el-menu-item>
          <el-menu-item index="/main/error/404#purchaseManagement-1">供应商证照预警</el-menu-item>
          <el-menu-item index="/main/error/404#purchaseManagement-2">供应商结款预警</el-menu-item>
        </el-submenu>
        <el-submenu index="/purchaseManagement-1">
          <template slot="title">
            <i class="el-icon-shopping-cart-2"></i>
            <span slot="title">连锁采购</span>
          </template>
          <el-menu-item index="/main/purchaseManagement/purchasePlanApply">采购计划</el-menu-item>
          <el-menu-item index="/main/purchaseManagement/purchasePlanApprove">计划审批</el-menu-item>
          <el-menu-item index="/main/purchaseManagement/purchaseOrderApply">采购订单</el-menu-item>
          <el-menu-item index="/main/purchaseManagement/purchaseOrderApprove">订单审批</el-menu-item>
          <el-menu-item index="/main/purchaseManagement/purchaseOrderTrack">订单追踪</el-menu-item>
          <el-menu-item index="/main/purchaseManagement/purchasePlanRecord">计划查询</el-menu-item>
        </el-submenu>
        <el-submenu index="/purchaseManagement-2">
          <template slot="title">
            <i class="el-icon-takeaway-box"></i>
            <span slot="title">采购入库</span>
          </template>
          <el-menu-item index="/main/purchaseManagement/purchaseAloneAddApply">自采入库</el-menu-item>
          <el-menu-item index="/main/purchaseManagement/purchasePlanAddApply">计划入库</el-menu-item>
          <el-menu-item index="/main/purchaseManagement/purchaseAddApprove">入库审批</el-menu-item>
        </el-submenu>
        <el-submenu index="/purchaseManagement-3">
          <template slot="title">
            <i class="el-icon-takeaway-box"></i>
            <span slot="title">采购退货</span>
          </template>
          <el-menu-item index="/main/purchaseManagement/purchaseSubtractApply">采购退货</el-menu-item>
          <el-menu-item index="/main/purchaseManagement/purchaseSubtractApprove">退货审批</el-menu-item>
        </el-submenu>
      </template>
      <!-------------------------------------------------库存管理------------------------------------------------------->
      <template v-if="moduleName==='inventoryManagement'">
        <el-submenu index="/inventoryManagement-1">
          <template slot="title">
            <i class="el-icon-receiving"></i>
            <span slot="title">库存查询</span>
          </template>
          <el-menu-item index="/main/inventoryManagement/clinicPchInventory">本机构批次库存</el-menu-item>
          <el-menu-item index="/main/inventoryManagement/clinicPhInventory">本机构批号库存</el-menu-item>
          <el-menu-item index="/main/inventoryManagement/allPchInventory">各机构批次库存</el-menu-item>
          <el-menu-item index="/main/inventoryManagement/allPhInventory">各机构批号库存</el-menu-item>
        </el-submenu>
        <el-menu-item index="/main/inventoryManagement/inventoryAllotApply">
          <i class="el-icon-copy-document"></i>
          <span slot="title">库存调拨</span>
        </el-menu-item>
        <!--
        <el-submenu index="/inventoryManagement-2">
          <template slot="title">
            <i class="el-icon-copy-document"></i>
            <span slot="title">库房调拨</span>
          </template>
          <el-menu-item index="/main/inventoryManagement/inventoryAllotApply">库房调拨</el-menu-item>
          <el-menu-item index="/main/inventoryManagement/inventoryAllotApprove">调拨审批</el-menu-item>
        </el-submenu>
        -->
        <el-submenu index="/inventoryManagement-3">
          <template slot="title">
            <i class="el-icon-copy-document"></i>
            <span slot="title">物资领用</span>
          </template>
          <el-menu-item index="/main/inventoryManagement/selfUsedApply">领用申请</el-menu-item>
          <el-menu-item index="/main/inventoryManagement/selfUsedApprove">领用审批</el-menu-item>
        </el-submenu>
        <el-submenu index="/inventoryManagement-4">
          <template slot="title">
            <i class="el-icon-copy-document"></i>
            <span slot="title">商品报损</span>
          </template>
          <el-menu-item index="/main/inventoryManagement/lossApply">报损申请</el-menu-item>
          <el-menu-item index="/main/inventoryManagement/lossApprove">报损审批</el-menu-item>
        </el-submenu>
        <el-submenu index="/inventoryManagement-5">
          <template slot="title">
            <i class="el-icon-news"></i>
            <span slot="title">货位维护</span>
          </template>
          <el-menu-item index="/main/inventoryManagement/shelfPosition">货位维护</el-menu-item>
          <el-menu-item index="/main/inventoryManagement/shelfGoods">货位铺货</el-menu-item>
        </el-submenu>
        <el-menu-item index="/main/inventoryManagement/inventoryCheck">
          <i class="el-icon-tickets"></i>
          <span slot="title">库存盘点</span>
        </el-menu-item>
      </template>
      <!-------------------------------------------------收费项目------------------------------------------------------->
      <template v-if="moduleName==='itemsManagement'">
        <el-menu-item index="/main/itemsManagement/medicalItem">
          <i class="el-icon-s-promotion"></i>
          <span slot="title">医技项目</span>
        </el-menu-item>
        <el-menu-item index="/main/itemsManagement/adjuvantItem">
          <i class="el-icon-s-promotion"></i>
          <span slot="title">辅助项目</span>
        </el-menu-item>
        <el-menu-item index="/main/itemsManagement/otherItem">
          <i class="el-icon-s-promotion"></i>
          <span slot="title">其他项目</span>
        </el-menu-item>
        <el-menu-item index="/main/itemsManagement/itemApply">
          <i class="el-icon-crop"></i>
          <span slot="title">新项目维护</span>
        </el-menu-item>
        <el-submenu index="/itemsManagement-2">
          <template slot="title">
            <i class="el-icon-crop"></i>
            <span slot="title">价格维护</span>
          </template>
          <el-menu-item index="/main/itemsManagement/itemAdjustPriceApply">调价申请</el-menu-item>
          <el-menu-item index="/main/itemsManagement/itemAdjustPriceApprove">调价审批</el-menu-item>
        </el-submenu>
      </template>
      <!-------------------------------------------------财务管理------------------------------------------------------->
      <template v-if="moduleName==='financialManagement'">
        <el-submenu index="/financialManagement-1">
          <template slot="title">
            <i class="el-icon-tickets"></i>
            <span slot="title">月结业务</span>
          </template>
          <el-menu-item index="/main/error/404#financialManagement-1-1">月度结账</el-menu-item>
          <el-menu-item index="/main/error/404#financialManagement-1-2">月度成本汇总</el-menu-item>
        </el-submenu>
        <el-submenu index="/financialManagement-2">
          <template slot="title">
            <i class="el-icon-tickets"></i>
            <span slot="title">往来账目</span>
          </template>
          <el-menu-item index="/main/financialManagement/supplierAccount">供应商账款</el-menu-item>
          <el-menu-item index="/main/financialManagement/payableAccount">应付账款</el-menu-item>
          <el-menu-item index="/main/financialManagement/paidAccount">付款明细</el-menu-item>
          <el-menu-item index="/main/financialManagement/paymentApprove">付款审批</el-menu-item>
        </el-submenu>
      </template>
      <!-------------------------------------------------营销管理------------------------------------------------------->
      <template v-if="moduleName==='marketingManagement'">
        <el-submenu index="/marketingManagement-1">
          <template slot="title">
            <i class="el-icon-paperclip"></i>
            <span slot="title">卡券维护</span>
          </template>
          <el-menu-item index="/main/error/404#marketingManagement-1-1">卡券发放</el-menu-item>
          <el-menu-item index="/main/error/404#marketingManagement-1-2">使用查询</el-menu-item>
        </el-submenu>
        <el-submenu index="/marketingManagement-2">
          <template slot="title">
            <i class="el-icon-paperclip"></i>
            <span slot="title">套餐维护</span>
          </template>
          <el-menu-item index="/main/error/404#marketingManagement-2-1">套餐设置</el-menu-item>
          <el-menu-item index="/main/error/404#marketingManagement-2-2">套餐查询</el-menu-item>
        </el-submenu>
        <el-submenu index="/marketingManagement-3">
          <template slot="title">
            <i class="el-icon-paperclip"></i>
            <span slot="title">活动维护</span>
          </template>
          <el-menu-item index="/main/error/404#marketingManagement-3-1">活动设置</el-menu-item>
          <el-menu-item index="/main/error/404#marketingManagement-3-2">活动查询</el-menu-item>
        </el-submenu>
      </template>
      <!-------------------------------------------------数据分析------------------------------------------------------->
      <template v-if="moduleName==='dataReport'"><!--dataReport-->
        <el-submenu index="/dataReport-1">
          <template slot="title">
            <i class="el-icon-tickets"></i>
            <span slot="title">运营报表</span>
          </template>
          <el-menu-item index="/main/dataReport/allSellRecord" v-if="hqReport">销售明细*</el-menu-item>
          <el-menu-item index="/main/dataReport/clinicSellRecord" v-if="!hqReport">销售明细</el-menu-item>
          <el-menu-item index="/main/dataReport/allSortSellRecord" v-if="hqReport">销售排行*</el-menu-item>
          <el-menu-item index="/main/dataReport/clinicSortSellRecord" v-if="!hqReport">销售排行</el-menu-item>
          <el-menu-item index="/main/dataReport/daySellRecord" v-if="hqReport">日销售报表(含税)*</el-menu-item>
          <el-menu-item index="/main/dataReport/selfUsedRecord" v-if="hqReport">领用明细*</el-menu-item>
          <el-menu-item index="/main/dataReport/lossRecord" v-if="hqReport">报损明细*</el-menu-item>
          <el-menu-item index="/main/dataReport/allVisitRecord" v-if="hqReport">回访情况*</el-menu-item>
          <el-menu-item index="/main/dataReport/allExpirydateWarning" v-if="hqReport">效期预警*</el-menu-item>
          <el-menu-item index="/main/dataReport/ClinicExpirydateWarning" v-if="!hqReport">效期预警</el-menu-item>
          <el-menu-item index="/main/dataReport/allLshMarginRate" v-if="hqReport">流水毛利分析*</el-menu-item>
          <el-menu-item index="/main/dataReport/clinicLshMarginRate" v-if="!hqReport">流水毛利分析</el-menu-item>
          <el-menu-item index="/main/dataReport/allSellFrequency" v-if="hqReport">库存动销分析*</el-menu-item>
          <el-menu-item index="/main/dataReport/clinicSellFrequency" v-if="!hqReport">库存动销分析</el-menu-item>
          <el-menu-item index="/main/dataReport/clinicalHistoryCheck" v-if="hqReport">病历合规检查*</el-menu-item>

          <!--
          <el-menu-item index="/main/error/404#81-2">库存预警</el-menu-item>
          <el-menu-item index="/main/error/404#81-2">商品历史进价</el-menu-item>
          -->
        </el-submenu>
       <el-submenu index="/dataReport-2">
         <template slot="title">
           <i class="el-icon-tickets"></i>
           <span slot="title">财务报表</span>
         </template>
         <el-menu-item index="/main/dataReport/allPaymentRecordReport" v-if="hqReport">收费方式汇总*</el-menu-item>
         <el-menu-item index="/main/dataReport/clinicPaymentRecordReport" v-if="!hqReport">收费方式汇总</el-menu-item>
         <el-menu-item index="/main/dataReport/allDepositPaymentRecordReport" v-if="hqReport">储值方式汇总*</el-menu-item>
         <el-menu-item index="/main/dataReport/clinicDepositPaymentRecordReport" v-if="!hqReport">储值方式汇总</el-menu-item>
         <el-menu-item index="/main/dataReport/allBillingTypeReport" v-if="hqReport">计费类型汇总*</el-menu-item>
         <el-menu-item index="/main/dataReport/clinicBillingTypeReport" v-if="!hqReport">计费类型汇总</el-menu-item>
         <!--
         <el-menu-item index="/main/error/404#82-2">提成查询</el-menu-item>
         -->
       </el-submenu>
      </template>
      <!-------------------------------------------------系统设置------------------------------------------------------->
      <template v-if="moduleName==='systemManagement'">
        <el-submenu index="/systemManagement-1">
          <template slot="title">
            <i class="el-icon-star-off"></i>
            <span slot="title">门诊维护</span>
          </template>
          <el-menu-item index="/main/systemManagement/clinicRoom">门诊科室设置</el-menu-item>
          <el-menu-item index="/main/systemManagement/doctor">门诊医生注册</el-menu-item>
        </el-submenu>
        <!--
        <el-menu-item index="/main/error/404#systemManagement-2-1">
          <i class="el-icon-setting"></i>
          <span slot="title">系统设置</span>
        </el-menu-item>
        -->
        <el-submenu index="/systemManagement-3">
          <template slot="title">
            <i class="el-icon-crop"></i>
            <span slot="title">系统维护</span>
          </template>
          <el-menu-item index="/main/systemManagement/clinic">机构维护</el-menu-item>
          <el-menu-item index="/main/systemManagement/role">角色维护</el-menu-item>
          <el-menu-item index="/main/systemManagement/authc">权限维护</el-menu-item>
          <el-menu-item index="/main/systemManagement/user">用户维护</el-menu-item>
        </el-submenu>
        <el-submenu index="/systemManagement-4">
          <template slot="title">
            <i class="el-icon-reading"></i>
            <span slot="title">财务字典</span>
          </template>
          <el-menu-item index="/main/systemManagement/billingType">计费类型</el-menu-item>
          <el-menu-item index="/main/systemManagement/invoiceType">发票类型</el-menu-item>
          <el-menu-item index="/main/systemManagement/paymentType">付款类型</el-menu-item>
          <el-menu-item index="/main/systemManagement/paymentWay">付款方式</el-menu-item>
          <el-menu-item index="/main/systemManagement/taxpayerType">纳税人类型</el-menu-item>
        </el-submenu>
        <el-submenu index="/systemManagement-5">
          <template slot="title">
            <i class="el-icon-reading"></i>
            <span slot="title">项目字典</span>
          </template>
          <el-menu-item index="/main/systemManagement/itemUnits">项目单位</el-menu-item>
          <el-menu-item index="/main/systemManagement/itemClassify">项目分类</el-menu-item>
          <el-menu-item index="#/100-10">送检样本</el-menu-item>
        </el-submenu>
        <el-submenu index="/systemManagement-6">
          <template slot="title">
            <i class="el-icon-reading"></i>
            <span slot="title">商品字典</span>
          </template>
          <el-menu-item index="/main/systemManagement/goodsUnits">商品单位</el-menu-item>
          <el-menu-item index="/main/systemManagement/doseUnits">剂量单位</el-menu-item>
          <el-menu-item index="/main/systemManagement/doseType">药品剂型</el-menu-item>
          <el-menu-item index="/main/systemManagement/drugFrequency">用药频率</el-menu-item>
          <el-menu-item index="/main/systemManagement/drugUsage">给药途径</el-menu-item>
          <el-menu-item index="/main/systemManagement/goodsClassify">商品分类</el-menu-item>
          <el-menu-item index="/main/systemManagement/secondClassify">二级分类</el-menu-item>
          <el-menu-item index="/main/systemManagement/sellClassify">销售分类</el-menu-item>
          <el-menu-item index="/main/systemManagement/specialDrug">特殊药品</el-menu-item>
          <el-menu-item index="/main/systemManagement/storageTemperature">存储条件</el-menu-item>
          <el-menu-item index="/main/systemManagement/prescriptionType">处方类型</el-menu-item>
          <el-menu-item index="/main/systemManagement/drugsPrepareMethod">炮制方法</el-menu-item>
        </el-submenu>
        <el-submenu index="/systemManagement-7">
          <template slot="title">
            <i class="el-icon-reading"></i>
            <span slot="title">会员字典</span>
          </template>
          <el-menu-item index="/main/systemManagement/gender">性别</el-menu-item>
          <el-menu-item index="/main/systemManagement/nationality">民族</el-menu-item>
          <el-menu-item index="/main/systemManagement/marital">婚姻状况</el-menu-item>
          <el-menu-item index="/main/systemManagement/education">文化程度</el-menu-item>
          <el-menu-item index="/main/systemManagement/bloodType">血型</el-menu-item>
          <el-menu-item index="/main/systemManagement/rh">RH</el-menu-item>
          <el-menu-item index="/main/systemManagement/profession">职业</el-menu-item>
        </el-submenu>
        <el-submenu index="/systemManagement-8">
          <template slot="title">
            <i class="el-icon-reading"></i>
            <span slot="title">档案字典</span>
          </template>
          <el-menu-item index="/main/systemManagement/ffsPaymentWay">医疗费用支付方式</el-menu-item>
          <el-menu-item index="/main/systemManagement/allergy">过敏史</el-menu-item>
          <el-menu-item index="/main/systemManagement/exposure">暴露史</el-menu-item>
          <el-menu-item index="/main/systemManagement/illness">疾病</el-menu-item>
          <el-menu-item index="/main/systemManagement/familyIllness">家族史疾病</el-menu-item>
          <el-menu-item index="/main/systemManagement/disability">残疾情况</el-menu-item>
          <el-menu-item index="/main/systemManagement/kitchenExhaust">厨房排风设施</el-menu-item>
          <el-menu-item index="/main/systemManagement/fuelType">燃料类型</el-menu-item>
          <el-menu-item index="/main/systemManagement/waterSource">饮水来源</el-menu-item>
          <el-menu-item index="/main/systemManagement/toiletType">厕所类型</el-menu-item>
          <el-menu-item index="/main/systemManagement/livestockFence">禽畜栏</el-menu-item>
        </el-submenu>
        <el-submenu index="/systemManagement-9">
          <template slot="title">
            <i class="el-icon-reading"></i>
            <span slot="title">其他字典</span>
          </template>
          <el-menu-item index="/main/systemManagement/practiceType">医生执业类别</el-menu-item>
          <el-menu-item index="/main/systemManagement/practiceScope">医生执业范围</el-menu-item>
          <el-menu-item index="/main/systemManagement/doctorTitles">医生职称</el-menu-item>
        </el-submenu>
      </template>
    </el-menu>
  </div>
</template>

<script>
import PubSub from 'pubsub-js'
import jwtDecode from 'jwt-decode'
export default {
  data () {
    return {
      defaultActivePath: this.$route.path,
      payload: jwtDecode(this.$store.getters.token)
    }
  },
  mounted () {
    // console.log('在 el-menu-item 中使用 ref 通过从与后台获取的数据进行对比 决定是否显示该菜单')
    // 注意这个测试会报错 如果当前激活菜单不是 clinic 会提示 null 的错误
    // console.log('显示 el-menu-item 的 index:' + this.$refs.clinic.index)
  },
  computed: {
    isFoldLeftBar: function () {
      return this.$store.getters.isFoldLeftBar
    },
    moduleName: function () {
      return this.$store.getters.leftBarMenuName
    },
    hqReport: function () {
      return this.$store.getters.HQID === this.payload.clinicId
    }
  },

  methods: {
    renderView (index, indexPath) {
      PubSub.publish('renderView', index)
    }
  }
}
</script>

<style scoped>
  .left-bar .system-logo {
    text-align: center;
    padding: 5px;
  }
  .left-bar .system-logo img {
    width: 40%;
    min-width: 32px;
  }
  .left-bar .system-logo div {
    width: 200px; /* 减去父元素的 左右内边距 5px (210 -10 = 200)*/
    font-weight: 600;
    color: white;
  }
  .left-bar .system-logo .system-cn-name {
    font-size: 14px;
  }
  .left-bar .system-logo .system-en-name {
    margin-left: -10px;
    white-space : nowrap;
    display:block;
    font-size: 12px;
    -webkit-transform:scale(0.8);
  }
  /* 取消侧边栏边框 */
  .el-menu {
    border: transparent;
  }
  /* 设置侧边栏非隐藏状态下宽度 */
  .el-menu:not(.el-menu--collapse) {
    width: 210px;
  }
  /* 设置侧边栏隐藏状态下宽度 */
  .el-menu--collapse {
    width: 40px;
  }
  /* 调整侧边栏隐藏状态下图标位置*/
  .el-menu--collapse i{
    position: relative;
    right: 13px;
  }
</style>
<style>
  /* 设置侧边栏背景颜色 */
  .left-bar {
    background-color: #3BB878; /*545A5A*/
  }
  /* 设置侧边栏二级菜单背景颜色 */
  .left-bar .el-submenu .el-menu-item {
    background-color: #3AA878 !important; /*545c64*/
  }
  /* 设置侧边栏选中行背景色*/
  .left-bar .el-menu-item.is-active {
    background: rgba(64, 70, 80, 0.35) !important;
  }
  /* 设置侧边栏 hover 选中行颜色 */
  .left-bar .el-menu-item:hover{
    /* outline: 0 !important; */
    background: rgba(64, 70, 80, 0.35) !important;
    /* color: #815E96 !important; */
  }
  /* 设置侧边栏图标的颜色 */
  .left-bar .el-menu i {
    color: white;
  }
  /* 设置侧边栏 二级菜单与一级菜单的缩进 */
  .left-bar .el-submenu .el-menu-item {
    padding-left: 32% !important;
  }
  /* 设置侧边栏二级菜单滚动样式*/
  .left-bar .el-menu{
    overflow: scroll;
  }
  /* 设置侧边栏二级菜单不显示滑动条 但用鼠标滑轮可以滑动*/
  .left-bar .el-menu::-webkit-scrollbar{
    display:none;
  }
  .left-bar .el-menu {
    -ms-overflow-style: none;
  }
  /* 设置侧边栏二级菜单隐藏时 hover 滚动样式 */
  .el-menu--vertical {
    height: 100%;
    overflow: scroll;
  }
  /* 设置侧边栏二级菜单隐藏时 hover 不显示滑动条 但用鼠标滑轮可以滑动*/
  .el-menu--vertical::-webkit-scrollbar{
    display:none;
  }
  .el-menu--vertical {
    -ms-overflow-style: none;
  }
</style>
