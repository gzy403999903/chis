<template>
  <el-dialog
    fullscreen
    :show-close="false"
    :close-on-click-modal="false"
    :visible="visible"
    @opened="dialogOpened"
    @closed="dialogClosed">

    <!-- 模态框标题栏与功能按钮-->
    <el-row slot="title">
      <el-col :span="12" style="font-size: 20px;">
        <span>{{title}}信息</span>
      </el-col>
      <el-col :span="12" style="text-align: right;">
        <el-button size="mini" type="primary" icon="el-icon-check" @click="editFormSubmit">提 交</el-button>
        <el-button size="mini" type="warning" icon="el-icon-right" @click="dialogClose">返 回</el-button>
      </el-col>
    </el-row>

    <!-- 编辑表单 -->
    <el-form :model="editForm" ref="editForm" :rules="editFormRules" size="small" label-width="110px">
      <el-form-item prop="id" v-show="false">
        <el-input v-model.trim="editForm.id"/>
      </el-form-item>

      <el-row>
        <el-col :span="6">
          <el-form-item label="商品编码" prop="oid">
            <el-input v-model.trim="editForm.oid" ref="oid"
                      @keyup.enter.native="editFormValidateField('oid', 'name')"/>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="6">
          <el-form-item label="通用名" prop="name">
            <el-input v-model.trim="editForm.name" ref="name"
                      @keyup.enter.native="editFormValidateField('name', 'spName')"
                      @blur="editFormSetPyCode('name', 'code')" @change="editFormSetPyCode('name', 'code')"/>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="助记码" prop="code">
            <el-input v-model.trim="editForm.code" ref="code"
                      @keyup.enter.native="editFormValidateField('code', 'spName')"/>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="商品名" prop="spName">
            <el-input v-model.trim="editForm.spName" ref="spName"
                      @keyup.enter.native="editFormValidateField('spName', 'specs')"
                      @blur="editFormSetPyCode('spName', 'spCode')" @change="editFormSetPyCode('spName', 'spCode')"/>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="助记码" prop="spCode">
            <el-input v-model.trim="editForm.spCode" ref="spCode"
                      @keyup.enter.native="editFormValidateField('spCode', 'specs')"/>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="6">
          <el-form-item label="商品规格" prop="specs">
            <el-input v-model.trim="editForm.specs" ref="specs"
                      @keyup.enter.native="editFormValidateField('specs', 'goodsUnitsId')"/>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="包装单位" prop="goodsUnitsId">
            <el-select
              ref="goodsUnitsId"
              @keyup.enter.native="editFormValidateField('goodsUnitsId', 'goodsClassifyId')"
              v-model.trim="editForm.goodsUnitsId"
              filterable
              default-first-option
              placeholder="请选择">
              <el-option v-for="item in goodsUnitsList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6" :offset="2">
          <el-form-item label="商品分类" prop="goodsClassifyId">
            <el-select
              ref="goodsClassifyId"
              @keyup.enter.native="editFormValidateField('goodsClassifyId', 'sysSecondClassifyId')"
              @change="goodsClassifyIdChange"
              v-model.trim="editForm.goodsClassifyId"
              filterable
              default-first-option
              placeholder="请选择">
              <el-option v-for="item in goodsClassifyList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="二级分类" prop="sysSecondClassifyId">
            <el-select
              ref="sysSecondClassifyId"
              @keyup.enter.native="editFormValidateField('goodsClassifyId', 'manufacturerId')"
              v-model.trim="editForm.sysSecondClassifyId"
              filterable
              default-first-option
              placeholder="请选择">
              <el-option :value="''" label="无"/>
              <el-option v-for="item in select.secondClassifyList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="8">
          <el-form-item label="生产厂家" prop="manufacturerId">
            <el-select
              ref="manufacturerId"
              @keyup.enter.native="editFormValidateField('manufacturerId', 'originId')"
              v-model.trim="editForm.manufacturerId"
              placeholder="输入 厂家名称 / 助记码 搜索"
              :remote-method="editFormQueryManufacturer"
              :loading="select.loading"
              remote
              default-first-option
              filterable>
              <el-option v-for="item in select.manufacturers" :key="item.id" :value="item.id" :label="item.name"/>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="产地" prop="originId">
            <el-select
              ref="originId"
              @keyup.enter.native="editFormValidateField('originId', 'billingTypeId')"
              v-model.trim="editForm.originId"
              filterable
              default-first-option
              placeholder="请选择">
              <el-option v-for="item in originList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="计费类型" prop="billingTypeId">
            <el-select
              ref="billingTypeId"
              @keyup.enter.native="editFormValidateField('billingTypeId', 'barcode')"
              v-model.trim="editForm.billingTypeId"
              filterable
              default-first-option
              placeholder="请选择">
              <el-option v-for="item in billingTypeList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item label="电子条码" prop="barcode">
            <el-input v-model.trim="editForm.barcode" ref="barcode"
                      @keyup.enter.native="editFormValidateField('barcode', (dialog.editable ? 'retailPrice' : 'profitCommissionRate'))"/>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="4">
          <el-form-item label="零售单价" prop="retailPrice">
            <el-input-number v-model.trim="editForm.retailPrice" :controls="false" :max="99999" :min="0" :precision="4"
                             ref="retailPrice" v-if="dialog.editable" style="width: 80%;"
                             @keyup.enter.native="editFormValidateField('retailPrice', 'profitCommissionRate')"
                             @change="editFormSplitableChange"/>
            <span v-if="dialog.editable">&nbsp;&nbsp;元</span>
            <span v-if="!dialog.editable">{{editForm.retailPrice}} &nbsp;&nbsp;元</span>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="毛利提成" prop="profitCommissionRate">
            <el-input-number v-model.trim="editForm.profitCommissionRate" :controls="false" :max="99" :min="0" :precision="0"
                             ref="profitCommissionRate" style="width: 80%;"
                             @keyup.enter.native="editFormValidateField('profitCommissionRate', 'purchaseTaxRate')"/>
            <span>&nbsp;&nbsp;%</span>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="进货税率" prop="purchaseTaxRate">
            <el-input-number v-model.trim="editForm.purchaseTaxRate" :controls="false" :max="99" :min="0" :precision="0"
                             ref="purchaseTaxRate" style="width: 80%;"
                             @keyup.enter.native="editFormValidateField('purchaseTaxRate', 'sellTaxRate')"/>
            <span>&nbsp;&nbsp;%</span>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="销售税率" prop="sellTaxRate">
            <el-input-number v-model.trim="editForm.sellTaxRate" :controls="false" :max="99" :min="0" :precision="0"
                             ref="sellTaxRate" style="width: 80%;"
                             @keyup.enter.native="editFormValidateField('sellTaxRate', 'minPurchaseQuantity')"/>
            <span>&nbsp;&nbsp;%</span>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="购进基数" prop="minPurchaseQuantity">
            <el-input-number v-model.trim="editForm.minPurchaseQuantity" :controls="false" :max="30000" :min="1" :precision="0"
                             ref="minPurchaseQuantity"
                             @keyup.enter.native="editFormValidateField('minPurchaseQuantity', 'sellClassifyId')"/>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="主推分类" prop="sellClassifyId">
            <el-select
              ref="sellClassifyId"
              v-model.trim="editForm.sellClassifyId"
              filterable
              default-first-option
              placeholder="请选择">
              <el-option :value="null" label="无"/>
              <el-option v-for="item in sellClassifyList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="4">
          <el-form-item label="参与打折" prop="discountable">
            <el-radio-group v-model="editForm.discountable">
              <el-radio :label="true">是</el-radio>
              <el-radio :label="false">否</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="可以退货" prop="returnable">
            <el-radio-group v-model="editForm.returnable">
              <el-radio :label="true">是</el-radio>
              <el-radio :label="false">否</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="是否赠品" prop="freeGoods">
            <el-radio-group v-model="editForm.freeGoods">
              <el-radio :label="true">是</el-radio>
              <el-radio :label="false">否</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="允许倒挂" prop="lossable">
            <el-radio-group v-model="editForm.lossable">
              <el-radio :label="true">是</el-radio>
              <el-radio :label="false">否</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="启用状态" prop="state">
            <el-radio-group v-model="editForm.state">
              <el-radio :label="true">启用</el-radio>
              <el-radio :label="false">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider content-position="left">拆零属性 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 填写 【包装单位】 和 【零售单价】可激活选项</el-divider>

      <el-row>
        <el-col :span="4">
          <el-form-item label="可拆零" prop="splitable">
            <el-radio-group v-model="editForm.splitable"
                            :disabled="editForm.goodsUnitsId && !(editForm.retailPrice > 0)"
                            @change="editFormSplitableChange">
              <el-radio :label="true">是</el-radio>
              <el-radio :label="false">否</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="拆零数量" prop="splitQuantity">
            <el-input-number v-model.trim="editForm.splitQuantity" :controls="false" :max="9999" :min="1" :precision="0"
                             ref="splitQuantity" style="width: 80%;" :disabled="!editForm.splitable"
                             @keyup.enter.native="editFormValidateField('sellTaxRate', 'splitUnitsId')"
                             @change="editFormSplitableChange"/>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="拆零单位" prop="splitUnitsId">
            <el-select
              ref="splitUnitsId"
              v-model.trim="editForm.splitUnitsId"
              :disabled="!editForm.splitable"
              filterable
              default-first-option
              placeholder="请选择">
              <el-option v-for="item in goodsUnitsList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="拆零单价" prop="splitPrice">
            {{editForm.splitPrice}} &nbsp;&nbsp;元
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider content-position="left">药品属性</el-divider>

      <el-row v-show="goodsType === belongGoodsType.WESTERN_DRUGS">
        <el-col :span="4">
          <el-form-item label="药品剂型" prop="doseTypeId">
            <el-select
              ref="doseTypeId"
              @keyup.enter.native="editFormValidateField('doseTypeId', 'dose')"
              v-model.trim="editForm.doseTypeId"
              filterable
              default-first-option
              placeholder="请选择">
              <el-option v-for="item in doseTypeList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="基本剂量" prop="dose">
            <el-input-number v-model.trim="editForm.dose" :controls="false" :max="9999" :min="0" :precision="4"
                             ref="dose" @keyup.enter.native="editFormValidateField('dose', 'doseUnitsId')"/>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="剂量单位" prop="doseUnitsId">
            <el-select
              ref="doseUnitsId"
              @keyup.enter.native="editFormValidateField('doseUnitsId', 'drugUsageId')"
              v-model.trim="editForm.doseUnitsId"
              filterable
              default-first-option
              placeholder="请选择">
              <el-option v-for="item in doseUnitsList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="给药途径" prop="drugUsageId">
            <el-select
              ref="drugUsageId"
              @keyup.enter.native="editFormValidateField('drugUsageId', 'specialDrugId')"
              v-model.trim="editForm.drugUsageId"
              filterable
              default-first-option
              placeholder="请选择">
              <el-option v-for="item in drugUsageList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="特殊药品" prop="specialDrugId">
            <el-select
              ref="specialDrugId"
              @keyup.enter.native="editFormValidateField('specialDrugId', 'storageTemperatureId')"
              v-model.trim="editForm.specialDrugId"
              filterable
              default-first-option
              placeholder="请选择">
              <el-option v-for="item in specialDrugList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="4">
          <el-form-item label="是否串味" prop="odored">
            <el-radio-group v-model="editForm.odored">
              <el-radio :label="true">是</el-radio>
              <el-radio :label="false">否</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="存储条件" prop="storageTemperatureId">
            <el-select
              ref="storageTemperatureId"
              @keyup.enter.native="editFormValidateField('storageTemperatureId', 'conservationDays')"
              v-model.trim="editForm.storageTemperatureId"
              filterable
              default-first-option
              placeholder="请选择">
              <el-option v-for="item in storageTemperatureList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="养护天数" prop="conservationDays">
            <el-input-number v-model.trim="editForm.conservationDays" :controls="false" :max="366" :min="0" :precision="0"
                             ref="conservationDays" @keyup.enter.native="editFormValidateField('conservationDays', 'approvalNum')"/>
          </el-form-item>
        </el-col>
        <el-col :span="6" v-show="goodsType !== belongGoodsType.HYGIENIC_MATERIAL">
          <el-form-item label="处方药品" prop="prescription">
            <el-radio-group v-model="editForm.prescription">
              <el-radio :label="true">是</el-radio>
              <el-radio :label="false">否</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <!--
        <el-col :span="6">
          <el-form-item label="处方类型" prop="prescriptionTypeId">
            <el-select
              ref="prescriptionTypeId"
              @keyup.enter.native="editFormValidateField('prescriptionTypeId', 'approvalNum')"
              v-model.trim="editForm.prescriptionTypeId"
              filterable
              default-first-option
              placeholder="请选择">
              <el-option v-for="item in prescriptionTypeList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
            </el-select>
          </el-form-item>
        </el-col>
        -->
      </el-row>

      <el-row>
        <el-col :span="4" v-show="goodsType !== belongGoodsType.HYGIENIC_MATERIAL">
          <el-form-item label="医保药品" prop="ybDrug">
            <el-radio-group v-model="editForm.ybDrug">
              <el-radio :label="true">是</el-radio>
              <el-radio :label="false">否</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="4" v-show="goodsType !== belongGoodsType.HYGIENIC_MATERIAL">
          <el-form-item label="医保编码" prop="ybOid">
            <el-input v-model.trim="editForm.ybOid" :disabled="!editForm.ybDrug" ref="ybOid"
                      @keyup.enter.native="editFormValidateField('ybOid', 'ybPrice')"/>
          </el-form-item>
        </el-col>
        <el-col :span="4" v-show="goodsType !== belongGoodsType.HYGIENIC_MATERIAL">
          <el-form-item label="医保售价" prop="ybPrice">
            <el-input-number v-model.trim="editForm.ybPrice" :controls="false" :max="99999" :min="0" :precision="4"
                             ref="ybPrice" style="width: 80%;" :disabled="!editForm.ybDrug"
                             @keyup.enter.native="editFormValidateField('ybPrice', 'approvalNum')"/>
            <span>&nbsp;&nbsp;元</span>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="批准文号" prop="approvalNum">
            <el-input v-model.trim="editForm.approvalNum" ref="approvalNum"
                      @keyup.enter.native="editFormValidateField('approvalNum', 'approvalNumExpiryDate')"/>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="批准文号效期" prop="approvalNumExpiryDate">
            <el-date-picker
              ref="approvalNumExpiryDate"
              v-model="editForm.approvalNumExpiryDate"
              type="date"
              placeholder="选择日期"
              value-format="yyyy-MM-dd"
              style="width: 100%;"/> <!--:picker-options="pickerOptions"-->
          </el-form-item>
        </el-col>
      </el-row>

    </el-form>
  </el-dialog>
