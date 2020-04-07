<template>
  <el-dialog
    fullscreen
    class="fullscreen-dialog"
    :show-close="false"
    :close-on-click-modal="false"
    :visible="visible"
    @opened="dialogOpened"
    @closed="dialogClosed">
    <!-- 模态框标题栏与功能按钮-->
    <el-row slot="title">
      <el-col :span="6" style="font-size: 20px;">
        <span>新品审批</span>
      </el-col>
      <el-col :span="18" style="text-align: right;">
        <span style="font-size: 14px; font-weight: 600;" v-if="step.active === 1">零售单价&nbsp;&nbsp;
          <el-input-number size="mini" v-model="retailPrice" :controls="false" :max="99999" :min="0" :precision="2"
                           @change="retailPriceChange"
                           style="width: 100px; margin-right: -2px;"/>
          <el-button size="mini" type="default" plain icon="el-icon-money" @click="doPricing">商品定价</el-button>&nbsp;&nbsp;
        </span>

        <el-button size="mini" type="danger" plain icon="el-icon-close" @click="doAction('cancelPricing')"
                   v-if="step.active === 2">定价驳回</el-button>
        <el-button size="mini" type="danger" plain icon="el-icon-close" @click="doAction('unapproved')"
                   v-if="step.active === 2">商品驳回</el-button>
        <el-button size="mini" type="success" plain icon="el-icon-check" @click="doAction('approved')"
                   v-if="step.active === 2">审核通过</el-button>

        <el-button size="mini" type="danger" plain icon="el-icon-close" @click="doAction('lastCancelPricing')"
                   v-if="step.active === 3 && !row.lastApproverId">定价驳回</el-button>
        <el-button size="mini" type="danger" plain icon="el-icon-close" @click="doAction('lastUnapproved')"
                   v-if="step.active === 3 && !row.lastApproverId">商品驳回</el-button>
        <el-button size="mini" type="success" plain icon="el-icon-check" @click="doAction('lastApproved')"
                   v-if="step.active === 3 && !row.lastApproverId">审批通过</el-button>
        <el-button size="mini" type="warning" icon="el-icon-right" @click="dialogClose">返 回</el-button>
      </el-col>
    </el-row>

    <div :style="`height:${$store.getters.dialogDataGridHeight}px;`" style="background-color: white; padding-top: 20px;">
      <el-steps :active="step.active" align-center style="height: 50px;">
        <el-step title="发起" icon="el-icon-s-promotion" :description="step.description0"/>
        <el-step title="商品定价" icon="el-icon-user-solid" :description="step.description1"/>
        <el-step title="商品审核" icon="el-icon-user-solid" :description="step.description2"/>
        <el-step title="商品审批" icon="el-icon-user-solid" :description="step.description3"/>
      </el-steps>

      <el-form size="small" label-width="110px" class="goods-approve-show-from">
        <el-row>
          <el-col :span="4">
            <el-form-item label="商品类型">
              {{this.row.gsmGoodsTypeName}}
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="商品编码">
              {{this.row.oid}}
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="通用名">
              {{this.row.name}}
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="助记码">
              {{this.row.code}}
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="商品名">
              {{this.row.spName}}
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="助记码">
              {{this.row.spCode}}
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="4">
            <el-form-item label="商品规格">
              {{this.row.specs}}
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="包装单位">
              {{this.row.goodsUnitsName}}
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="商品分类">
              {{this.row.goodsClassifyName}}
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="二级分类">
              {{this.row.sysSecondClassifyName}}
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="8">
            <el-form-item label="生产厂家">
              {{this.row.manufacturerName}}
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="产地">
              {{this.row.originName}}
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="计费类型">
              {{this.row.billingTypeName}}
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="电子条码">
              {{this.row.barcode}}
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="4">
            <el-form-item label="零售单价" style="color: red;">
              {{this.row.retailPrice}}&nbsp;&nbsp;元
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="毛利提成">
              {{this.row.profitCommissionRate}}&nbsp;&nbsp;%
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="进货税率">
              {{this.row.purchaseTaxRate}}&nbsp;&nbsp;%
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="销售税率">
              {{this.row.sellTaxRate}}&nbsp;&nbsp;%
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="购进基数">
              {{this.row.minPurchaseQuantity}}
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="销售分类">
              {{this.row.sellClassifyName}}
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="4">
            <el-form-item label="参与打折">
              {{this.row.discountable ? '是' : '否'}}
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="可以退货">
              {{this.row.returnable ? '是' : '否'}}
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="是否赠品">
              {{this.row.freeGoods ? '是' : '否'}}
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="允许倒挂">
              {{this.row.lossable ? '是' : '否'}}
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="启用状态">
              {{this.row.state ? '是' : '否'}}
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="4">
            <el-form-item label="可拆零">
              {{this.row.splitable ? '是' : '否'}}
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="拆零数量">
              {{this.row.splitQuantity}}
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="拆零单位">
              {{this.row.splitUnitsName}}
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="拆零单价">
              {{this.row.splitPrice}}&nbsp;&nbsp;元
            </el-form-item>
          </el-col>
        </el-row>

        <el-row v-show="row.gsmGoodsTypeId === belongGoodsType.WESTERN_DRUGS">
          <el-col :span="4">
            <el-form-item label="药品剂型">
              {{this.row.doseTypeName}}
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="基本剂量">
              {{this.row.dose}}
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="剂量单位">
              {{this.row.doseUnitsName}}
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="给药途径">
              {{this.row.drugUsageName}}
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="特殊药品">
              {{this.row.specialDrugName}}
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="4">
            <el-form-item label="是否串味">
              {{this.row.odored ? '是' : '否'}}
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="存储条件">
              {{this.row.storageTemperatureName}}
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="养护天数">
              {{this.row.conservationDays}}
            </el-form-item>
          </el-col>
          <el-col :span="6" v-show="row.gsmGoodsTypeId !== belongGoodsType.HYGIENIC_MATERIAL">
            <el-form-item label="处方药品">
              {{this.row.prescription ? '是' : '否'}}
            </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-form-item label="处方类型">
              {{this.row.prescriptionTypeName}}
            </el-form-item>
          </el-col>

        </el-row>

        <el-row>
          <el-col :span="4" v-show="row.gsmGoodsTypeId !== belongGoodsType.HYGIENIC_MATERIAL">
            <el-form-item label="医保药品">
              {{this.row.ybDrug ? '是' : '否'}}
            </el-form-item>
          </el-col>
          <el-col :span="4" v-show="row.gsmGoodsTypeId !== belongGoodsType.HYGIENIC_MATERIAL">
            <el-form-item label="医保编码" prop="ybOid">
              {{this.row.ybOid}}
            </el-form-item>
          </el-col>
          <el-col :span="4" v-show="row.gsmGoodsTypeId !== belongGoodsType.HYGIENIC_MATERIAL">
            <el-form-item label="医保售价">
              {{this.row.ybPrice}}&nbsp;&nbsp;元
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="批准文号">
              {{this.row.approvalNum}}
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="批准文号效期">
              {{this.row.approvalNumExpiryDate}}
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

    </div> <!-- end body div -->
  </el-dialog>
