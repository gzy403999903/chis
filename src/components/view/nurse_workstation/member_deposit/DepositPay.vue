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
        <span>会员储值</span>
      </el-col>
      <el-col :span="19" style="text-align: right;">
        <el-button size="mini" type="primary" icon="el-icon-check" @click="submitData">提 交</el-button>
        <el-button size="mini" type="warning" icon="el-icon-right" @click="dialogClose">返 回</el-button>
      </el-col>
    </el-row>

    <el-row>
      <!-- 左侧内容 -->
      <el-form :model="memberForm" ref="memberForm" size="small" label-width="80px">
        <el-col :span="16" class="pay-info">
          <el-row>
            <el-col :span="16">
              <el-form-item label="会员编码" prop="id">
                <el-select
                  style="width: 240px;"
                  ref=""
                  @change="memberSelected"
                  v-model.trim="memberForm.id"
                  placeholder="输入 姓名 / 助记码 / 手机 搜索"
                  :remote-method="queryMember"
                  :loading="select.loading"
                  remote
                  filterable>
                  <el-option class="custom-el-option" :value="null" v-if="select.members.length > 0" disabled>
                    <span class="select-option-top" style="width: 100px;">姓名</span>
                    <span class="select-option-top" style="width: 100px;">性别</span>
                    <span class="select-option-top" style="width: 100px;">年龄</span>
                    <span class="select-option-top" style="width: 120px;">出生年月</span>
                    <span class="select-option-top" style="width: 150px;">联系电话</span>
                    <span class="select-option-top">身份证号</span>
                  </el-option>
                  <el-option class="custom-el-option" v-for="item in select.members" :key="item.id" :value="item.id" :label="item.oid" >
                    <span class="select-option-text" style="width: 100px;">{{item.name}}</span>
                    <span class="select-option-text" style="width: 100px;">{{item.genderName}}</span>
                    <span class="select-option-text" style="width: 100px;">{{item.age}}</span>
                    <span class="select-option-text" style="width: 120px;">{{item.birth}}</span>
                    <span class="select-option-text" style="width: 150px;">{{item.phone}}</span>
                    <span class="select-option-text">{{item.idCardNo}}</span>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="可用余额" prop="balance">
                {{memberForm.balance}}
              </el-form-item>
            </el-col>
          </el-row>
          <hr/>

          <el-row>
            <el-col :span="8">
              <el-form-item label="会员姓名" prop="name">
                {{memberForm.name}}
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="联系电话" prop="phone">
                {{memberForm.phone}}
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="会员类型" prop="mrmMemberTypeName">
                {{memberForm.mrmMemberTypeName}}
              </el-form-item>
            </el-col>
          </el-row>
          <hr/>

          <div class="amount-info">实收金额: {{editForm.actualAmount}}&nbsp;元</div>
          <div class="amount-info">
            赠送金额: {{totalGivenAmount}}&nbsp;元
            <span class="amount-info-red">( 每满 {{memberForm.depositAmount}}元 赠送 {{memberForm.givenAmount}}元 )</span>
          </div>
          <div class="amount-info amount-info-green">储值金额: {{totalDepositAmount}}&nbsp;元</div>
        </el-col>
      </el-form>

      <!-- 右侧内容 -->
      <el-form :model="editForm" ref="editForm" :rules="editFormRules" size="small" label-width="80px">
        <el-col :span="8">
          <el-form-item label="现金" prop="cash">
            <el-input-number v-model="editForm.cash" :controls="false" :max="99999" :min="0" :precision="2"
                             :disabled="!memberForm.id"
                             ref="cash"
                             @keyup.enter.native="editFormValidateToNextFocus('cash', 'unionpay')"
                             @change="sumActualAmount"/>
          </el-form-item>
          <el-form-item label="会员卡" prop="memberBalance">
            <el-input-number disabled :controls="false" :max="99999" :min="0" :precision="2"/>
          </el-form-item>
          <el-form-item label="银联" prop="unionpay">
            <el-input-number v-model="editForm.unionpay" :controls="false" :max="99999" :min="0" :precision="2"
                             :disabled="!memberForm.id"
                             ref="unionpay"
                             @keyup.enter.native="editFormValidateToNextFocus('unionpay', 'alipay')"
                             @change="sumActualAmount"/>
          </el-form-item>
          <el-form-item label="支付宝" prop="alipay">
            <el-input-number v-model="editForm.alipay" :controls="false" :max="99999" :min="0" :precision="2"
                             :disabled="!memberForm.id"
                             ref="alipay"
                             @keyup.enter.native="editFormValidateToNextFocus('alipay', 'wechatpay')"
                             @change="sumActualAmount"/>
          </el-form-item>
          <el-form-item label="微信" prop="wechatpay">
            <el-input-number v-model="editForm.wechatpay" :controls="false" :max="99999" :min="0" :precision="2"
                             :disabled="!memberForm.id"
                             ref="wechatpay"
                             @change="sumActualAmount"/>
          </el-form-item>
          <el-form-item label="" prop="sysPaymentWayId">
            <el-select
              disabled
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
      </el-form>

    </el-row>
  </el-dialog>
