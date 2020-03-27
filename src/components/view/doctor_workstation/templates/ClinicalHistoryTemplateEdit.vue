<template>
  <el-dialog
    width="75%"
    top="3.5%"
    :show-close="false"
    :close-on-click-modal="false"
    :visible="visible"
    @opened="dialogOpened"
    @closed="dialogClosed">

    <!-- 模态框标题栏与功能按钮 -->
    <el-row slot="title">
      <el-col :span="5" style="font-size: 20px;">
        <span>病例模板</span>
      </el-col>
      <el-col :span="19" style="text-align: right;">
        <el-button size="mini" type="primary" icon="el-icon-check" @click="submitData" v-if="editable">提 交</el-button>
        <el-button size="mini" type="warning" icon="el-icon-right" @click="dialogClose">返 回</el-button>
      </el-col>
    </el-row>

    <!-- 编辑表单 -->
    <el-form :model="editForm" ref="editForm" :rules="editFormRules" size="small" label-width="110px" :disabled="!editable">
      <el-form-item prop="id" v-show="false">
        <el-input v-model.trim="editForm.id"/>
      </el-form-item>

      <el-row>
        <el-col :span="14" class="clinical-history-template">
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
                      ref="dialectical" @keyup.enter.native="editFormValidateToNextFocus('dialectical', 'name')"/>
          </el-form-item>
        </el-col><!-- end left-->

        <el-col :span="10" style="padding-left: 20px;">
          <el-form-item label="病例模板名称" prop="name">
            <el-input v-model.trim="editForm.name" ref="name"
                      @keyup.enter.native="editFormValidateToNextFocus('name', 'notes')"
                      @blur="editFormSetPyCode('name', 'code')" @change="editFormSetPyCode('name', 'code')"/>
          </el-form-item>

          <el-form-item label="助记码" prop="code">
            <el-input v-model.trim="editForm.code" ref="code"
                      @keyup.enter.native="editFormValidateToNextFocus('code', 'notes')"/>
          </el-form-item>

          <el-form-item label="备注" prop="notes">
            <el-input type="textarea" v-model.trim="editForm.notes" ref="notes" resize="none" maxlength="50" show-word-limit
                      @keyup.enter.native="editFormValidateToNextFocus('notes', 'commonDiagnoseId')"/>
          </el-form-item>

          <el-form-item label="共享状态" prop="shareState">
            <el-switch v-model="editForm.shareState" active-color="#13ce66" inactive-color="#ff4949"/>
          </el-form-item>

          <el-table
            max-height="180px"
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
                :loading="selectData.loading"
                remote
                clearable
                :allow-create="allowCreateDiagnose"
                @change="commonDiagnoseSelected"
                filterable>
                <el-option class="custom-el-option" :value="null" v-if="selectData.commonDiagnose.length > 0" disabled>
                  <span class="select-option-top">诊断疾病名称</span>
                </el-option>
                <el-option v-for="item in selectData.commonDiagnose" :key="item.id" :value="item.id" :label="item.name" class="custom-el-option">
                  <span class="select-option-text">{{item.name}}</span>
                </el-option>
              </el-select>
            </el-col>
          </el-row>
        </el-col> <!-- end right-->
      </el-row>
    </el-form>
  </el-dialog>
</template>

