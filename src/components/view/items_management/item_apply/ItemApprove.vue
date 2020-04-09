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
        <span>项目审批</span>
      </el-col>
      <el-col :span="18" style="text-align: right;">
        <span style="font-size: 14px; font-weight: 600;" v-if="step.active === 1">零售单价&nbsp;&nbsp;
          <el-input-number size="mini" v-model="retailPrice" :controls="false" :max="99999" :min="0" :precision="2"
                           @change="retailPriceChange"
                           style="width: 130px; margin-right: -2px;"/>
          <el-button size="mini" type="default" plain icon="el-icon-money" @click="doPricing">项目定价</el-button>&nbsp;&nbsp;
        </span>

        <el-button size="mini" type="danger" plain icon="el-icon-close" @click="doAction('cancelPricing')"
                   v-if="step.active === 2">定价驳回</el-button>
        <el-button size="mini" type="danger" plain icon="el-icon-close" @click="doAction('unapproved')"
                   v-if="step.active === 2">项目驳回</el-button>
        <el-button size="mini" type="success" plain icon="el-icon-check" @click="doAction('approved')"
                   v-if="step.active === 2">审核通过</el-button>

        <el-button size="mini" type="danger" plain icon="el-icon-close" @click="doAction('lastCancelPricing')"
                   v-if="step.active === 3">定价驳回</el-button>
        <el-button size="mini" type="danger" plain icon="el-icon-close" @click="doAction('lastUnapproved')"
                   v-if="step.active === 3">项目驳回</el-button>
        <el-button size="mini" type="success" plain icon="el-icon-check" @click="doAction('lastApproved')"
                   v-if="step.active === 3">审批通过</el-button>
        <el-button size="mini" type="warning" icon="el-icon-right" @click="dialogClose">返 回</el-button>
      </el-col>
    </el-row>

    <div :style="`height:${$store.getters.dialogDataGridHeight}px;`" style="background-color: white; padding-top: 20px;">
      <el-steps :active="step.active" align-center style="height: 50px;">
        <el-step title="发起" icon="el-icon-s-promotion" :description="step.description0"/>
        <el-step title="项目定价" icon="el-icon-user-solid" :description="step.description1"/>
        <el-step title="项目审核" icon="el-icon-user-solid" :description="step.description2"/>
        <el-step title="项目审批" icon="el-icon-user-solid" :description="step.description3"/>
        <el-step title="审批通过" icon="el-icon-success"/>
      </el-steps>

      <el-form size="small" label-width="110px" class="goods-approve-show-from">
        <el-row>
          <el-col :span="4">
            <el-form-item label="项目类型">
              {{this.row.cimItemTypeName}}
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="项目名称">
              {{this.row.name}}
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
            <el-form-item label="可执行次数">
              {{this.row.quantity}}
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="单位">
              {{this.row.itemUnitsName}}
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="适用性别">
              {{this.row.befitGenderName ? this.row.befitGenderName : '全部'}}
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="计费类型">
              {{this.row.billingTypeName}}
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="项目分类">
              {{this.row.itemClassifyName}}
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
            <el-form-item label="是否可退">
              {{this.row.returnable ? '是' : '否'}}
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="是否医保">
              {{this.row.ybItem ? '是' : '否'}}
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="启用状态">
              {{this.row.state ? '是' : '否'}}
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24">
            <el-form-item label="项目说明">
              {{this.row.explains}}
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
          this.step.active = 3
          this.step.description3 = '待审批'
          break
        case this.approveState.LAST_APPROVED:
          this.step.active = 4
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
      if (this.step.active > 3) {
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

      this.$confirm(`当前项目定价为:&nbsp;&nbsp;
                   <span style="color: red; font-size: 18px; font-weight: 600;">${this.retailPrice}&nbsp;元</span><br/>
                   确认执行该操作吗?`, '提示', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', showClose: false, dangerouslyUseHTMLString: true
      }).then(() => {
        this.$loading()
        const url = `/chisAPI/itemApply/pricing`
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
        const url = `/chisAPI/itemApply/${action}`
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