</template>

<script>
export default {

  props: {
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

  data () {
    return {
      totalDepositAmount: 0, // 合计储值金额 (editForm.actualAmount + totalGivenAmount)
      totalGivenAmount: 0, // 合计赠送金额 (editForm.actualAmount / memberForm.depositAmount * givenAmount)
      memberForm: {
        id: '',
        name: '',
        phone: '',
        mrmMemberTypeName: '',
        balance: 0,
        depositAmount: 0,
        givenAmount: 0
      },
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
      },
      select: {
        loading: false,
        members: []
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
    },

    /**
     * 界面关闭后执行的操作
     */
    dialogClosed () {
      this.select.members = [] // 初始化会员查询结果
      this.totalDepositAmount = 0 // 初始化合计储值金额
      this.totalGivenAmount = 0 // 初始化合计赠送金额

      this.$refs.memberForm.resetFields() // 初始化表单
      this.memberForm.depositAmount = 0 // 初始化储值金额
      this.memberForm.givenAmount = 0 // 初始化赠送金额

      this.$refs.editForm.resetFields() // 初始化表单
      this.editForm.actualAmount = 0 // 初始化实收金额
      this.editForm.cashBackAmount = 0 // 初始化找零金额
      this.editForm.disparityAmount = 0 // 初始化差额
    },

    /**
     * 检索会员
     */
    queryMember (keyword) {
      if (keyword.trim()) {
        this.select.loading = true
        // 做一个0.5秒的延迟查询, 避免用户输入速度过慢时的频发查询
        setTimeout(() => {
          const url = `/chisAPI/member/getEnabledLikeByKeyword`
          let params = {keyword}
          this.$http.get(url, {params}).then((res) => {
            this.select.members = res.data
            this.select.loading = false
          })
        }, (this.select.members ? 0 : 500)) // 当查询结果不为0时, 才会有 0.5 秒的延迟查询
      }
    },

    /**
     * 获取选中的会员
     */
    memberSelected (id) {
      let member = this.select.members.find(item => {
        return item.id === id
      })

      this.memberForm.name = member.name
      this.memberForm.phone = member.phone
      this.memberForm.mrmMemberTypeName = member.mrmMemberTypeName
      this.memberForm.balance = member.balance
      this.memberForm.depositAmount = member.depositAmount
      this.memberForm.givenAmount = member.givenAmount
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
     * 计算本次赠送余额
     */
    computeGivenAmount () {
      if (this.editForm.actualAmount === 0 ||
          this.memberForm.depositAmount === 0 ||
          this.memberForm.givenAmount === 0) {
        return 0
      }
      return Math.floor(this.editForm.actualAmount / this.memberForm.depositAmount) * this.memberForm.givenAmount
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
        this.editForm.actualAmount = this.editForm.cash + this.editForm.unionpay + this.editForm.alipay +
                                     this.editForm.wechatpay + this.editForm.sysPaymentWayAmount
        // 计算本次赠送余额
        this.totalGivenAmount = this.computeGivenAmount()

        // 计算本次合计储值金额
        this.totalDepositAmount = this.editForm.actualAmount + this.totalGivenAmount
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
        // 验证会员ID
        if (!this.memberForm.id) {
          this.$message.error('储值会员不能为空')
          return false
        }
        // 验证实收金额是否为 0
        if (this.editForm.actualAmount === 0) {
          this.$message.error('实收金额不能为 0 ')
          return false
        }
        // 提交数据
        this.$loading()
        const url = '/chisAPI/depositRecord/save'
        const method = 'POST'

        let params = {
          mrmMemberId: this.memberForm.id, // 会员ID
          paymentRecordJson: JSON.stringify(this.editForm) // 支付记录JSON
        }

        this.$http({method, url, params}).then((res) => {
          if (res.data.code === 200) {
            this.$message.success(res.data.msg)
            this.dialogClose()
            this.dataGridLoadData()
          } else {
            this.$message.error(res.data.msg)
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
    padding-left: 15px;
    font-size: 14px;
    color: #F56C6C;
  }

  .amount-info-green {
    color: #67C23A;
  }
</style>
