<template>
  <div>
    <el-row class="inquiry-top">
      <el-col :span="24" align="right">
        <el-button size="small" @click="saveDialogOpen">存为病历模板</el-button>
        <el-button size="small" @click="loadDialogOpen('template')">导入病历模板</el-button>
        <el-button size="small" @click="loadDialogOpen('record')">导入历史病历</el-button>
        <el-button size="small" type="primary" @click="submitData">提交病历</el-button>
      </el-col>
    </el-row>

    <el-row class="inquiry-body">
      <el-col :span="14" style="padding-right: 15px;">
        <el-form :model="editForm" ref="editForm" :rules="editFormRules" size="small" label-width="90px">
          <!-- id 隐藏 -->
          <el-form-item prop="id" v-show="false">
            <el-input v-model="editForm.id"/>
          </el-form-item>
          <el-form-item label="主诉" prop="chiefComplaint">
            <el-input type="textarea" v-model.trim="editForm.chiefComplaint" resize="none" maxlength="50" show-word-limit
                      ref="chiefComplaint" @keyup.enter.native="editFormValidateToNextFocus('chiefComplaint', 'presentIllness')"/>
          </el-form-item>

          <el-form-item label="现病史" prop="presentIllness">
            <el-input type="textarea" v-model.trim="editForm.presentIllness" resize="none" maxlength="300" show-word-limit
                      ref="presentIllness" @keyup.enter.native="editFormValidateToNextFocus('presentIllness', 'physicalExamination')"/>
          </el-form-item>

          <el-form-item label="查体" prop="physicalExamination">
            <el-input type="textarea" v-model.trim="editForm.physicalExamination" resize="none" maxlength="300" show-word-limit
                      ref="physicalExamination" @keyup.enter.native="editFormValidateToNextFocus('physicalExamination', 'pastHistory')"/>
          </el-form-item>

          <el-form-item label="既往史" prop="pastHistory">
            <el-input type="textarea" v-model.trim="editForm.pastHistory" resize="none" maxlength="300" show-word-limit
                      ref="pastHistory" @keyup.enter.native="editFormValidateToNextFocus('pastHistory', 'allergenHistory')"/>
          </el-form-item>

          <el-form-item label="过敏史" prop="allergenHistory">
            <el-input type="textarea" v-model.trim="editForm.allergenHistory" resize="none" maxlength="300" show-word-limit
                      ref="allergenHistory" @keyup.enter.native="editFormValidateToNextFocus('allergenHistory', 'auxiliaryExamination')"/>
          </el-form-item>

          <el-form-item label="辅助检查" prop="auxiliaryExamination">
            <el-input type="textarea" v-model.trim="editForm.auxiliaryExamination" resize="none" maxlength="300" show-word-limit
                      ref="auxiliaryExamination" @keyup.enter.native="editFormValidateToNextFocus('auxiliaryExamination', 'dialectical')"/>
          </el-form-item>

          <el-form-item label="辩证" prop="dialectical">
            <el-input type="textarea" v-model.trim="editForm.dialectical" resize="none" maxlength="300" show-word-limit
                      ref="dialectical" @keyup.enter.native="editFormValidateToNextFocus('dialectical', 'commonDiagnoseId')"/>
          </el-form-item>
        </el-form><!--end left-->
      </el-col>

      <el-col :span="10" style="padding-right: 15px;">
        <el-table
          max-height="422px"
          :data="commonDiagnose.data"
          stripe
          size="mini">
          <el-table-column fixed="left" type="index" width="40"/>
          <el-table-column fixed="left" label="操作" align="center" width="75">
            <template slot-scope="scope">
              <el-button size="mini" type="danger" icon="el-icon-delete" @click="commonDiagnoseDelete(scope.row.id)"/>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="诊断疾病名称" show-overflow-tooltip/>
        </el-table>

        <el-row style="margin-top: 20px;">
          <el-col :span="6">
            <el-select v-model="editForm.dwtDiagnoseTypeId"
                       @change="diagnoseTypeChange"
                       :disabled="commonDiagnose.data.length > 0"
                       placeholder="请选择">
              <el-option label="西医诊断" :value="diagnoseType.WESTERN_DIAGNOSE"/>
              <el-option label="中医诊断" :value="diagnoseType.CHINESE_DIAGNOSE"/>
            </el-select>
          </el-col>
          <el-col :span="18">
            <el-select
              ref="commonDiagnoseId"
              v-model.trim="commonDiagnose.id"
              placeholder="输入 诊断疾病名称 / 助记码 检索"
              :remote-method="queryCommonDiagnose"
              :loading="select.loading"
              remote
              clearable
              :allow-create="allowCreateDiagnose"
              @change="commonDiagnoseSelected"
              filterable>
              <el-option class="custom-el-option" :value="null" v-if="select.commonDiagnose.length > 0" disabled>
                <span class="select-option-top">诊断疾病名称</span>
              </el-option>
              <el-option v-for="item in select.commonDiagnose" :key="item.id" :value="item.id" :label="item.name" class="custom-el-option">
                <span class="select-option-text">{{item.name}}</span>
              </el-option>
            </el-select>
          </el-col>
        </el-row>
      </el-col><!--end right-->
    </el-row>

    <!-- 保存为病例模板 -->
    <ClinicalHistoryTemplateSave :visible="dialog.saveVisible" :clinical-history="editForm"
                                 :dialog-close="saveDialogClose"/>
    <!-- 病例预加载(模板、历史病例) -->
    <ClinicalHistoryTemplatePreload :visible="dialog.loadVisible" :mrm-member-id="mrmMemberId" :action="action"
                            :dialog-close="loadDialogClose" :loadFromTemplate="loadFromTemplate"/>
  </div>
