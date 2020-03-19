<template>
  <div id="printContent" style="display: none;">
    <div style="width: 58mm; font-size: 12px;">
      <div style="text-align: center; font-size: 16px; font-weight: 600;">收费小票</div>
      <div style="margin-top: 15px;">
        <div>流水号: {{lsh}}</div>
        <div>消费日期: {{getPrintDate()}}</div>
        <div>会员姓名: {{sellRecordList.length > 0 ? sellRecordList[0].mrmMemberName : ''}}</div>
        <div>联系电话: {{sellRecordList.length > 0 ? sellRecordList[0].phone : ''}}</div>
      </div>
      <div style="margin: 5px 0; border-bottom: black 1px solid;"></div>
      <div style="display: flex; flex-direction: row; justify-content: space-between;">
        <div>收费名称</div>
        <div>实收单价</div>
        <div>数量</div>
        <div>小计/元</div>
      </div>
      <div style="margin: 5px 0; border-bottom: black 1px solid;"></div>
      <div v-for="(item, index) in sellRecordList" :key="index"
           style="display: flex; flex-direction: row; flex-wrap: wrap; justify-content: space-between;">
        <div style="width: 58mm;">{{item.name}}</div>
        <div style="padding-left: 18mm; min-width: 10mm;">{{item.actualRetailPrice}}</div>
        <div>{{item.quantity + item.unitsName}}</div>
        <div>{{(item.actualRetailPrice * item.quantity).toFixed(2)}}</div>
      </div>
      <div style="margin: 5px 0; border-bottom: black 1px solid;"></div>
      <div style="display: flex; flex-direction: row; justify-content: space-between;">
        <div>消费合计: {{sumRetailPrice()}}</div>
        <div>优惠金额: {{(sumRetailPrice() - sumActualRetailPrice()).toFixed(2)}}</div>
      </div>
      <div style="margin: 5px 0; border-bottom: black 1px dashed;"></div>
      <div style="display: flex; flex-direction: row; justify-content: space-between;">
        <div>本次积分: {{points}}</div>
        <div>应收合计: {{sumActualRetailPrice()}}</div>
      </div>
      <div style="margin: 5px 0; border-bottom: black 1px dashed;"></div>
      <div>
        <div v-if="payment.cash > 0">现金: {{payment.cash}}</div>
        <div v-if="payment.cashBackAmount > 0">现金找零: {{payment.cashBackAmount}}</div>
        <div v-if="payment.memberBalance > 0">会员卡: {{payment.memberBalance}}</div>
        <div v-if="payment.unionpay > 0">银联: {{payment.unionpay}}</div>
        <div v-if="payment.alipay > 0">支付宝: {{payment.alipay}}</div>
        <div v-if="payment.wechatpay > 0">微信: {{payment.wechatpay}}</div>
        <div v-if="payment.sysPaymentWayAmount > 0">{{getOtherPaymentWay(payment.sysPaymentWayId)}}</div>
      </div>
      <div style="margin: 5px 0; border-bottom: black 1px dashed;"></div>
      <div style="display: flex; flex-direction: row; justify-content: space-between;">
        <div>收银员: {{payload.userName}}</div>
        <div>实收合计: {{payment.actualAmount}}</div>
      </div>
      <div style="margin: 5px 0; border-bottom: black 1px solid;"></div>
      <div>门诊: {{payload.clinicName}}</div>
      <div>电话: {{payload.clinicTel}}</div>
      <div>地址: {{payload.clinicAddress}}</div>
      <div style="margin-top: 20px; text-align: center; font-size: 14px;">国药乐仁堂&nbsp;&nbsp;&nbsp;祝您身体健康</div>
      <div style="margin-top: 10px; text-align: center;">凭本小票索取发票(仅当日有效)</div>
    </div>
  </div> <!-- end printContent -->
</template>

<script>
import {getLodop} from '../../../common/LodopFuncs'
import PubSub from 'pubsub-js'
import jwtDecode from 'jwt-decode'
import moment from 'moment'
export default {
  props: {
    lsh: {
      type: String,
      required: true
    },
    sellRecordList: {
      type: Array,
      required: true
    },
    payment: {
      type: Object,
      required: true
    },
    points: {
      type: Number,
      required: true
    }
  },

  data () {
    return {
      payload: jwtDecode(this.$store.getters.token)
    }
  },

  computed: {
    paymentWayList: function () {
      return this.$store.getters.paymentWayList
    }
  }, // end computed

  mounted () {
    PubSub.subscribe('printChargeFeeBill', (msg) => {
      this.printPage()
    })
  }, // end computed

  destroyed () {
    // 当页面销毁时取消订阅
    PubSub.unsubscribe('printChargeFeeBill')
  }, // end destroyed

  methods: {
    /**
     * 打印页面
     */
    printPage () {
      let LODOP = getLodop()
      LODOP.PRINT_INIT('收费小票')
      LODOP.ADD_PRINT_HTM(0, '5mm', '76mm', '297mm', document.getElementById('printContent').innerHTML) // ADD_PRINT_HTM(上边距(不写单位默认为px) 左边距 打印区域宽度 打印区域高度 打印内容)
      // LODOP.PRINT()
      // LODOP.PRINTA()
      LODOP.PREVIEW()
    },

    /**
     * 获取打印日期
     */
    getPrintDate () {
      return moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    },

    /**
     * 获取消费金额
     */
    sumRetailPrice () {
      let totalArray = this.sellRecordList.map(item => item.quantity * item.retailPrice)
      return totalArray.reduce((prev, curr) => {
        return prev + curr
      }, 0).toFixed(2)
    },

    /**
     * 获取应收金额
     * @returns {string}
     */
    sumActualRetailPrice () {
      let totalArray = this.sellRecordList.map(item => item.quantity * item.actualRetailPrice)
      return totalArray.reduce((prev, curr) => {
        return prev + curr
      }, 0).toFixed(2)
    },

    /**
     * 获取其他方式
     * @param id
     */
    getOtherPaymentWay (id) {
      let otherPaymentWay = this.paymentWayList.find(item => { return item.id === id })
      for (let key in otherPaymentWay) {
        if (key === 'name') {
          return otherPaymentWay['name'] + ':' + this.payment.sysPaymentWayAmount
        }
      }
    }

  } // end methods
}
</script>

<style scoped>
</style>
