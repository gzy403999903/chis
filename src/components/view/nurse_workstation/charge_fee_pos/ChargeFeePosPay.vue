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
        <span>POS结算</span>
      </el-col>
      <el-col :span="19" style="text-align: right;">
        <span style="font-size: 14px; font-weight: 600; padding-right: 10px;">
          <el-switch v-model="openPrint" active-color="#13ce66" inactive-color="#ff4949"/>
          {{openPrint ? '打印已开启' : '打印已关闭'}}
        </span>
        <el-button size="mini" type="primary" icon="el-icon-check" @click="submitData">提 交</el-button>
        <el-button size="mini" type="warning" icon="el-icon-right" @click="dialogClose">返 回</el-button>
      </el-col>
    </el-row>

    <!-- 付款方式 -->
    <el-form :model="editForm" ref="editForm" :rules="editFormRules" size="small" label-width="80px">
      <el-row>
        <el-col :span="16" class="pay-info">
          <el-row>
            <el-col :span="8">
              <el-form-item label="会员编码">
                {{member.oid}}
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="会员姓名">
                {{member.name}}
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="联系电话">
                {{member.phone}}
              </el-form-item>
            </el-col>
          </el-row>
          <hr/>

          <el-row>
            <el-col :span="8">
              <el-form-item label="本次积分">
                {{computePoints()}}
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="可用余额">
                {{memberAvailableBalance}}
              </el-form-item>
            </el-col>
          </el-row>
          <hr/>

          <div class="amount-info">应收金额: {{totalPrice}}&nbsp;元</div>
          <div class="amount-info">实收金额: {{editForm.actualAmount}}&nbsp;元</div>
          <div class="amount-info amount-info-red">现金找零: {{editForm.cashBackAmount}}&nbsp;元</div>
          <div :class="disparityAmountStyle">实收差额: {{editForm.disparityAmount}}&nbsp;元</div>
        </el-col>

        <el-col :span="8">
          <el-form-item label="现金" prop="cash">
            <el-input-number v-model="editForm.cash" :controls="false" :max="99999" :min="0" :precision="2"
                             ref="cash"
                             @keyup.enter.native="editFormValidateToNextFocus('cash', 'memberBalance')"
                             @change="sumActualAmount"/>
          </el-form-item>
          <el-form-item label="会员卡" prop="memberBalance">
            <el-input-number v-model="editForm.memberBalance" :controls="false" :max="99999" :min="0" :precision="2"
                             ref="memberBalance" :disabled="!member.id"
                             @keyup.enter.native="editFormValidateToNextFocus('memberBalance', 'unionpay')"
                             @change="sumActualAmount"/>
          </el-form-item>
          <el-form-item label="银联" prop="unionpay">
            <el-input-number v-model="editForm.unionpay" :controls="false" :max="99999" :min="0" :precision="2"
                             ref="unionpay"
                             @keyup.enter.native="editFormValidateToNextFocus('unionpay', 'alipay')"
                             @change="sumActualAmount"/>
          </el-form-item>
          <el-form-item label="支付宝" prop="alipay">
            <el-input-number v-model="editForm.alipay" :controls="false" :max="99999" :min="0" :precision="2"
                             ref="alipay"
                             @keyup.enter.native="editFormValidateToNextFocus('alipay', 'wechatpay')"
                             @change="sumActualAmount"/>
          </el-form-item>
          <el-form-item label="微信" prop="wechatpay">
            <el-input-number v-model="editForm.wechatpay" :controls="false" :max="99999" :min="0" :precision="2"
                             ref="wechatpay"
                             @keyup.enter.native="editFormValidateToNextFocus('wechatpay', 'sysPaymentWayId')"
                             @change="sumActualAmount"/>
          </el-form-item>
          <el-form-item label="" prop="sysPaymentWayId">
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
        </el-col>

      </el-row>
    </el-form>

    <!-- 消费小票打印 (必须声明组件才可以调用 pubsub) -->
    <ChargeFeeBill :lsh="lsh" :sellRecordList="sellRecordList" :payment="editForm" :points="computePoints()"/>
  </el-dialog>
</template>