</template>

<script>
import PubSub from 'pubsub-js'
import {getPyCode} from '../../../../common/py'
import ClinicalHistoryTemplateSave from './ClinicalHistoryTemplateSave'
import ClinicalHistoryTemplatePreload from './ClinicalHistoryTemplatePreload'

export default {
  props: {
    mrmMemberId: {
      type: Number,
      required: true
    },
    setDwtClinicalHistoryId: {
      type: Function,
      required: true
    }
  },

  components: {
    ClinicalHistoryTemplateSave,
    ClinicalHistoryTemplatePreload
  },

  data () {
    return {
      diagnoseType: this.$store.getters.diagnoseType, // 诊断类型
      allowCreateDiagnose: this.$store.getters.allowCreateDiagnose, // 是否允许创建诊断
      action: '', // template: 从模板中加载病例  record 从记录中加载病例
      editForm: {
        id: '', // id
        mrmMemberId: '', // 会员 ID
        chiefComplaint: '', // 主诉
        presentIllness: '', // 现病史
        physicalExamination: '', // 查体
        pastHistory: '', // 既往史
        allergenHistory: '', // 过敏史
        auxiliaryExamination: '', // 辅助检查
        dialectical: '', // 辩证
        diagnoseJson: '', // 诊断 JSON
        dwtDiagnoseTypeId: 1 // 诊断类型 ID
      },
      editFormRules: {
        chiefComplaint: [
          {required: true, message: '不能为空'}
        ],
        presentIllness: [
          {required: true, message: '不能为空'}
        ],
        physicalExamination: [
          {required: true, message: '不能为空'}
        ],
        pastHistory: [
          {required: true, message: '不能为空'}
        ],
        allergenHistory: [
          {required: true, message: '不能为空'}
        ],
        auxiliaryExamination: [
          {required: true, message: '不能为空'}
        ]
      },
      commonDiagnose: {
        data: [], // 诊断数据
        id: '' // 选择的诊断ID
      },
      select: {
        loading: false,
        commonDiagnose: []
      },
      dialog: {
        saveVisible: false,
        loadVisible: false
      }
    }
  }, // end data

  mounted () {
    // 接收订阅初始化页面
    PubSub.subscribe('receptionTabsPageReset', (msg) => {
      this.pageReset()
    })
    // 接收订阅获取未归档的病例
    PubSub.subscribe('loadLastUnfinishedForClinicalHistory', (msg) => {
      this.loadClinicalHistory()
    })
  }, // end mounted

  destroyed () {
    PubSub.unsubscribe('receptionTabsPageReset')
    PubSub.unsubscribe('loadLastUnfinishedForClinicalHistory')
  }, // end destroyed

  methods: {
    /**
     * 载入对应会员未进行归档的病例信息
     * 该方法的 loading 会在 Reception 组件中的 loadMember () 方法开始
     */
    loadClinicalHistory () {
      // this.$loading()
      const url = '/chisAPI/clinicalHistory/getLastUnfinishedByCriteria'
      let params = {mrmMemberId: this.mrmMemberId}
      this.$http.get(url, {params}).then((res) => {
        if (res.data.code === 200) {
          const clinicalHistory = res.data.resultSet.clinicalHistory
          if (clinicalHistory) {
            this.loadClinicalHistoryToEditForm(clinicalHistory)
          }
        } else {
          this.$message.error(res.data.msg)
        }
        this.$loading().close()
      })
    },

    /**
     * 将病例信息载入到编辑表单
     */
    loadClinicalHistoryToEditForm (clinicalHistory) {
      // 赋值返回病例ID
      if (clinicalHistory.id !== '' && clinicalHistory.id !== 0) {
        this.setDwtClinicalHistoryId(clinicalHistory.id)
      }
      // 赋值编辑表单属性
      for (let key in this.editForm) {
        this.editForm[key] = clinicalHistory[key]
      }
      // 赋值诊断列表
      this.commonDiagnose.data = JSON.parse(this.editForm.diagnoseJson)
    },

    /* -------------------------------------------------------------------------------------------------------------- */

    /**
     * 初始化页面
     */
    pageReset () {
      // 初始化表单
      if (this.$refs.editForm !== undefined) {
        this.$refs.editForm.resetFields()
      }
      // 初始化诊断
      this.commonDiagnose.id = ''
      this.commonDiagnose.data = []
      this.select.commonDiagnose = []
    },

    /**
     * 验证当前输入通过后获取下一个焦点
     * @param currentProp
     * @param nextRef
     */
    editFormValidateToNextFocus (currentProp, nextRef) {
      this.$refs.editForm.validateField(currentProp, (valid) => {
        if (!valid) {
          this.$refs[nextRef].focus()
        } else {
          return false
        }
      })
    },

    /**
     * 诊断类型发生改变时执行内容
     */
    diagnoseTypeChange () {
      // 清空查询的常用常用诊断类型
      this.select.commonDiagnose = []
      // 清空已经录入的常用诊断类型(一般不需要此操作 )
      this.commonDiagnose.data = []
    },

    /**
     * 检索常用诊断
     */
    queryCommonDiagnose (name) {
      if (name.trim()) {
        this.select.loading = true
        // 做一个0.5秒的延迟查询, 避免用户输入速度过慢时的频发查询
        setTimeout(() => {
          let url = ''
          if (this.editForm.dwtDiagnoseTypeId === this.diagnoseType.WESTERN_DIAGNOSE) {
            url = `/chisAPI/westernCommonDiagnose/getLikeByName`
          } else {
            url = `/chisAPI/chineseCommonDiagnose/getLikeByName`
          }
          let params = {name}
          this.$http.get(url, {params}).then((res) => {
            this.select.commonDiagnose = res.data
            this.select.loading = false
          })
        }, (this.select.commonDiagnose ? 0 : 500)) // 当查询结果不为0时, 才会有 0.5 秒的延迟查询
      }
    },

    /**
     * 选中诊断后执行的操作
     * @param id
     */
    commonDiagnoseSelected (id) {
      // 获取选中的诊断
      let commonDiagnose = this.select.commonDiagnose.find(item => {
        return item.id === id
      })

      // 判断诊断是否上限
      if (this.commonDiagnose.data.length >= 10) {
        this.commonDiagnoseReset()
        this.$message.error('诊断录入上限')
        return
      }

      // 判断诊断是否已经存在
      if (!this.commonDiagnose.data.every(item => item.id !== id)) {
        this.commonDiagnoseReset()
        this.$message.error('该诊断已被录入')
        return
      }

      let row = {}
      // 如果没有在选择列表中获取到常用诊断则创建该诊断
      if (!commonDiagnose) {
        // 过滤可能出现的特殊字符
        id = id.replace('%', '')
        // 如果输入的是空则不进行创建
        if (!id.trim()) {
          this.commonDiagnoseReset()
          return
        }
        // 开始创建
        row.id = id // 为防止重复录入,暂时将该诊断名称作为 ID 使用, 后台创建时需根据 ID 创建规则创建
        row.name = id // 诊断名称
        row.code = getPyCode(id) // 助记码
      } else {
        // 如果该诊断已在列表存在 则直接使用
        row.id = commonDiagnose.id
        row.name = commonDiagnose.name
        row.code = commonDiagnose.code
      }
      this.commonDiagnose.data.push(row)

      // 清空当前选中内容并获取焦点
      this.commonDiagnoseReset()
    },

    commonDiagnoseReset () {
      this.commonDiagnose.id = ''
      this.select.commonDiagnose = []
      this.$refs.commonDiagnoseId.focus()
    },

    /**
     * 删除常用诊断
     */
    commonDiagnoseDelete (id) {
      this.commonDiagnose.data = this.commonDiagnose.data.filter(item => {
        return item.id !== id
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
        if (!this.mrmMemberId) {
          this.$message.error('未能获取会员信息')
          return false
        }

        // 验证诊断
        if (this.commonDiagnose.data.length === 0) {
          this.$message.error('请填写诊断')
          return false
        }

        this.$loading()
        let url = '/chisAPI/clinicalHistory/save'
        let method = 'POST'
        if (this.editForm.id) {
          url = '/chisAPI/clinicalHistory/update'
          method = 'PUT'
        }

        this.editForm.mrmMemberId = this.mrmMemberId // 会员ID
        this.editForm.diagnoseJson = JSON.stringify(this.commonDiagnose.data) // 诊断JSON
        let params = this.editForm

        this.$http({method, url, params}).then((res) => {
          if (res.data.code === 200) {
            this.$message.success(res.data.msg)
            // 设置返回病例 ID
            this.editForm.id = res.data.resultSet.id
            this.setDwtClinicalHistoryId(res.data.resultSet.id)
          } else {
            this.$message.error(res.data.msg)
          }
          this.$loading().close()
        })
      })
    },

    /* -------------------------------------------------------------------------------------------------------------- */
    /**
     * 打开保存为模板界面
     */
    saveDialogOpen () {
      this.$refs.editForm.validate((valid) => {
        if (!valid) {
          this.$message.error('病例填写不完整')
          return false
        }
        // 验证诊断
        if (this.commonDiagnose.data.length === 0) {
          this.$message.error('请填写诊断')
          return false
        }
        // 诊断JSON
        this.editForm.diagnoseJson = JSON.stringify(this.commonDiagnose.data)
        // 开启界面
        this.dialog.saveVisible = true
      })
    },

    /**
     * 关闭保存为模板界面
     */
    saveDialogClose () {
      this.dialog.saveVisible = false
    },

    /* -------------------------------------------------------------------------------------------------------------- */
    /**
     * 打开病例模板界面
     */
    loadDialogOpen (action) {
      if (this.editForm.id) {
        this.$message.error('病例已填写完成, 无法再次进行导入')
        return false
      }
      this.action = action
      this.dialog.loadVisible = true
    },

    /**
     * 关闭病例模板界面
     */
    loadDialogClose () {
      this.dialog.loadVisible = false
    },

    /**
     * 载入选中病例
     * 此方法由  ClinicalHistoryTemplatePreload 调用
     * @param clinicalHistory
     */
    loadFromTemplate (clinicalHistory) {
      // 载入到编辑表单
      this.loadClinicalHistoryToEditForm(clinicalHistory)
    }

  } // end methods
}
</script>

<style scoped>
</style>
<style>
  .inquiry-top {
    margin-bottom: 15px;
  }

  .inquiry-body {
    max-height: 550px;
    min-height: 550px;
    padding: 15px 0;
    border: #3BB878 2px solid;
    background-color: white;
  }

  .inquiry-body textarea {
    font-size: 14px;
    font-weight: 500;
    color: #3BB878;
  }
</style>
