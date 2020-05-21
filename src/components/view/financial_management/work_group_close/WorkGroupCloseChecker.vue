<template>
  <el-dialog
    width="40%"
    append-to-body
    :show-close="false"
    :close-on-click-modal="false"
    :visible="dialog.visible"
    @opened="dialogOpened"
    @closed="dialogClosed">
    <el-row slot="title">
      <el-col :span="5" style="font-size: 20px;">
        <span>登记班次</span>
      </el-col>
      <el-col :span="19" style="text-align: right;">
        <el-button size="mini" type="primary" icon="el-icon-check" @click="registration">确 认</el-button>
        <el-button size="mini" type="warning" icon="el-icon-right" @click="dialogClose">取 消 [ 无法收/退费 ]</el-button>
      </el-col>
    </el-row>

    <el-form :model="editForm" ref="editForm" :rules="editFormRules" size="small" label-width="80px">
      <el-form-item label="日期" prop="currentDate">
        <el-date-picker
          style="width: 200px;"
          readonly
          v-model="editForm.currentDate"
          type="date"
          value-format="yyyy-MM-dd"
          :clearable="false"/>
      </el-form-item>
      <el-form-item label="姓名">
        <el-input v-model="payload.userName" readonly style="width: 200px;"/>
      </el-form-item>
      <el-form-item label="班次" prop="flmWorkGroupId">
        <el-select
          style="width: 200px;"
          v-model.trim="editForm.flmWorkGroupId"
          filterable
          default-first-option
          placeholder="请选择">
          <el-option v-for="item in workGroupList" :key="item.id" :value="item.id" :label="item.name"/>
        </el-select>
      </el-form-item>
    </el-form>

  </el-dialog>
</template>

<script>
import moment from 'moment'
import jwtDecode from 'jwt-decode'
export default {
  data () {
    return {
      dialog: {
        visible: false
      },
      payload: jwtDecode(this.$store.getters.token),

      editForm: {
        currentDate: moment(new Date()).format('YYYY-MM-DD'),
        flmWorkGroupId: ''
      },
      editFormRules: {
        flmWorkGroupId: [
          {required: true, message: '不能为空'}
        ]
      }
    }
  }, // end data

  computed: {
    workGroupList: function () {
      return this.$store.getters.workGroupList
    }
  }, // end computed

  methods: {
    /**
     * 界面打开
     */
    dialogOpen () {
      this.dialog.visible = true
    },

    /**
     * 界面关闭
     */
    dialogClose () {
      this.dialog.visible = false
    },

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
     * 验证是否在当前班结中
     */
    checkRegistration () {
      this.$loading()
      const url = `/chisAPI/workGroupClose/checkRegistration`
      let params = {
        userDate: moment(new Date()).format('YYYY-MM-DD')
      }
      this.$http.get(url, {params}).then((res) => {
        // 如果不在当前班结 则显示登记班次界面
        if (!res.data) {
          this.dialogOpen()
        }
        this.$loading().close()
      })
    },

    /**
     * 在当前班结中保存一个班次
     */
    registration () {
      this.$refs.editForm.validate((valid) => {
        // 验证表单
        if (!valid) {
          return false
        }
        // 提交数据
        this.$loading()
        const url = '/chisAPI/workGroupClose/registration'
        const method = 'POST'

        let params = {
          userDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
          flmWorkGroupId: this.editForm.flmWorkGroupId
        }

        this.$http({method, url, params}).then((res) => {
          if (res.data.code === 200) {
            this.$message.success(res.data.msg)
            this.dialogClose()
          }
          this.$loading().close()
        }) // end http
      }) // end this.$refs.editForm.validate
    } // end saveToCurrent

  } // end methods
}
</script>

<style scoped>
</style>
