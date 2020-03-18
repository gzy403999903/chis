<template>
  <div id="printContent" style="display: none;">
    <div style="width: 76mm; padding: 0 2mm; font-size: 16px;">
      <div style="text-align: center; font-size: 22px; font-weight: 600;">收费小票(补打)</div>
      <div style="margin-top: 20px;">
        <div>流水号: {{sellRecordList.length > 0 ? sellRecordList[0].lsh : ''}}</div>
        <div>消费日期: {{sellRecordList.length > 0 ? sellRecordList[0].creationDate : ''}}</div>
        <div>补打日期: {{getReprintDate()}}</div>
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
        <div style="width: 76mm;">{{item.entityName}}</div>
        <div style="padding-left: 25mm; width: 15mm;">{{item.actualRetailPrice}}</div>
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
      <div style="line-height: 25px;">
        <div v-if="paymentRecord.cash > 0">现金: {{paymentRecord.cash}}</div>
        <div v-if="paymentRecord.cashBackAmount > 0">现金找零: {{paymentRecord.cashBackAmount}}</div>
        <div v-if="paymentRecord.memberBalance > 0">会员卡: {{paymentRecord.memberBalance}}</div>
        <div v-if="paymentRecord.unionpay > 0">银联: {{paymentRecord.unionpay}}</div>
        <div v-if="paymentRecord.alipay > 0">支付宝: {{paymentRecord.alipay}}</div>
        <div v-if="paymentRecord.wechatpay > 0">微信: {{paymentRecord.wechatpay}}</div>
        <div v-if="paymentRecord.sysPaymentWayAmount > 0">其他方式: {{paymentRecord.sysPaymentWayAmount}}</div>
      </div>
      <div style="margin: 5px 0; border-bottom: black 1px dashed;"></div>
      <div style="display: flex; flex-direction: row; justify-content: space-between;">
        <div>收银员: {{paymentRecord.creatorName}}</div>
        <div>实收合计: {{paymentRecord.actualAmount}}</div>
      </div>
      <div style="margin: 5px 0; border-bottom: black 1px solid;"></div>
      <div>门诊: {{payload.clinicName}}</div>
      <div>电话: {{payload.clinicTel}}</div>
      <div>地址: {{payload.clinicAddress}}</div>
      <div style="margin-top: 20px; text-align: center; font-size: 20px;">国药乐仁堂&nbsp;&nbsp;&nbsp;祝您身体健康</div>
      <div style="margin-top: 10px; text-align: center;">凭本小票索取发票(仅当日有效)</div>
    </div>
  </div> <!-- end printBody -->
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
      // let bodyStyle = '<style>' + document.getElementById('bodyStyle').innerHTML + '</style>'
      // let printHtml = bodyStyle + '<body>' + document.getElementById('bodyContent').innerHTML + '</body>'
      LODOP.ADD_PRINT_HTM(0, 0, '100%', '100%', document.getElementById('printContent').innerHTML) // ADD_PRINT_HTM(上边距(不写单位默认为px) 左边距 打印区域宽度 打印区域高度 打印内容)
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

<style scoped >
</style>
