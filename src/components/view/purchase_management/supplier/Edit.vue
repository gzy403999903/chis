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
        <span>供应商信息</span>
      </el-col>
      <el-col :span="12" style="text-align: right;">
        <el-button size="mini" type="primary" icon="el-icon-check" @click="editFormSubmit">提 交</el-button>
        <el-button size="mini" type="warning" icon="el-icon-right" @click="dialogClose">返 回</el-button>
      </el-col>
    </el-row>

    <!-- 编辑表单 -->
    <el-form :model="editForm" ref="editForm" :rules="editFormRules" size="small" label-width="150px">
      <el-form-item prop="id" v-show="false">
        <el-input v-model.trim="editForm.id"/>
      </el-form-item>

      <el-row>
        <el-col :span="6">
          <el-form-item label="供应商编码" prop="oid">
            <el-input v-model.trim="editForm.oid" ref="oid"
                      @keyup.enter.native="editFormValidateField('oid', 'name')"/>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="供应商名称" prop="name">
            <el-input v-model.trim="editForm.name" ref="name"
                      @keyup.enter.native="editFormValidateField('name', 'accountLicence')"
                      @blur="editFormSetPyCode('name', 'code')" @change="editFormSetPyCode('name', 'code')"/>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="助记码" prop="code">
            <el-input v-model.trim="editForm.code" ref="code"
                      @keyup.enter.native="editFormValidateField('code', 'accountLicence')"/>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="6">
          <el-form-item label="开户许可证" prop="accountLicence">
            <el-input v-model.trim="editForm.accountLicence" ref="accountLicence"
                      @keyup.enter.native="editFormValidateField('accountLicence', 'bankName')"/>
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item label="开户银行" prop="bankName">
            <el-input v-model.trim="editForm.bankName" ref="bankName"
                      @keyup.enter.native="editFormValidateField('bankName', 'cardNo')"/>
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item label="银行卡号" prop="cardNo">
            <el-input v-model.trim="editForm.cardNo" ref="cardNo"
                      @keyup.enter.native="editFormValidateField('cardNo', 'invoiceTypeId')"/>
          </el-form-item>
        </el-col>

        <!--<el-col :span="6">
          <el-form-item label="统一社会信用代码" prop="code">
          </el-form-item>
        </el-col>-->
      </el-row>

      <el-row>
        <el-col :span="6">
          <el-form-item label="发票类型" prop="invoiceTypeId">
            <el-select
              ref="invoiceTypeId"
              @keyup.enter.native="editFormValidateField('invoiceTypeId', 'paymentTypeId')"
              v-model.trim="editForm.invoiceTypeId"
              filterable
              placeholder="请选择">
              <el-option v-for="item in invoiceTypeList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item label="结算类型" prop="paymentTypeId">
            <el-select
              ref="paymentTypeId"
              @keyup.enter.native="editFormValidateField('paymentTypeId', 'arrearagesLimit')"
              v-model.trim="editForm.paymentTypeId"
              filterable
              placeholder="请选择">
              <el-option v-for="item in paymentTypeList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item label="受限额度" prop="arrearagesLimit">
            <el-input-number v-model.trim="editForm.arrearagesLimit" :precision="0" :max="99999" :min="0" :controls="false"
                             ref="arrearagesLimit" style="width: 80%;"
                             @keyup.enter.native="editFormValidateField('arrearagesLimit', 'arrearagesDays')"/> &nbsp;&nbsp; 元
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item label="欠款天数" prop="arrearagesDays">
            <el-input-number v-model.trim="editForm.arrearagesDays" :precision="0" :max="366" :min="0" :controls="false"
                             ref="arrearagesDays" style="width: 80%;"
                             @keyup.enter.native="editFormValidateField('arrearagesDays', 'legalPerson')"/> &nbsp;&nbsp; 天
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="6">
          <el-form-item label="公司法人" prop="legalPerson">
            <el-input v-model.trim="editForm.legalPerson" ref="legalPerson"
                      @keyup.enter.native="editFormValidateField('legalPerson', 'tel')"/>
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item label="公司电话" prop="tel">
            <el-input v-model.trim="editForm.tel" ref="tel"
                      @keyup.enter.native="editFormValidateField('tel', 'fax')"/>
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item label="公司传真" prop="fax">
            <el-input v-model.trim="editForm.fax" ref="fax"
                      @keyup.enter.native="editFormValidateField('fax', 'contacter')"/>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="6">
          <el-form-item label="联系人" prop="contacter">
            <el-input v-model.trim="editForm.contacter" ref="contacter"
                      @keyup.enter.native="editFormValidateField('contacter', 'contacterPhone')"/>
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item label="联系电话" prop="contacterPhone">
            <el-input v-model.trim="editForm.contacterPhone" ref="contacterPhone"
                      @keyup.enter.native="editFormValidateField('contacterPhone', 'address')"/>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="详细地址" prop="address">
            <el-input v-model.trim="editForm.address" ref="address"
                      @keyup.enter.native="editFormValidateField('address', 'businessScope')"/>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="经营范围" prop="businessScope">
            <el-input type="textarea" v-model.trim="editForm.businessScope" ref="businessScope"
                      resize="none" :rows="4"
                      @keyup.enter.native="editFormValidateField('businessScope', 'remarks')"/>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-row>
            <el-col :span="24">
              <el-form-item label="备注" prop="remarks">
                <el-input v-model.trim="editForm.remarks" ref="remarks"/>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="24">
              <el-form-item label="启用状态" prop="state">
                <el-radio-group v-model="editForm.state">
                  <el-radio :label="true">启用</el-radio>
                  <el-radio :label="false">禁用</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
        </el-col>
      </el-row>

      <el-divider content-position="left">证照管控 &nbsp;&nbsp;&nbsp;&nbsp; 【填写 证照号码 和 效期 则对其进行管控】</el-divider>

      <el-row>
        <el-col :span="6">
          <el-form-item label="营业执照" prop="businessLicence">
            <el-input v-model.trim="editForm.businessLicence" ref="businessLicence"
                      @keyup.enter.native="editFormValidateField('businessLicence', 'blExpiryDate')"/>
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item label="营业执照效期" prop="blExpiryDate">
            <el-date-picker
              ref="blExpiryDate"
              v-model="editForm.blExpiryDate"
              type="date"
              placeholder="选择日期"
              :picker-options="pickerOptions"
              value-format="yyyy-MM-dd"
              @change="editFormPickerChange"/>
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item label="经营许可证" prop="productionLicence">
            <el-input v-model.trim="editForm.productionLicence" ref="productionLicence"
                      @keyup.enter.native="editFormValidateField('productionLicence', 'plExpiryDate')"/>
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item label="经营许可证效期" prop="plExpiryDate">
            <el-date-picker
              ref="plExpiryDate"
              v-model="editForm.plExpiryDate"
              type="date"
              placeholder="选择日期"
              value-format="yyyy-MM-dd"
              :picker-options="pickerOptions"/>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="6">
          <el-form-item label="GSP" prop="gspLicence">
            <el-input v-model.trim="editForm.gspLicence" ref="gspLicence"
                      @keyup.enter.native="editFormValidateField('gspLicence', 'gspExpiryDate')"/>
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item label="GSP效期" prop="gspExpiryDate">
            <el-date-picker
              ref="gspExpiryDate"
              v-model="editForm.gspExpiryDate"
              type="date"
              placeholder="选择日期"
              value-format="yyyy-MM-dd"
              :picker-options="pickerOptions"/>
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item label="GMP" prop="gmpLicence">
            <el-input v-model.trim="editForm.gmpLicence" ref="gmpLicence"
                      @keyup.enter.native="editFormValidateField('gmpLicence', 'gmpExpiryDate')"/>
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item label="GMP效期" prop="gmpExpiryDate">
            <el-date-picker
              ref="gmpExpiryDate"
              v-model="editForm.gmpExpiryDate"
              type="date"
              placeholder="选择日期"
              value-format="yyyy-MM-dd"
              :picker-options="pickerOptions"/>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="6">
          <el-form-item label="卫生许可证" prop="hygienicLicense">
            <el-input v-model.trim="editForm.hygienicLicense" ref="hygienicLicense"
                      @keyup.enter.native="editFormValidateField('hygienicLicense', 'hlExpiryDate')"/>
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item label="卫生许可证效期" prop="hlExpiryDate">
            <el-date-picker
              ref="hlExpiryDate"
              v-model="editForm.hlExpiryDate"
              type="date"
              placeholder="选择日期"
              value-format="yyyy-MM-dd"
              :picker-options="pickerOptions"/>
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item label="器械许可证" prop="instrumentLicence">
            <el-input v-model.trim="editForm.instrumentLicence" ref="instrumentLicence"
                      @keyup.enter.native="editFormValidateField('instrumentLicence', 'ilExpiryDate')"/>
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item label="器械许可证效期" prop="ilExpiryDate">
            <el-date-picker
              ref="ilExpiryDate"
              v-model="editForm.ilExpiryDate"
              type="date"
              placeholder="选择日期"
              value-format="yyyy-MM-dd"
              :picker-options="pickerOptions"/>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="6">
          <el-form-item label="食品经营许可证" prop="foodLicense">
            <el-input v-model.trim="editForm.foodLicense" ref="foodLicense"
                      @keyup.enter.native="editFormValidateField('foodLicense', 'flExpiryDate')"/>
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item label="食品经营许可证效期" prop="flExpiryDate">
            <el-date-picker
              ref="flExpiryDate"
              v-model="editForm.flExpiryDate"
              type="date"
              placeholder="选择日期"
              value-format="yyyy-MM-dd"
              :picker-options="pickerOptions"/>
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item label="保健食品许可证" prop="foodProductionLicence">
            <el-input v-model.trim="editForm.foodProductionLicence" ref="foodProductionLicence"
                      @keyup.enter.native="editFormValidateField('foodProductionLicence', 'fplExpiryDate')"/>
          </el-form-item>
        </el-col>

        <el-col :span="6">
          <el-form-item label="保健食品许可证效期" prop="fplExpiryDate">
            <el-date-picker
              ref="fplExpiryDate"
              v-model="editForm.fplExpiryDate"
              type="date"
              placeholder="选择日期"
              value-format="yyyy-MM-dd"
              :picker-options="pickerOptions"/>
          </el-form-item>
        </el-col>
      </el-row>

    </el-form>
  </el-dialog>
