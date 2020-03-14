<template>
  <div id="print-body" style="display: none;">
    <div style="text-align: center; font-size: 28px;">收费小票(补打)</div>
    <div style="padding-top: 35px;"></div>
    <div>流水号: {{sellRecordList.length > 0 ? sellRecordList[0].lsh : ''}}</div>
    <div>消费日期: {{sellRecordList.length > 0 ? sellRecordList[0].creationDate : ''}}</div>
    <div>补打日期: {{getReprintDate()}}</div>
    <div>会员姓名: {{sellRecordList.length > 0 ? sellRecordList[0].mrmMemberName : ''}}</div>
    <div>联系电话: {{sellRecordList.length > 0 ? sellRecordList[0].phone : ''}}</div>
    <div style="border-bottom: #222222 1px solid; margin-top: 5px;"></div>
    <div>
      <div style="float: left; width: 40mm;">收费名称</div>
      <div style="float: left; text-align: center; width: 20mm;">实收单价</div>
      <div style="float: left; text-align: center; width: 20mm;">数量</div>
      <div style="float: left; text-align: center; width: 15mm;">小计/元</div>
    </div>
    <div style="clear: both;"></div>
    <div style="border-bottom: #222222 1px solid;"></div>
    <div v-for="(item, index) in sellRecordList" :key="index" style="line-height: 25px;">
      <div style="float: left; width: 40mm;">{{item.entityName}}</div>
      <div style="float: left; text-align: center; width: 20mm;">{{item.actualRetailPrice}}</div>
      <div style="float: left; text-align: center; width: 20mm;">{{item.quantity + item.unitsName}}</div>
      <div style="float: left; text-align: center; width: 15mm;">{{(item.actualRetailPrice * item.quantity).toFixed(2)}}</div>
      <div style="clear: both;"></div>
    </div>
    <div style="border-bottom: #222222 1px solid; margin-top: 5px;"></div>
    <div style="float: left;">消费合计: {{sumRetailPrice()}}</div>
    <div style="text-align: right;">优惠金额: {{(sumRetailPrice() - sumActualRetailPrice()).toFixed(2)}}</div>
    <div style="border-bottom: #222222 1px solid;"></div>
    <div style="clear: both;"></div>
    <div style="float: left;">本次积分: {{points}}</div>
    <div style="text-align: right;">应收合计: {{sumActualRetailPrice()}}</div>
    <div style="clear: both;"></div>
    <div style="border-bottom: #222222 1px solid; margin-bottom: 5px;"></div>
    <div style="line-height: 25px;">
      <div v-if="paymentRecord.cash > 0">现金: {{paymentRecord.cash}}</div>
      <div v-if="paymentRecord.cashBackAmount > 0">现金找零: {{paymentRecord.cashBackAmount}}</div>
      <div v-if="paymentRecord.memberBalance > 0">会员卡: {{paymentRecord.memberBalance}}</div>
      <div v-if="paymentRecord.unionpay > 0">银联: {{paymentRecord.unionpay}}</div>
      <div v-if="paymentRecord.alipay > 0">支付宝: {{paymentRecord.alipay}}</div>
      <div v-if="paymentRecord.wechatpay > 0">微信: {{paymentRecord.wechatpay}}</div>
      <div v-if="paymentRecord.sysPaymentWayAmount > 0">其他: {{paymentRecord.sysPaymentWayAmount}}</div>
    </div>
    <div style="border-bottom: #222222 1px solid; margin-top: 5px;"></div>
    <div style="float: left;">收银员: {{paymentRecord.creatorName}}</div>
    <div style="text-align: right;">实收合计: {{paymentRecord.actualAmount}}</div>
    <div style="clear: both;"></div>
    <div style="border-bottom: #222222 1px solid; margin-bottom: 5px;"></div>
    <div>门诊: {{payload.clinicName}}</div>
    <div>电话: {{payload.clinicTel}}</div>
    <div>地址: {{payload.clinicAddress}}</div>
    <div style="margin-top: 25px; text-align: center; font-size: 22px;">国药乐仁堂&nbsp;&nbsp;&nbsp;祝您身体健康</div>
    <div style="text-align: center;">凭本小票索取发票&nbsp;&nbsp;&nbsp;仅当日有效</div>
  </div> <!-- end print-body -->
</template>

<script>
import {getLodop} from '../../../common/LodopFuncs'
import PubSub from 'pubsub-js'
import jwtDecode from 'jwt-decode'
import moment from 'moment'
export default {
  props: {
    sellRecordList: {
      type: Array,
      required: true
    },
    paymentRecord: {
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
    PubSub.subscribe('reprintChargeFeeBill', (msg) => {
      this.printPage()
    })
  }, // end computed

  destroyed () {
    // 当页面销毁时取消订阅
    PubSub.unsubscribe('reprintChargeFeeBill')
  }, // end destroyed

  methods: {
    /**
     * 打印页面
     */
    printPage () {
      let LODOP = getLodop()
      LODOP.PRINT_INIT('收费小票(补打)')
      LODOP.ADD_PRINT_HTM(0, 0, '10cm', '100cm', document.getElementById('print-body').innerHTML) // ADD_PRINT_HTM(上边距(不写单位默认为px) 左边距 打印区域宽度 打印区域高度 打印内容)
      // LODOP.PRINT()
      // LODOP.PRINTA()
      LODOP.PREVIEW()
    },

    /**
     * 获取重新打印日期
     */
    getReprintDate () {
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
    }

  } // end methods
}
</script>

<style scoped>
</style>
