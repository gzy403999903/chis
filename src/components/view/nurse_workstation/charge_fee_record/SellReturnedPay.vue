<template>
  <!-- append-to-body 防止遮罩层在界面上边 -->
  <el-dialog
    width="60%"
    append-to-body
    :show-close="false"
    :close-on-click-modal="false"
    :visible="visible"
    @opened="dialogOpened"
    @closed="dialogClosed">

    <!-- 模态框标题栏与功能按钮 -->
    <el-row slot="title">
      <el-col :span="5" style="font-size: 20px;">
        <span>退费结算</span>
      </el-col>
      <el-col :span="19" style="text-align: right;">
        <span style="font-size: 14px; font-weight: 600; padding-right: 10px;">
          强退收费项目
          <el-switch v-model="neglectQuantity" active-color="#13ce66" inactive-color="#ff4949"/>
        </span>
        <el-button size="mini" type="danger" icon="el-icon-check" @click="submitData">提 交</el-button>
        <el-button size="mini" type="warning" icon="el-icon-right" @click="dialogClose">返 回</el-button>
      </el-col>
    </el-row>

    <!-- 付款方式 -->
    <el-form :model="editForm" ref="editForm" :rules="editFormRules" size="mini" label-width="80px" :show-message="false">
      <el-row class="pay-info">
        <el-col :span="5">
          <el-form-item label="会员编码">
            {{sellRecordData.length > 0 ? sellRecordData[0].mrmMemberOid : ''}}
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item label="会员姓名">
            {{sellRecordData.length > 0 ? sellRecordData[0].mrmMemberName : ''}}
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="联系电话">
            {{sellRecordData.length > 0 ? sellRecordData[0].phone : ''}}
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="本次积分">
            {{computePoints()}}
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="可用余额">
            {{(memberAvailableBalance + editForm.memberBalance).toFixed(2)}}
          </el-form-item>
        </el-col>
      </el-row> <!-- end pay-info -->

      <hr/>

      <el-row>
        <el-col :span="11">
          <div class="amount-info">应退金额: {{totalPrice}}&nbsp;元</div>
          <div class="amount-info">实退金额: {{editForm.actualAmount}}&nbsp;元</div>
          <div :class="disparityAmountStyle">实退差额: {{editForm.disparityAmount}}&nbsp;元</div>
          <div v-show="neglectQuantity" style="position: relative; top: 50px;">
            <b style="color: red;">提示:</b>
            强退收费项目开启后, 在收费项目销售数量与剩余执行次数不相等时也可进行退费, 且提交后会将剩余执行次数重置为 0 ,
            请务必在退费前核对对应收费项目剩余执行次数, 以便退费后进行补收操作....
          </div>
        </el-col> <!-- end col span 11 -->

        <el-col :span="13" class="payment">
          <div>
            <el-form-item label="现金" prop="cash">
              <el-input-number v-model="editForm.cash" :controls="false" :max="99999" :min="0" :precision="2"
                               ref="cash"
                               @keyup.enter.native="editFormValidateToNextFocus('cash', 'unionpay')"
                               @change="sumActualAmount"/>
            </el-form-item>
            <el-form-item label="银联" prop="unionpay">
              <el-input-number v-model="editForm.unionpay" :controls="false" :max="99999" :min="0" :precision="2"
                               ref="unionpay"
                               @keyup.enter.native="editFormValidateToNextFocus('unionpay', 'wechatpay')"
                               @change="sumActualAmount"/>
            </el-form-item>
            <el-form-item label="微信" prop="wechatpay">
              <el-input-number v-model="editForm.wechatpay" :controls="false" :max="99999" :min="0" :precision="2"
                               ref="wechatpay"
                               @keyup.enter.native="editFormValidateToNextFocus('wechatpay', 'alipay')"
                               @change="sumActualAmount"/>
            </el-form-item>
            <el-form-item label="支付宝" prop="alipay">
              <el-input-number v-model="editForm.alipay" :controls="false" :max="99999" :min="0" :precision="2"
                               ref="alipay"
                               @keyup.enter.native="editFormValidateToNextFocus('alipay', 'cmedicare')"
                               @change="sumActualAmount"/>
            </el-form-item>
            <el-form-item label="市医保" prop="cmedicare">
              <el-input-number v-model="editForm.cmedicare" :controls="false" :max="99999" :min="0" :precision="2"
                               ref="cmedicare"
                               @keyup.enter.native="editFormValidateToNextFocus('cmedicare', 'pmedicare')"
                               @change="sumActualAmount"/>
            </el-form-item>
            <el-form-item label="省医保" prop="pmedicare">
              <el-input-number v-model="editForm.pmedicare" :controls="false" :max="99999" :min="0" :precision="2"
                               ref="pmedicare"
                               @keyup.enter.native="editFormValidateToNextFocus('pmedicare', 'memberBalance')"
                               @change="sumActualAmount"/>
            </el-form-item>
            <el-form-item label="会员卡" prop="memberBalance">
              <el-input-number v-model="editForm.memberBalance" :controls="false" :max="99999" :min="0" :precision="2"
                               ref="memberBalance"
                               @keyup.enter.native="editFormValidateToNextFocus('memberBalance', 'cash')"
                               @change="sumActualAmount"/>
            </el-form-item>
          </div>

          <div style="margin-left: 10px;">
            <div style="border: #67CDA6 dashed 1px; padding: 5px;">
              <el-form-item label="信用卡" prop="creditpay">
                <el-input-number v-model="editForm.creditpay" :controls="false" :max="99999" :min="0" :precision="2"
                                 ref="creditpay" disabled
                                 @change="sumActualAmount"/>
              </el-form-item>
            </div>
            <div style="border: #67CDA6 dashed 1px; padding: 5px; margin-top: 12px;">
              <el-form-item label="抵扣券" prop="couponNum">
                <el-input v-model="editForm.couponNum" placeholder="请输入编号" disabled/>
              </el-form-item>
              <el-form-item prop="coupon">
                <el-input-number v-model="editForm.coupon" :controls="false" :max="99999" :min="0" :precision="2"
                                 @change="sumActualAmount"/>
              </el-form-item>
            </div>
            <div style="border: #67CDA6 dashed 1px; padding: 5px; margin-top: 12px;">
              <el-form-item label="其他方式" prop="sysPaymentWayId">
                <el-select
                  ref="sysPaymentWayId"
                  @keyup.enter.native="editFormValidateToNextFocus('sysPaymentWayId', 'sysPaymentWayAmount')"
                  v-model.trim="editForm.sysPaymentWayId"
                  filterable
                  default-first-option
                  placeholder="请选择">
                  <el-option v-for="item in paymentWayList" :key="item.id" :value="item.id" :label="item.name"/>
                </el-select>
              </el-form-item>
              <el-form-item prop="sysPaymentWayAmount">
                <el-input-number v-model="editForm.sysPaymentWayAmount" :disabled="editForm.sysPaymentWayId === ''" :controls="false" :max="99999" :min="0" :precision="2"
                                 ref="sysPaymentWayAmount"
                                 @change="sumActualAmount"/>
              </el-form-item>
            </div>
          </div>
        </el-col> <!-- end col span 13 -->
      </el-row>
    </el-form>

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
    totalPrice: {
      type: Number,
      required: true
    },
    sellRecordData: {
      type: Array,
      required: true
    },
    dialogClose: {
      type: Function,
      required: true
    },
    allDialogClose: {
      type: Function,
      required: true
    }
  },

  data () {
    return {
      sellType: this.$store.getters.sellType,
      neglectQuantity: false, // 是否忽略数量
      memberAvailableBalance: 0, // 会员可用余额
      paymentAmount: 0, // 单次消费金额满多少元积1分
      disparityAmountStyle: 'amount-info amount-info-green', // 差额 class 样式
      editForm: {
        cash: 0, // 现金
        unionpay: 0, // 银联
        wechatpay: 0, // 微信
        alipay: 0, // 支付宝
        cmedicare: 0, // 市医保
        pmedicare: 0, // 省医保
        memberBalance: 0, // 会员卡

        creditpay: 0, // 信用卡
        couponNum: '', // 抵扣券编号
        coupon: 0, // 抵扣券(优惠券)
        sysPaymentWayId: '', // 其他方式ID
        sysPaymentWayAmount: 0, // 其他方式金额

        actualAmount: 0, // 实收金额
        cashBackAmount: 0, // 现金找零金额
        disparityAmount: 0 // 差额
      },
      editFormRules: {
        cash: [
          {required: true, message: '不能为空'}
        ],
        unionpay: [
          {required: true, message: '不能为空'}
        ],
        wechatpay: [
          {required: true, message: '不能为空'}
        ],
        alipay: [
          {required: true, message: '不能为空'}
        ],
        cmedicare: [
          {required: true, message: '不能为空'}
        ],
        pmedicare: [
          {required: true, message: '不能为空'}
        ],
        memberBalance: [
          {required: true, message: '不能为空'}
        ],
        creditpay: [
          {required: true, message: '不能为空'}
        ],
        coupon: [
          {required: true, message: '不能为空'}
        ],
        sysPaymentWayAmount: [
          {required: true, message: '不能为空'}
        ]
      },
      dataGrid: {
        data: [],
        currentRow: {}
      },
      dialog: {
        visible: false
      }
    }
  }, // end data

  computed: {
    paymentWayList: function () {
      return this.$store.getters.paymentWayList
    }
  }, // end computed

  methods: {
    /**
     * 界面打开后执行的操作
     */
    dialogOpened () {
      if (this.mrmMemberId) {
        this.loadMember() // 载入会员
      }
    },

    /**
     * 界面关闭后执行的操作
     */
    dialogClosed () {
      this.neglectQuantity = false // 初始化是否忽略数量状态
      this.memberAvailableBalance = 0 // 初始化会员可用金额
      this.paymentAmount = 0 // 初始化消费金额
      this.disparityAmountStyle = 'amount-info amount-info-green' // 初始化差额样式

      this.$refs.editForm.resetFields() // 初始化表单
      this.editForm.actualAmount = 0 // 初始化实收金额
      this.editForm.cashBackAmount = 0 // 初始化找零金额
      this.editForm.disparityAmount = 0 // 初始化差额
    },

    /**
     * 载入会员信息
     */
    loadMember () {
      this.$loading()
      const url = '/chisAPI/member/getByIdForTreatment'
      let params = {id: this.mrmMemberId}
      this.$http.get(url, {params}).then((res) => {
        if (res.data.code === 200) {
          let member = res.data.resultSet.member
          this.memberAvailableBalance = member.balance
          this.paymentAmount = member.paymentAmount
        }
        this.$loading().close()
      })
    },

    /**
     * 计算本次增加积分
     */
    computePoints () {
      if (this.totalPrice === 0 || this.paymentAmount === 0) {
        return 0
      }
      // return Math.floor(this.totalPrice / this.paymentAmount * -1) // -0.4 return 1
      return Math.floor(this.totalPrice / this.paymentAmount) * -1 // -0.4 return 0
    },

    /**
     * 验证通过获取下个焦点
     */
    editFormValidateToNextFocus (currentProp, nextRef) {
      this.$refs.editForm.validateField(currentProp, (valid) => {
        if (!valid) {
          this.$refs[nextRef].focus()
        }
      })
    },

    /**
     * 计算实收金额
     */
    sumActualAmount () {
      this.$refs.editForm.validate((valid) => {
        // 验证表单
        if (!valid) {
          return false
        }

        // 将所有收费方式金额累加得到 实收金额
        this.editForm.actualAmount = this.editForm.cash +
                                    this.editForm.unionpay +
                                    this.editForm.wechatpay +
                                    this.editForm.alipay +
                                    this.editForm.cmedicare +
                                    this.editForm.pmedicare +
                                    this.editForm.memberBalance +
                                    this.editForm.creditpay +
                                    this.editForm.coupon +
                                    this.editForm.sysPaymentWayAmount

        // 约束2位小数
        this.editForm.actualAmount = (this.editForm.actualAmount).toFixed(2) * 1

        // 差额为
        this.editForm.disparityAmount = (this.editForm.actualAmount - this.totalPrice).toFixed(2)
        // 如果差额在合理范围则显示绿色
        if (Math.abs(this.editForm.disparityAmount) < 0.1) {
          this.disparityAmountStyle = 'amount-info amount-info-green'
        } else {
          this.disparityAmountStyle = 'amount-info amount-info-red'
        }
      })
    },

    /**
     * 提交数据
     */
    submitData () {
      this.$refs.editForm.validate((valid) => {
        // 验证表单
        if (!valid) {
          return false
        }
        // 验证实收金额是否为 0
        if (this.totalPrice !== 0 && this.editForm.actualAmount === 0) {
          this.$message.error('实退金额不能为 0 ')
          return false
        }
        // 验证差额的绝对值是否在合理范围
        if (Math.abs(this.editForm.disparityAmount) > 0.09) {
          this.$message.error('退费金额不在合理范围')
          return false
        }

        // 提交数据
        this.$loading()
        const url = '/chisAPI/chargeFee/saveForReturned'
        const method = 'POST'

        // 将退费金额换成负数
        let paymentRecord = {}
        for (let key in this.editForm) {
          if (this.editForm.hasOwnProperty(key)) {
            if (key === 'sysPaymentWayId' || key === 'couponNum') {
              paymentRecord[key] = this.editForm[key]
            } else {
              paymentRecord[key] = this.editForm[key] * -1
            }
          }
        }

        let data = {
          mrmMemberId: this.mrmMemberId, // 会员ID
          neglectQuantity: this.neglectQuantity, // 是否忽略数量
          paymentRecordJson: JSON.stringify(paymentRecord), // 支付记录JSON
          sellRecordJson: JSON.stringify(this.sellRecordData) // 销售记录JSON
        }

        this.$http({method, url, data}).then((res) => {
          if (res.data.code === 200) {
            this.$message.success(res.data.msg)
            this.allDialogClose()
          } else {
            this.$loading().close()
          }
        })
      })
    }

  } // end methods
}
</script>

<style scoped>
  .pay-info .el-form-item {
    height: 15px;
  }

  .payment {
    display: flex;
  }
  .payment .el-form-item {
    height: 15px;
  }

  hr {
    border: #3AA878 solid 1px;
    margin-bottom: 25px;
  }

  .amount-info {
    font-size: 18px;
    font-weight: 600;
    padding-bottom: 10px;
  }
  .amount-info-red {
    color: #F56C6C;
  }

  .amount-info-green {
    color: #67C23A;
  }
</style>