</template>

<script>
import {getPyCode} from '../../../../common/py'

export default {

  data () {
    let numberValidate = (rule, value, callback) => {
      if (value && !Number.isInteger(value * 1)) {
        callback(new Error('必须输入的是数字'))
      } else {
        callback()
      }
    }

    let businessLicenceValidate = (rule, value, callback) => {
      if (!this.editForm.businessLicence && this.editForm.blExpiryDate) {
        callback(new Error('证照号码不能为空'))
      } else {
        callback()
      }
    }

    let blExpiryDateValidate = (rule, value, callback) => {
      if (this.editForm.businessLicence && !this.editForm.blExpiryDate) {
        callback(new Error('证照日期不能为空'))
      } else {
        callback()
      }
    }

    let productionLicenceValidate = (rule, value, callback) => {
      if (!this.editForm.productionLicence && this.editForm.plExpiryDate) {
        callback(new Error('证照号码不能为空'))
      } else {
        callback()
      }
    }

    let plExpiryDateValidate = (rule, value, callback) => {
      if (this.editForm.productionLicence && !this.editForm.plExpiryDate) {
        callback(new Error('证照日期不能为空'))
      } else {
        callback()
      }
    }

    let gspLicenceValidate = (rule, value, callback) => {
      if (!this.editForm.gspLicence && this.editForm.gspExpiryDate) {
        callback(new Error('证照号码不能为空'))
      } else {
        callback()
      }
    }

    let gspExpiryDateValidate = (rule, value, callback) => {
      if (this.editForm.gspLicence && !this.editForm.gspExpiryDate) {
        callback(new Error('证照日期不能为空'))
      } else {
        callback()
      }
    }

    let gmpLicenceValidate = (rule, value, callback) => {
      if (!this.editForm.gmpLicence && this.editForm.gmpExpiryDate) {
        callback(new Error('证照号码不能为空'))
      } else {
        callback()
      }
    }

    let gmpExpiryDateValidate = (rule, value, callback) => {
      if (this.editForm.gmpLicence && !this.editForm.gmpExpiryDate) {
        callback(new Error('证照日期不能为空'))
      } else {
        callback()
      }
    }

    let hygienicLicenseValidate = (rule, value, callback) => {
      if (!this.editForm.hygienicLicense && this.editForm.hlExpiryDate) {
        callback(new Error('证照号码不能为空'))
      } else {
        callback()
      }
    }

    let hlExpiryDateValidate = (rule, value, callback) => {
      if (this.editForm.hygienicLicense && !this.editForm.hlExpiryDate) {
        callback(new Error('证照日期不能为空'))
      } else {
        callback()
      }
    }

    let instrumentLicenceValidate = (rule, value, callback) => {
      if (!this.editForm.instrumentLicence && this.editForm.ilExpiryDate) {
        callback(new Error('证照号码不能为空'))
      } else {
        callback()
      }
    }

    let ilExpiryDateValidate = (rule, value, callback) => {
      if (this.editForm.instrumentLicence && !this.editForm.ilExpiryDate) {
        callback(new Error('证照日期不能为空'))
      } else {
        callback()
      }
    }

    let foodLicenseValidate = (rule, value, callback) => {
      if (!this.editForm.foodLicense && this.editForm.flExpiryDate) {
        callback(new Error('证照号码不能为空'))
      } else {
        callback()
      }
    }

    let flExpiryDateValidate = (rule, value, callback) => {
      if (this.editForm.foodLicense && !this.editForm.flExpiryDate) {
        callback(new Error('证照日期不能为空'))
      } else {
        callback()
      }
    }

    let foodProductionLicenceValidate = (rule, value, callback) => {
      if (!this.editForm.foodProductionLicence && this.editForm.fplExpiryDate) {
        callback(new Error('证照号码不能为空'))
      } else {
        callback()
      }
    }

    let fplExpiryDateValidate = (rule, value, callback) => {
      if (this.editForm.foodProductionLicence && !this.editForm.fplExpiryDate) {
        callback(new Error('证照日期不能为空'))
      } else {
        callback()
      }
    }

    return {
      dialog: {
        url: '',
        method: ''
      },
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() < Date.now()
        }
      },
      editForm: {
        id: '',
        oid: '',
        name: '',
        code: '',
        accountLicence: '',
        bankName: '',
        cardNo: '',
        invoiceTypeId: '',
        paymentTypeId: '',
        arrearagesLimit: 0,
        arrearagesDays: 0,
        legalPerson: '',
        tel: '',
        fax: '',
        contacter: '',
        contacterPhone: '',
        address: '',
        businessScope: '',
        remarks: '',
        state: true,
        businessLicence: '',
        blExpiryDate: '',
        productionLicence: '',
        plExpiryDate: '',
        gspLicence: '',
        gspExpiryDate: '',
        gmpLicence: '',
        gmpExpiryDate: '',
        hygienicLicense: '',
        hlExpiryDate: '',
        instrumentLicence: '',
        ilExpiryDate: '',
        foodLicense: '',
        flExpiryDate: '',
        foodProductionLicence: '',
        fplExpiryDate: ''
      },
      editFormRules: {
        oid: [
          {required: true, message: '不能为空'},
          {max: 30, message: '长度不合法[1-30]'}
        ],
        name: [
          {required: true, message: '不能为空'},
          {max: 30, message: '长度不合法[1-30]'}
        ],
        code: [
          {required: true, message: '不能为空'},
          {max: 30, message: '长度不合法[1-30]'}
        ],
        accountLicence: [
          {required: true, message: '不能为空'},
          {max: 30, message: '长度不合法[1-30]'}
        ],
        bankName: [
          {required: true, message: '不能为空'},
          {max: 30, message: '长度不合法[1-30]'}
        ],
        cardNo: [
          {required: true, message: '不能为空'},
          {max: 30, message: '长度不合法[1-30]'},
          {validator: numberValidate, trigger: 'blur'}
        ],
        invoiceTypeId: [
          {required: true, message: '不能为空'}
        ],
        paymentTypeId: [
          {required: true, message: '不能为空'}
        ],
        arrearagesLimit: [
          {required: true, message: '不能为空'}
        ],
        arrearagesDays: [
          {required: true, message: '不能为空'}
        ],
        legalPerson: [
          {required: true, message: '不能为空'},
          {max: 10, message: '长度不合法[1-10]'}
        ],
        tel: [
          {required: true, message: '不能为空'},
          {max: 15, message: '长度不合法[1-15]'}
          /* {validator: numberValidate, trigger: 'blur'} */
        ],
        fax: [
          {max: 15, message: '长度不合法[1-15]'}
          /* {validator: numberValidate, trigger: 'blur'} */
        ],
        contacter: [
          {required: true, message: '不能为空'},
          {max: 10, message: '长度不合法[1-10]'}
        ],
        contacterPhone: [
          {required: true, message: '不能为空'},
          {max: 15, message: '长度不合法[1-15]'}
          /* {validator: numberValidate, trigger: 'blur'} */
        ],
        address: [
          {required: true, message: '不能为空'},
          {max: 50, message: '长度不合法[1-50]'}
        ],
        businessScope: [
          {required: true, message: '不能为空'},
          {max: 300, message: '长度不合法[1-300]'}
        ],
        remarks: [
          {max: 100, message: '长度不合法[1-100]'}
        ],
        businessLicence: [
          {required: true, message: '不能为空'},
          {max: 30, message: '长度不合法[1-30]'},
          {validator: businessLicenceValidate, trigger: 'blur'}
        ],
        blExpiryDate: [
          {required: true, message: '不能为空'},
          {validator: blExpiryDateValidate, trigger: 'blur'}
        ],
        productionLicence: [
          {max: 30, message: '长度不合法[1-30]'},
          {validator: productionLicenceValidate, trigger: 'blur'}
        ],
        plExpiryDate: [
          {validator: plExpiryDateValidate, trigger: 'blur'}
        ],
        gspLicence: [
          {max: 30, message: '长度不合法[1-30]'},
          {validator: gspLicenceValidate, trigger: 'blur'}
        ],
        gspExpiryDate: [
          {validator: gspExpiryDateValidate, trigger: 'blur'}
        ],
        gmpLicence: [
          {max: 30, message: '长度不合法[1-30]'},
          {validator: gmpLicenceValidate, trigger: 'blur'}
        ],
        gmpExpiryDate: [
          {validator: gmpExpiryDateValidate, trigger: 'blur'}
        ],
        hygienicLicense: [
          {max: 30, message: '长度不合法[1-30]'},
          {validator: hygienicLicenseValidate, trigger: 'blur'}
        ],
        hlExpiryDate: [
          {validator: hlExpiryDateValidate, trigger: 'blur'}
        ],
        instrumentLicence: [
          {max: 30, message: '长度不合法[1-30]'},
          {validator: instrumentLicenceValidate, trigger: 'blur'}
        ],
        ilExpiryDate: [
          {validator: ilExpiryDateValidate, trigger: 'blur'}
        ],
        foodLicense: [
          {max: 30, message: '长度不合法[1-30]'},
          {validator: foodLicenseValidate, trigger: 'blur'}
        ],
        flExpiryDate: [
          {validator: flExpiryDateValidate, trigger: 'blur'}
        ],
        foodProductionLicence: [
          {max: 30, message: '长度不合法[1-30]'},
          {validator: foodProductionLicenceValidate, trigger: 'blur'}
        ],
        fplExpiryDate: [
          {validator: fplExpiryDateValidate, trigger: 'blur'}
        ]
      }
    }
  },

  props: {
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
  },

  computed: {
    invoiceTypeList: function () {
      return this.$store.getters.invoiceTypeList
    },
    paymentTypeList: function () {
      return this.$store.getters.paymentTypeList
    }
  },

  methods: {

    /* -------------------------------------------------------------------------------------------------------------- */
    dialogOpened () {
      let row = this.row
      if (row.id) {
        for (let key in this.editForm) {
          if (row[key] !== undefined) {
            this.editForm[key] = row[key]
          }
        }
        this.dialog.url = `/chisAPI/supplier/update`
        this.dialog.method = 'PUT'
      } else {
        this.dialog.url = `/chisAPI/supplier/save`
        this.dialog.method = 'POST'
      }
    },
    dialogClosed () {
      this.$refs.editForm.resetFields()
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
    editFormPickerChange (date) {
      if (!date) {
        return ''
      }
    },
    editFormValueNullToEmpty () {
      for (let key in this.editForm) {
        if (!this.editForm[key]) {
          this.editForm[key] = ''
        }
      }
    },
    editFormSubmit () {
      this.$refs.editForm.validate((valid) => {
        if (valid) {
          this.$loading()
          let url = this.dialog.url
          let method = this.dialog.method
          this.editFormValueNullToEmpty() // 将 editForm 中值为 null 转成空串 使后台识别空日期类型
          let params = this.editForm

          this.$http({method, url, params}).then((res) => {
            if (res.data.code === 200) {
              this.$message.success(res.data.msg)
              this.dataGridLoadData()
              this.dialogClose()
            } else {
              this.$message.error(res.data.msg)
              this.$loading().close()
            }
          })
        } else {
          return false
        }
      })
    }
  }
}
</script>

<style scoped>
</style>