<script>
import {getPyCode} from '../../../../common/py'
import jwtDecode from 'jwt-decode'
export default {
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    row: {
      type: Object,
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
      payload: jwtDecode(this.$store.getters.token),
      diagnoseType: this.$store.getters.diagnoseType, // 诊断类型
      allowCreateDiagnose: this.$store.getters.allowCreateDiagnose, // 是否允许创建诊断
      editable: true, // 是否可编辑
      url: '',
      method: 'POST',
      editForm: {
        id: '', // ID
        name: '', // 模板名称
        code: '', // 助记码
        shareState: false, // 共享状态
        dwtDiagnoseTypeId: 1, // 诊断类型 ID
        chiefComplaint: '', // 主诉
        presentIllness: '', // 现病史
        physicalExamination: '', // 查体
        pastHistory: '', // 既往史
        allergenHistory: '', // 过敏史
        auxiliaryExamination: '', // 辅助检查
        dialectical: '', // 辩证
        diagnoseJson: '', // 诊断 JSON
        notes: '' // 备注
      },
      editFormRules: {
        name: [
          {required: true, message: '不能为空'},
          {max: 20, message: '长度不合法[1-20]'}
        ],
        code: [
          {required: true, message: '不能为空'},
          {max: 20, message: '长度不合法[1-20]'}
        ],
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
        data: [],
        id: ''
      },
      selectData: {
        loading: false,
        commonDiagnose: []
      }
    }
  }, // end data

  methods: {
    /* -------------------------------------------------------------------------------------------------------------- */
    /**
     * 界面打开后执行的内容
     */
    dialogOpened () {
      if (this.row.id) {
        // 赋值编辑表单属性
        for (let key in this.editForm) {
          if (this.editForm.hasOwnProperty(key)) {
            this.editForm[key] = this.row[key]
          }
        }
        // 赋值诊断列表
        this.commonDiagnose.data = JSON.parse(this.editForm.diagnoseJson)
        // 赋值提交属性
        this.url = '/chisAPI/clinicalHistoryTemplate/update'
        this.method = 'PUT'
        // 如果是编辑操作判断是否为创建人, 如果不是则禁用编辑
        this.editable = this.row.sysDoctorId === this.payload.userId
      } else {
        // 赋值提交属性
        this.url = '/chisAPI/clinicalHistoryTemplate/save'
        this.method = 'POST'
        this.$refs.chiefComplaint.focus()
        // 如果是添加操作, 则允许编辑
        this.editable = true
      }
    },

    /**
     * 关闭添加/编辑界面后执行的内容
     */
    dialogClosed () {
      this.$refs.editForm.resetFields()
      this.commonDiagnose.id = ''
      this.commonDiagnose.data = []
      this.selectData.commonDiagnose = []
    },

    /* -------------------------------------------------------------------------------------------------------------- */

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
     * 将输入的名称转成拼音助记码
     */
    editFormSetPyCode () {
      this.editForm.code = getPyCode(this.editForm.name)
    },

    /**
     * 诊断类型发生改变时执行内容
     */
    diagnoseTypeChange () {
      // 清空查询的常用常用诊断类型
      this.selectData.commonDiagnose = []
      // 清空已经录入的常用诊断类型(一般不需要此操作 )
      this.commonDiagnose.data = []
    },

    /**
     * 检索常用诊断
     * 做一个0.5秒的延迟查询, 避免用户输入速度过慢时的频发查询
     * 当查询结果不为0时, 才会有 0.5 秒的延迟查询
     */
    queryCommonDiagnose (name) {
      if (name.trim()) {
        this.selectData.loading = true
        setTimeout(() => {
          let url = ''
          if (this.editForm.dwtDiagnoseTypeId === this.diagnoseType.WESTERN_DIAGNOSE) {
            url = `/chisAPI/westernCommonDiagnose/getLikeByName`
          } else {
            url = `/chisAPI/chineseCommonDiagnose/getLikeByName`
          }
          let params = {name}
          this.$http.get(url, {params}).then((res) => {
            this.selectData.commonDiagnose = res.data
            this.selectData.loading = false
          })
        }, (this.selectData.commonDiagnose ? 0 : 500))
      }
    },

    /**
     * 选中诊断后执行的操作
     * @param id
     */
    commonDiagnoseSelected (id) {
      // 获取选中的诊断
      let commonDiagnose = this.selectData.commonDiagnose.find(item => {
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
      this.selectData.commonDiagnose = []
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

        // 验证是否填写诊断
        if (this.commonDiagnose.data.length === 0) {
          this.$message.error('未填写诊断')
          return false
        }

        // 如果是添加 则将诊断转成 JSON 赋值到 editForm
        if (this.method === 'POST') {
          this.editForm.diagnoseJson = JSON.stringify(this.commonDiagnose.data)
        }

        this.$loading()
        let url = this.url
        let method = this.method
        let params = this.editForm

        this.$http({method, url, params}).then((res) => {
          if (res.data.code === 200) {
            this.$message.success(res.data.msg)
            this.dialogClose()
            this.dataGridLoadData()
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
</style>
<style>
  .clinical-history-template textarea {
    font-size: 14px;
    font-weight: 500;
    color: #3BB878;
  }
</style>
