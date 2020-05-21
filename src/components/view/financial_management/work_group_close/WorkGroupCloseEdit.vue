<template>
  <el-dialog
    width="55%"
    append-to-body
    :show-close="false"
    :close-on-click-modal="false"
    :visible="visible"
    @opened="dialogOpened"
    @closed="dialogClosed">

    <el-row slot="title">
      <el-col :span="5" style="font-size: 20px;">
        <span>班结</span>
      </el-col>
      <el-col :span="19" style="text-align: right;">
        <el-button size="mini" type="primary" icon="el-icon-check" @click="submitData">提 交</el-button>
        <el-button size="mini" type="warning" icon="el-icon-right" @click="dialogClose">返 回</el-button>
      </el-col>
    </el-row>

    <el-form :model="editForm" ref="editForm" :rules="editFormRules" size="mini" label-width="100px">
      <el-row>
        <el-col :span="10" style="border: #3BB878 solid 1px; padding: 8px;">
          <el-form-item label="班结日期">{{row.beginDate ? row.beginDate : ''}}</el-form-item>
          <el-form-item label="班次">{{row.flmWorkGroupName ? row.flmWorkGroupName : ''}}</el-form-item>
          <el-form-item label="班结人">{{row.operatorName ? row.operatorName : ''}}</el-form-item>
          <el-form-item label="班结金额">
            <span style="font-size: 20px; font-weight: 600; color: red;">
              {{editForm.actualAmount}}&nbsp;元
            </span>
          </el-form-item>
        </el-col>

        <el-col :span="7">
          <el-form-item label="现金" prop="cash">
            <el-input-number v-model="editForm.cash" :controls="false" :max="99999" :precision="2"
                             ref="cash"
                             @keyup.enter.native="editFormValidateToNextFocus('cash', 'unionpay')"
                             @focus="editForm.cash = editForm.cash !== 0 ? editForm.cash : undefined"
                             @blur="editForm.cash ? null : editForm.cash = 0"
                             @change="sumActualAmount"/>
          </el-form-item>
          <el-form-item label="银联" prop="unionpay">
            <el-input-number v-model="editForm.unionpay" :controls="false" :max="99999" :precision="2"
                             ref="unionpay"
                             @keyup.enter.native="editFormValidateToNextFocus('unionpay', 'wechatpay')"
                             @focus="editForm.unionpay = editForm.unionpay !== 0 ? editForm.unionpay : undefined"
                             @blur="editForm.unionpay ? null : editForm.unionpay = 0"
                             @change="sumActualAmount"/>
          </el-form-item>
          <el-form-item label="微信" prop="wechatpay">
            <el-input-number v-model="editForm.wechatpay" :controls="false" :max="99999" :precision="2"
                             ref="wechatpay"
                             @keyup.enter.native="editFormValidateToNextFocus('wechatpay', 'alipay')"
                             @focus="editForm.wechatpay = editForm.wechatpay !== 0 ? editForm.wechatpay : undefined"
                             @blur="editForm.wechatpay ? null : editForm.wechatpay = 0"
                             @change="sumActualAmount"/>
          </el-form-item>
          <el-form-item label="支付宝" prop="alipay">
            <el-input-number v-model="editForm.alipay" :controls="false" :max="99999" :precision="2"
                             ref="alipay"
                             @keyup.enter.native="editFormValidateToNextFocus('alipay', 'cmedicare')"
                             @focus="editForm.alipay = editForm.alipay !== 0 ? editForm.alipay : undefined"
                             @blur="editForm.alipay ? null : editForm.alipay = 0"
                             @change="sumActualAmount"/>
          </el-form-item>
          <el-form-item label="市医保" prop="cmedicare">
            <el-input-number v-model="editForm.cmedicare" :controls="false" :max="99999" :precision="2"
                             ref="cmedicare"
                             @keyup.enter.native="editFormValidateToNextFocus('cmedicare', 'pmedicare')"
                             @focus="editForm.cmedicare = editForm.cmedicare !== 0 ? editForm.cmedicare : undefined"
                             @blur="editForm.cmedicare ? null : editForm.cmedicare = 0"
                             @change="sumActualAmount"/>
          </el-form-item>
        </el-col>

        <el-col :span="7">
          <el-form-item label="省医保" prop="pmedicare">
            <el-input-number v-model="editForm.pmedicare" :controls="false" :max="99999" :precision="2"
                             ref="pmedicare"
                             @keyup.enter.native="editFormValidateToNextFocus('pmedicare', 'memberBalance')"
                             @focus="editForm.pmedicare = editForm.pmedicare !== 0 ? editForm.pmedicare : undefined"
                             @blur="editForm.pmedicare ? null : editForm.pmedicare = 0"
                             @change="sumActualAmount"/>
          </el-form-item>
          <el-form-item label="会员卡" prop="memberBalance">
            <el-input-number v-model="editForm.memberBalance" :controls="false" :max="99999" :precision="2"
                             ref="memberBalance"
                             @keyup.enter.native="editFormValidateToNextFocus('memberBalance', 'creditpay')"
                             @focus="editForm.memberBalance = editForm.memberBalance !== 0 ? editForm.memberBalance : undefined"
                             @blur="editForm.memberBalance ? null : editForm.memberBalance = 0"
                             @change="sumActualAmount"/>
          </el-form-item>
          <el-form-item label="信用卡" prop="creditpay">
            <el-input-number v-model="editForm.creditpay" :controls="false" :max="99999" :precision="2"
                             ref="creditpay"
                             @keyup.enter.native="editFormValidateToNextFocus('creditpay', 'coupon')"
                             @focus="editForm.creditpay = editForm.creditpay !== 0 ? editForm.creditpay : undefined"
                             @blur="editForm.creditpay ? null : editForm.creditpay = 0"
                             @change="sumActualAmount"/>
          </el-form-item>
          <el-form-item label="抵扣券" prop="coupon">
            <el-input-number v-model="editForm.coupon" :controls="false" :max="99999" :precision="2"
                             ref="coupon"
                             @keyup.enter.native="editFormValidateToNextFocus('coupon', 'otherAmount')"
                             @focus="editForm.coupon = editForm.coupon !== 0 ? editForm.coupon : undefined"
                             @blur="editForm.coupon ? null : editForm.coupon = 0"
                             @change="sumActualAmount"/>
          </el-form-item>
          <el-form-item label="其他金额" prop="otherAmount">
            <el-input-number v-model="editForm.otherAmount" :controls="false" :max="99999" :precision="2"
                             ref="otherAmount"
                             @keyup.enter.native="editFormValidateToNextFocus('otherAmount', 'cash')"
                             @focus="editForm.otherAmount = editForm.otherAmount !== 0 ? editForm.otherAmount : undefined"
                             @blur="editForm.otherAmount ? null : editForm.otherAmount = 0"
                             @change="sumActualAmount"/>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

  </el-dialog>