</template>

<script>
import {getPyCode} from '../../../../common/py'

export default {
  props: {
    title: {
      type: String,
      required: true
    },
    goodsType: {
      type: Number,
      required: true
    },
    action: {
      type: String,
      required: true
    },
    row: {
      type: Object,
      required: true
    },
    visible: {
      type: Boolean,
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
  }, // end props

  data () {
    let splitValidate = (rule, value, callback) => {
      if (this.editForm.splitable && !value) {
        callback(new Error('不能为空'))
      } else {
        callback()
      }
    }

    /*
    let splitPriceValidate = (rule, value, callback) => {
      if (this.editForm.splitable) {
        let splitPrice = (this.editForm.retailPrice / this.editForm.splitQuantity) // .toFixed(5)
        splitPrice = Math.ceil(splitPrice * 10000) / 10000
        if (value < splitPrice) {
          callback(new Error('拆零单价不能低于 ' + splitPrice))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }
    */

    let westernDrugsValidate = (rule, value, callback) => {
      if (this.goodsType === this.belongGoodsType.WESTERN_DRUGS && !value) {
        callback(new Error('不能为空'))
      } else {
        callback()
      }
    }

    let approvalNumValidate = (rule, value, callback) => {
      if (!this.editForm.approvalNum && this.editForm.approvalNumExpiryDate) {
        callback(new Error('批准文号不能为空'))
      } else {
        callback()
      }
    }

    let approvalNumExpiryDateValidate = (rule, value, callback) => {
      if (this.editForm.approvalNum && !this.editForm.approvalNumExpiryDate) {
        callback(new Error('批准文号效期不能为空'))
      } else {
        callback()
      }
    }

    return {
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() < Date.now()
        }
      },
      belongGoodsType: this.$store.getters.goodsType, // 属于哪个商品类型
      dialog: {
        url: '',
        method: '',
        editable: true
      },
      editForm: {
        id: null,
        oid: '',
        name: '',
        code: '',
        spName: '',
        spCode: '',
        specs: '',
        goodsUnitsId: '',
        goodsClassifyId: '',
        sysSecondClassifyId: '',
        barcode: '',
        manufacturerId: '',
        originId: '',
        billingTypeId: '',
        retailPrice: 0,
        profitCommissionRate: 0,
        purchaseTaxRate: 0,
        sellTaxRate: 0,
        minPurchaseQuantity: 1,
        sellClassifyId: '',
        discountable: true,
        returnable: true,
        freeGoods: false,
        lossable: false,
        state: true,
        splitable: false,
        splitQuantity: 1,
        splitUnitsId: '',
        splitPrice: 0,
        doseTypeId: '',
        dose: 1,
        doseUnitsId: '',
        specialDrugId: '',
        drugUsageId: '',
        odored: false,
        storageTemperatureId: '',
        conservationDays: 0,
        prescription: false,
        // prescriptionTypeId: '',
        ybDrug: false,
        ybOid: '',
        ybPrice: 0,
        approvalNum: '',
        approvalNumExpiryDate: ''
      },
      editFormRules: {
        oid: [
          {required: true, message: '不能为空'},
          {max: 50, message: '长度不合法[1-50]'}
        ],
        name: [
          {required: true, message: '不能为空'},
          {max: 50, message: '长度不合法[1-50]'}
        ],
        code: [
          {required: true, message: '不能为空'},
          {max: 50, message: '长度不合法[1-50]'}
        ],
        specs: [
          {required: true, message: '不能为空'},
          {max: 50, message: '长度不合法[1-50]'}
        ],
        goodsUnitsId: [
          {required: true, message: '不能为空'}
        ],
        goodsClassifyId: [
          {required: true, message: '不能为空'}
        ],
        manufacturerId: [
          {required: true, message: '不能为空'}
        ],
        originId: [
          {required: true, message: '不能为空'}
        ],
        billingTypeId: [
          {required: true, message: '不能为空'}
        ],
        retailPrice: [
          {required: true, message: '不能为空'}
        ],
        profitCommissionRate: [
          {required: true, message: '不能为空'}
        ],
        purchaseTaxRate: [
          {required: true, message: '不能为空'}
        ],
        sellTaxRate: [
          {required: true, message: '不能为空'}
        ],
        splitQuantity: [
          {validator: splitValidate, trigger: 'blur'}
        ],
        splitUnitsId: [
          {validator: splitValidate, trigger: 'blur'}
        ],
        /*
        splitPrice: [
          {validator: splitPriceValidate, trigger: 'blur'}
        ],
        */
        doseTypeId: [
          {validator: westernDrugsValidate, trigger: 'blur'}
        ],
        dose: [
          {validator: westernDrugsValidate, trigger: 'blur'}
        ],
        doseUnitsId: [
          {validator: westernDrugsValidate, trigger: 'blur'}
        ],
        drugUsageId: [
          {validator: westernDrugsValidate, trigger: 'blur'}
        ],
        approvalNum: [
          {validator: westernDrugsValidate, trigger: 'blur'},
          {validator: approvalNumValidate, trigger: 'blur'}
        ],
        approvalNumExpiryDate: [
          {validator: westernDrugsValidate, trigger: 'blur'},
          {validator: approvalNumExpiryDateValidate, trigger: 'blur'}
        ]
      },
      select: {
        loading: false,
        manufacturers: [],
        secondClassifyList: []
      }
    }
  },

  computed: {
    goodsUnitsList: function () {
      return this.$store.getters.goodsUnitsList
    },
    goodsClassifyList: function () {
      return this.$store.getters.goodsClassifyList
    },
    billingTypeList: function () {
      return this.$store.getters.billingTypeList
    },
    originList: function () {
      return this.$store.getters.originList
    },
    sellClassifyList: function () {
      return this.$store.getters.sellClassifyList
    },
    doseTypeList: function () {
      return this.$store.getters.doseTypeList
    },
    doseUnitsList: function () {
      return this.$store.getters.doseUnitsList
    },
    specialDrugList: function () {
      return this.$store.getters.specialDrugList
    },
    drugUsageList: function () {
      return this.$store.getters.drugUsageList
    },
    storageTemperatureList: function () {
      return this.$store.getters.storageTemperatureList
    },
    prescriptionTypeList: function () {
      return this.$store.getters.prescriptionTypeList
    }
  },

  methods: {
    /* -------------------------------------------------------------------------------------------------------------- */
    dialogOpened () {
      let row = this.row
      if (row.id) {
        for (let key in this.editForm) {
          if (this.editForm.hasOwnProperty(key) && row[key] !== undefined) {
            this.editForm[key] = row[key]
          }
        }
        this.editFormQueryManufacturer(row.manufacturerName) // 发起检索查询
        this.loadSecondClassifyList(row.goodsClassifyId) // 发起检索查询
        this.dialog.editable = false
        this.dialog.url = `/chisAPI/${this.action}/update`
        this.dialog.method = 'PUT'
      } else {
        this.dialog.editable = true
        this.dialog.url = `/chisAPI/${this.action}/save`
        this.dialog.method = 'POST'
      }
    },

    dialogClosed () {
      this.$refs.editForm.resetFields()
      this.select.manufacturers = []
      this.select.secondClassifyList = []
    },

    editFormValidateField (currentProp, nextRef) {
      this.$refs.editForm.validateField(currentProp, (valid) => {
        if (!valid) {
          this.$refs[nextRef].focus()
        } else {
          return false
        }
      })
    },

    editFormSetPyCode (nameProp, codeProp) {
      this.editForm[codeProp] = getPyCode(this.editForm[nameProp])
    },

    /**
     * 当商品分类发生改变时执行的操作
     */
    goodsClassifyIdChange (id) {
      // 重置当前二级分类ID
      this.editForm.sysSecondClassifyId = ''
      // 发起查询
      this.loadSecondClassifyList(id)
    },

    /**
     * 载入二级分类
     * @param goodsClassifyId
     */
    loadSecondClassifyList (goodsClassifyId) {
      this.$loading()
      const url = '/chisAPI/secondClassify/getEnabledByGoodsClassifyId'
      let params = {goodsClassifyId}
      this.$http.get(url, {params}).then((res) => {
        if (res.data.code === 200) {
          this.select.secondClassifyList = res.data.resultSet.list
        }
        this.$loading().close()
      })
    },

    /**
     * 检索生产厂家
     * @param name
     */
    editFormQueryManufacturer (name) {
      if (name.trim()) {
        this.select.loading = true
        // 做一个0.5秒的延迟查询, 避免用户输入速度过慢时的频发查询
        setTimeout(() => {
          const url = `/chisAPI/manufacturer/getEnabledLikeByName`
          let params = {
            name: name
          }
          this.$http.get(url, {params}).then((res) => {
            this.select.manufacturers = res.data
            this.select.loading = false
          })
        }, (this.select.manufacturers ? 0 : 500)) // 当查询结果不为0时, 才会有 0.5 秒的延迟查询
      }
    },

    /**
     * 当可拆零属性发生改变时执行的内容
     */
    editFormSplitableChange () {
      if (this.editForm.splitable && this.editForm.retailPrice > 0 && this.editForm.splitQuantity > 0) {
        /*
        if (this.editForm.splitUnitsId === '') {
          this.editForm.splitUnitsId = this.editForm.goodsUnitsId
        }
        */
        let splitPrice = (this.editForm.retailPrice / this.editForm.splitQuantity) // .toFixed(5)
        this.editForm.splitPrice = Math.ceil(splitPrice * 10000) / 10000
      } else {
        this.editForm.splitQuantity = 1
        this.editForm.splitUnitsId = ''
        this.editForm.splitPrice = 0
      }
    },

    /**
     * 提交数据
     */
    editFormSubmit () {
      this.$refs.editForm.validate((valid) => {
        if (!valid) {
          return false
        }
        this.$loading()
        let url = this.dialog.url
        let method = this.dialog.method
        let params = this.editForm

        this.$http({method, url, params}).then((res) => {
          if (res.data.code === 200) {
            this.$message.success(res.data.msg)
            this.dataGridLoadData()
            this.dialogClose()
          } else {
            this.$loading().close()
          }
        })
      })
    }
  }

}
</script>

<style scoped>
</style>