</template>

<script>
export default {
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

  data () {
    return {
      approveState: this.$store.getters.approveState, // 审批状态
      belongGoodsType: this.$store.getters.goodsType, // 属于哪个商品类型
      step: {
        active: 0,
        description0: '',
        description1: '',
        description2: '',
        description3: ''
      },
      retailPrice: 0 // 零售单价
    }
  }, // end data

  methods: {
    /* -------------------------------------------------------------------------------------------------------------- */
    /**
     * 界面打开后执行的操作
     */
    dialogOpened () {
      // 初始化步骤条
      switch (this.row.approveState) {
        case this.approveState.UNAPPROVED:
          this.step.active = 0
          this.step.description0 = '已驳回'
          break
        case this.approveState.PRICING:
          this.step.active = 1
          this.step.description1 = '待定价'
          this.retailPrice = this.row.retailPrice
          break
        case this.approveState.PENDING:
          this.step.active = 2
          this.step.description2 = '待审核'
          break
        case this.approveState.APPROVED:
          this.step.description3 = '待审批'
          this.step.active = 3
          break
      }

      // 渲染步骤条各个内容
      if (this.step.active > 0) {
        this.step.description0 = this.row.creatorName + ' [' + this.row.creationDate + ']'
      }
      if (this.step.active > 1) {
        this.step.description1 = this.row.pricerName + ' [' + this.row.pricingDate + ']'
      }
      if (this.step.active > 2) {
        this.step.description2 = this.row.approverName + ' [' + this.row.approveDate + ']'
      }
      if (this.step.active === 3 && this.row.lastApproverId) {
        this.step.description3 = this.row.lastApproverName + ' [' + this.row.lastApproveDate + ']'
      }
    },

    /**
     * 界面关闭后执行的操作
     */
    dialogClosed () {
      // 初始化步骤条
      this.step.active = 0
      this.step.description0 = ''
      this.step.description1 = ''
      this.step.description2 = ''
      this.step.description3 = ''
    },

    /**
     * 当零售单价发生改变时执行的内容
     */
    retailPriceChange () {
      this.doPricing()
    },

    /**
     * 定价操作
     */
    doPricing () {
      if (!Number(this.retailPrice) && this.retailPrice !== 0) {
        this.$message.error('零售价不能为空')
        return
      }

      this.$confirm(`当前商品定价为:&nbsp;&nbsp;
                     <span style="color: red; font-size: 18px; font-weight: 600;">${this.retailPrice}&nbsp;元</span><br/>
                     确认执行该操作吗?`, '提示', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', showClose: false, dangerouslyUseHTMLString: true
      }).then(() => {
        this.$loading()
        const url = `/chisAPI/goodsApply/pricing`
        let method = 'PUT'
        let params = {
          id: this.row.id,
          retailPrice: this.retailPrice
        }

        this.$http({method, url, params}).then((res) => {
          if (res.data.code === 200) {
            this.$message.success(res.data.msg)
            this.dataGridLoadData()
            this.dialogClose()
          } else {
            this.$loading().close()
          }
        })
      }).catch(() => {})
    },

    /**
     * 执行的操作
     * @param action
     */
    doAction (action) {
      this.$confirm('确认要执行该操作吗?', '提示', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', showClose: false
      }).then(() => {
        this.$loading()
        const url = `/chisAPI/goodsApply/${action}`
        let method = 'PUT'
        let params = {
          id: this.row.id
        }

        this.$http({method, url, params}).then((res) => {
          if (res.data.code === 200) {
            this.$message.success(res.data.msg)
            this.dataGridLoadData()
            this.dialogClose()
          } else {
            this.$loading().close()
          }
        })
      }).catch(() => {})
    }
  }

}
</script>

<style scoped>
  .goods-approve-show-from {
    position: relative;
    top: 100px;
    margin: 0 20px;
    padding: 20px 0;
  }
</style>
<style>
  .goods-approve-show-from .el-form-item {
    height: 20px;
  }
  .goods-approve-show-from .el-row {
    border-bottom: #3BB878 1px dashed;
  }
</style>
