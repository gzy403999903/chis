<template>
  <el-dialog
    width="600px"
    title="预约回访"
    :show-close="false"
    :close-on-click-modal="false"
    :visible="visible"
    @opened="dialogOpened"
    @closed="dialogClosed">

    <el-form :model="editForm" ref="editForm" :rules="editFormRules" size="small">
      <el-form-item label="预约日期" prop="appointmentDate">
        <el-date-picker
          v-model="editForm.appointmentDate"
          type="datetime"
          clearable
          value-format="yyyy-MM-dd HH:mm:ss"
          :default-value="new Date()"
          :picker-options="pickerOptions"
          placeholder="选择预约时间"/>
      </el-form-item>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button size="mini" @click="dialogClose">取 消</el-button>
      <el-button type="primary" size="mini" @click="submitData">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    mrmMember: {
      type: Object,
      required: true
    },
    dwtClinicalHistoryId: {
      type: Number,
      required: true
    },
    dialogClose: {
      type: Function,
      required: true
    }
  },

  data () {
    return {
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() < Date.now()
        }
      },
      editForm: {
        appointmentDate: ''
      },
      editFormRules: {
        appointmentDate: [
          {required: true, message: '不能为空'}
        ]
      }
    }
  },

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
      this.$refs.editForm.resetFields()
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

        this.$loading()
        let url = '/chisAPI/visitRecord/save'
        let method = 'POST'

        let params = this.editForm
        params.dwtClinicalHistoryId = this.dwtClinicalHistoryId
        params.mrmMemberId = this.mrmMember.id

        this.$http({method, url, params}).then((res) => {
          if (res.data.code === 200) {
            this.$message.success(res.data.msg)
            this.dialogClose()
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