<script>
import ChargeFeeBill from '../../print_page/ChargeFeeBill'
import PubSub from 'pubsub-js'
export default {
  components: {
    ChargeFeeBill
  },

  props: {
    visible: {
      type: Boolean,
      required: true
    },
    member: {
      type: Object,
      required: true
    },
    totalPrice: {
      type: Number,
      required: true
    },
    sellRecordList: {
      type: Array,
      required: true
    },
    dialogClose: {
      type: Function,
      required: true
    },
    pageReset: {
      type: Function,
      required: true
    }
  },

  data () {
    let validateMemberBalance = (rule, value, callback) => {
      if (value > this.memberAvailableBalance) {
        callback(new Error('余额不足'))
      } else {
        callback()
      }
    }

    return {
      sellType: this.$store.getters.sellType,
      memberAvailableBalance: 0, // 会员可用余额
      paymentAmount: 0, // 单次消费金额满多少元积1分
      disparityAmountStyle: 'amount-info amount-info-green', // 差额 class 样式
      openPrint: true, // 开启打印
      lsh: '', // 结账成功后返回的流水号
      editForm: {
        cash: 0, // 现金
        memberBalance: 0, // 会员卡
        unionpay: 0, // 银联
        alipay: 0, // 支付宝
        wechatpay: 0, // 微信
        sysPaymentWayId: '', // 付款方式ID
        sysPaymentWayAmount: 0, // 付款方式金额
        actualAmount: 0, // 实收金额 ~
        cashBackAmount: 0, // 现金找零金额 ~
        disparityAmount: 0 // 差额 ~
      },
      editFormRules: {
        cash: [
          {required: true, message: '不能为空'}
        ],
        memberBalance: [
          {required: true, message: '不能为空'},
          {validator: validateMemberBalance, trigger: 'blur'}
        ],
        unionpay: [
          {required: true, message: '不能为空'}
        ],
        alipay: [
          {required: true, message: '不能为空'}
        ],
        wechatpay: [
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
      if (this.member.id) {
        this.memberAvailableBalance = this.member.balance
        this.paymentAmount = this.member.paymentAmount
      }
    },

    /**
     * 界面关闭后执行的操作
     */
    dialogClosed () {
      this.memberAvailableBalance = 0 // 初始化会员可用金额
      this.paymentAmount = 0 // 初始化消费金额
      this.disparityAmountStyle = 'amount-info amount-info-green' // 初始化差额样式

      this.$refs.editForm.resetFields() // 初始化表单
      this.editForm.actualAmount = 0 // 初始化实收金额
      this.editForm.cashBackAmount = 0 // 初始化找零金额
      this.editForm.disparityAmount = 0 // 初始化差额
    },

    /**
     * 计算本次增加积分
     */
    computePoints () {
      if (this.totalPrice === 0 || this.paymentAmount === 0) {
        return 0
      }
      return Math.floor(this.totalPrice / this.paymentAmount)
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
                                    this.editForm.memberBalance +
                                    this.editForm.unionpay +
                                    this.editForm.alipay +
                                    this.editForm.wechatpay +
                                    this.editForm.sysPaymentWayAmount
        // 约束2位小数
        this.editForm.actualAmount = (this.editForm.actualAmount).toFixed(2) * 1

        // 除去现金 如果实收金额大于应收金额
        if ((this.editForm.actualAmount - this.totalPrice - this.editForm.cash) > 0) {
          // 现金找零为
          this.editForm.cashBackAmount = this.editForm.cash
          // 实收金额为
          this.editForm.actualAmount = (this.editForm.actualAmount - this.editForm.cash).toFixed(2)

          // 包含现金 如果实收金额大于应收金额
        } else if ((this.editForm.actualAmount - this.totalPrice) > 0) {
          // 现金找零为
          this.editForm.cashBackAmount = (this.editForm.actualAmount - this.totalPrice).toFixed(1)
          // 实收金额为
          this.editForm.actualAmount = (this.editForm.actualAmount - this.editForm.cashBackAmount).toFixed(2)

          // 以上条件不满足设置找零金额为 0
        } else {
          this.editForm.cashBackAmount = 0
        }
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
          this.$message.error('实收金额不能为 0 ')
          return false
        }
        // 验证差额的绝对值是否在合理范围
        if (Math.abs(this.editForm.disparityAmount) > 0.09) {
          this.$message.error('收费金额不在合理范围')
          return false
        }

        // 提交数据
        this.$loading()
        const url = '/chisAPI/chargeFee/saveForPos'
        const method = 'POST'

        let data = {
          mrmMemberId: this.member.id, // 会员ID
          paymentRecordJson: JSON.stringify(this.editForm), // 支付记录JSON
          sellRecordJson: JSON.stringify(this.sellRecordList) // 销售记录JSON
        }

        this.$http({method, url, data}).then((res) => {
          if (res.data.code === 200) {
            this.$message.success(res.data.msg)
            this.lsh = res.data.resultSet.lsh
            this.dialogClose()
            this.pageReset()

            // 执行打印
            if (this.openPrint) {
              PubSub.publish('printChargeFeeBill')
            }
          }
          this.$loading().close()
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

  .pay-info hr {
    border: #3AA878 solid 1px;
    margin-bottom: 10px;
  }

  .amount-info {
    padding-top: 15px;
    font-size: 18px;
    font-weight: 600;
  }
  .amount-info-red {
    color: #F56C6C;
  }

  .amount-info-green {
    color: #67C23A;
  }
</style>
