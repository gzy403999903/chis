<template>
  <el-dialog
    title="存为病例模板"
    width="50%"
    append-to-body
    :show-close="false"
    :close-on-click-modal="false"
    :visible="visible"
    @opened="dialogOpened"
    @closed="dialogClosed">
    <el-form :model="editForm" ref="editForm" :rules="editFormRules" size="small" label-width="120px">
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
        <el-input type="textarea" v-model.trim="editForm.notes" ref="notes" resize="none" maxlength="50" show-word-limit/>
      </el-form-item>

      <el-form-item label="共享状态" prop="shareState">
        <el-switch v-model="editForm.shareState" active-color="#13ce66" inactive-color="#ff4949"/>
      </el-form-item>
    </el-form>
    <div style="text-align: right; padding-right: 20px; color: red; font-weight: 600;">
      ** 防止不必要的提交, 请在保存前确认是否已有类似模板存在
    </div>
    <span slot="footer">
        <el-button type="default" size="small" round icon="el-icon-close" @click="dialogClose">取 消</el-button>
        <el-button type="primary" size="small" round icon="el-icon-check" @click="submitData">确 定</el-button>
      </span>
  </el-dialog>
</template>

<script>
import {getPyCode} from '../../../../common/py'
export default {
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    clinicalHistory: {
      type: Object,
      required: true
    },
    dialogClose: {
      type: Function,
      required: true
    }
  },

  data () {
    return {
      editForm: {
        name: '',
        code: '',
        notes: '',
        shareState: false
      },
      editFormRules: {
        name: [
          {required: true, message: '不能为空'},
          {max: 20, message: '长度不合法[1-20]'}
        ],
        code: [
          {required: true, message: '不能为空'},
          {max: 20, message: '长度不合法[1-20]'}
        ]
      }
    }
  }, // end data

  methods: {
    /**
     * 保存为模板界面打开后执行的操作
     */
    dialogOpened () {
      this.$refs.name.focus()
    },

    /**
     * 保存为模板界面关闭后执行的操作
     */
    dialogClosed () {
      this.$refs.editForm.resetFields()
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
     * 将输入的名称转成拼音助记码
     */
    editFormSetPyCode () {
      this.editForm.code = getPyCode(this.editForm.name)
    },

    /**
     * 提交数据
     */
    submitData () {
      this.$refs.editForm.validate((valid) => {
        if (!valid) {
          return false
        }
        // 赋值其他属性(不能在这修改 clinicalHistory 属性)
        for (let key in this.clinicalHistory) {
          if (key !== 'id') {
            this.editForm[key] = this.clinicalHistory[key]
          }
        }
        // 提交数据
        this.$loading()
        let url = '/chisAPI/clinicalHistoryTemplate/save'
        let method = 'POST'
        let params = this.editForm

        this.$http({method, url, params}).then((res) => {
          if (res.data.code === 200) {
            this.$message.success(res.data.msg)
            this.dialogClose()
          } else {
            this.$message.error(res.data.msg)
          }
          this.$loading().close()
        })
      })
    }
  } // end methods
}
</script>

<style scoped>
</style>