</template>

<script>
export default {
  props: {
    action: {
      type: String,
      required: true
    },

    row: {
      type: Object,
      required: true
    },

    dataGridLoadData: {
      type: Function,
      required: true
    }
  },

  data () {
    return {
      visible: false,
      editForm: {
        id: '', // 主键
        cash: 0, // 现金
        unionpay: 0, // 银联
        wechatpay: 0, // 微信
        alipay: 0, // 支付宝
        cmedicare: 0, // 市医保
        pmedicare: 0, // 省医保
        memberBalance: 0, // 会员卡
        creditpay: 0, // 信用卡
        coupon: 0, // 抵扣券(优惠券)
        otherAmount: 0, // 其他方式金额

        actualAmount: 0 // 实收金额
      },
      editFormRules: {
        id: [
          {required: true, message: '不能为空'}
        ],
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
        otherAmount: [
          {required: true, message: '不能为空'}
        ]
      }
    }
  },

  methods: {
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
          this.editForm.otherAmount
        // 约束2位小数
        this.editForm.actualAmount = (this.editForm.actualAmount).toFixed(2) * 1
      })
    },

    /**
     * 开启界面
     */
    dialogOpen () {
      this.visible = true
    },

    /**
     * 关闭界面
     */
    dialogClose () {
      this.visible = false
    },

    /**
     * 开启界面后执行的操作
     */
    dialogOpened () {
      if (this.row.id) {
        for (let key in this.editForm) {
          if (this.editForm.hasOwnProperty(key)) {
            this.editForm[key] = this.row[key]
          }
        }
      } else {
        this.$message.error('未获取班结记录')
      }
    },

    /**
     * 关闭界面后执行的操作
     */
    dialogClosed () {
      this.$refs.editForm.resetFields()
      this.editForm.id = ''
      this.editForm.actualAmount = 0
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

        this.$confirm(`当前的班结金额为
          <span style="font-size: 20px; font-weight: 600; color: red; padding: 0 10px;">${this.editForm.actualAmount}&nbsp;元</span>,
          确认执行操作吗?`, '提示', {
          dangerouslyUseHTMLString: true, confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', showClose: false
        }).then(() => {
          this.$loading()
          const url = this.action === 'all'
            ? `/chisAPI/workGroupClose/updateToPayments`
            : `/chisAPI/workGroupClose/updateToClose`
          let method = 'PUT'
          let params = this.editForm
          this.$http({method, url, params}).then((res) => {
            if (res.data.code === 200) {
              this.$message.success(res.data.msg)
              this.dialogClose()
              this.dataGridLoadData()
            } else {
              this.$loading().close()
            }
          }) // end http
        }).catch(() => {}) // end confirm
      }) // end validate
    }

  } // end methods
}
</script>

<style scoped>
</style>
