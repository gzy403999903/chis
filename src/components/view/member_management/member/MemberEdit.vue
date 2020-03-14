<template>
  <el-dialog
    width="70%"
    :show-close="false"
    :close-on-click-modal="false"
    :visible="visible"
    @opened="dialogOpened"
    @closed="dialogClosed">

    <!-- 模态框标题栏与功能按钮-->
    <el-row slot="title">
      <el-col :span="12" style="font-size: 20px;">
        <span>会员信息</span>
      </el-col>
      <el-col :span="12" style="text-align: right;">
        <el-button size="mini" type="primary" icon="el-icon-check" @click="editFormSubmit">提 交</el-button>
        <el-button size="mini" type="warning" icon="el-icon-right" @click="dialogClose">返 回</el-button>
      </el-col>
    </el-row>

    <!-- 编辑表单 -->
    <el-form :model="editForm" ref="editForm" :rules="editFormRules" size="small" label-width="110px">
      <el-form-item prop="id" v-show="false">
        <el-input v-model.trim="editForm.id"/>
      </el-form-item>

      <el-row>
        <el-col :span="8">
          <el-form-item label="会员编号" prop="oid">
            <el-input v-model.trim="editForm.oid"
                      ref="oid" @keyup.enter.native="editFormValidateToNextFocus('oid', 'name')"/>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="8">
          <el-form-item label="姓名" prop="name">
            <el-input v-model.trim="editForm.name"
                      ref="name" @keyup.enter.native="editFormValidateToNextFocus('name', 'genderId')"
                      @blur="editFormSetPyCode('name', 'code')" @change="editFormSetPyCode('name', 'code')"/>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="助记码" prop="code">
            <el-input v-model.trim="editForm.code"/>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="性别" prop="genderId">
            <el-select
              ref="genderId"
              @keyup.enter.native="editFormValidateToNextFocus('genderId', 'phone')"
              v-model.trim="editForm.genderId"
              filterable
              placeholder="请选择">
              <el-option v-for="item in genderList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="8">
          <el-form-item label="本人电话" prop="phone">
            <el-input v-model.trim="editForm.phone"
                      ref="phone" @keydown.enter.native="editFormValidateToNextFocus('phone', 'idCardNo')"/>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="身份证号码" prop="idCardNo">
            <el-input v-model.trim="editForm.idCardNo"
                      ref="idCardNo" @keydown.enter.native="editFormValidateToNextFocus('idCardNo', 'birth')"/>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="出生年月" prop="birth">
            <el-date-picker
              style="width: 100%;"
              ref="birth"
              @change="editFormValidateToNextFocus('birth', 'mrmMemberTypeId')"
              v-model="editForm.birth"
              type="date"
              placeholder="选择日期"
              value-format="yyyy-MM-dd"
              :picker-options="pickerOptionsBefore">
            </el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="8">
          <el-form-item label="会员类型" prop="mrmMemberTypeId">
            <el-select
              ref="mrmMemberTypeId"
              @keydown.enter.native="editFormValidateToNextFocus('mrmMemberTypeId', 'eMail')"
              v-model.trim="editForm.mrmMemberTypeId"
              filterable
              placeholder="请选择">
              <el-option v-for="item in memberTypeList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="E-mail" prop="eMail">
            <el-input v-model.trim="editForm.eMail"
                      ref="eMail" @keydown.enter.native="editFormValidateToNextFocus('eMail', 'address')"/>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="16">
          <el-form-item label="现住址" prop="address">
            <el-input v-model.trim="editForm.address"
                      ref="address" @keydown.enter.native="editFormValidateToNextFocus('address', 'notes')"/>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="16">
          <el-form-item label="备注" prop="notes">
            <el-input v-model.trim="editForm.notes" ref="notes"/>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="启用状态" prop="state">
            <el-radio-group v-model="editForm.state">
              <el-radio :label="true">启用</el-radio>
              <el-radio :label="false">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="16">
          <el-form-item label="创建机构" prop="sysClinicName">
            <el-input v-model.trim="editForm.sysClinicName" readonly/>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="创建日期" prop="creationDate">
            <el-input v-model.trim="editForm.creationDate" readonly/>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

  </el-dialog>
</template>

<script>
import {getPyCode} from '../../../../common/py'
import jwtDecode from 'jwt-decode'
import {IdCardValidate} from '../../../../common/idCardVerify'
import moment from 'moment'

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
    // 验证身份证真实性
    let validateIdCardNo = (rule, value, callback) => {
      if (value && !IdCardValidate(value)) {
        callback(new Error('不正确的身份证号码'))
      } else {
        callback()
      }
    }

    // 验证生日是否与身份证匹配
    let validateBirthMatchIdCardNo = (rule, value, callback) => {
      if (value && this.editForm.idCardNo) {
        let idCardBirth = this.editForm.idCardNo.substring(6, 14)
        let birth = value.replace(/-/g, '')

        if (idCardBirth !== birth) {
          callback(new Error('不真实的出生日期'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }

    // 验证电话号码
    let validatePhone = (rule, value, callback) => {
      if (value && !(/^1[3456789]\d{9}$/.test(value))) {
        callback(new Error('不正确的手机号码'))
      } else {
        callback()
      }
    }

    return {
      pickerOptionsBefore: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        }
      },
      pickerOptionsAfter: {
        disabledDate (time) {
          return time.getTime() < Date.now()
        }
      },
      payload: jwtDecode(this.$store.getters.token),
      editForm: {
        id: '',
        oid: '',
        name: '',
        code: '',
        genderId: '',
        phone: '',
        idCardNo: '',
        birth: '',
        mrmMemberTypeId: '',
        eMail: '',
        address: '',
        notes: '',
        state: true,

        sysClinicName: '',
        creatorName: '',
        creationDate: ''
      },
      editFormRules: {
        oid: [
          {required: true, message: '不能为空'},
          {max: 30, message: '长度不合法[1-30]'}
        ],
        name: [
          {required: true, message: '不能为空'},
          {max: 10, message: '长度不合法[1-10]'}
        ],
        code: [
          {required: true, message: '不能为空'},
          {max: 10, message: '长度不合法[1-10]'}
        ],
        genderId: [
          {required: true, message: '不能为空'}
        ],
        phone: [
          {required: true, message: '不能为空'},
          {validator: validatePhone, trigger: 'blur'}
        ],
        idCardNo: [
          {validator: validateIdCardNo, trigger: 'blur'}
        ],
        birth: [
          {validator: validateBirthMatchIdCardNo}
        ],
        mrmMemberTypeId: [
          {required: true, message: '不能为空'}
        ],
        eMail: [
          {max: 30, message: '长度不合法[1-30]'},
          {type: 'email', message: '不正确的邮箱地址', trigger: 'blur'} // trigger: ['blur', 'change']
        ],
        address: [
          {max: 30, message: '长度不合法[1-30]'}
        ],
        notes: [
          {max: 50, message: '长度不合法[1-50]'}
        ]
      },
      select: {
        committees: []
      },
      submitAttr: {
        url: '',
        method: ''
      }
    }
  }, // end data

  computed: {
    genderList: function () {
      return this.$store.getters.genderList
    },
    memberTypeList: function () {
      return this.$store.getters.memberTypeList
    }
  },

  methods: {
    /* -------------------------------------------------------------------------------------------------------------- */
    /**
     * 界面打开后执行的内容
     */
    dialogOpened () {
      let row = this.row
      if (row.id) {
        // 填充表单
        for (let key in this.editForm) {
          if (row[key] !== undefined) {
            this.editForm[key] = row[key]
          }
        }
        // 设置提交地址
        this.submitAttr.url = `/chisAPI/member/update`
        this.submitAttr.method = 'PUT'
      } else {
        // 获取默认焦点
        this.$refs.oid.focus()
        // 填写创建机构、创建人、创建时间
        this.editForm.sysClinicName = this.payload.clinicName
        this.editForm.creatorName = this.payload.userName
        this.editForm.creationDate = moment(new Date()).format('YYYY-MM-DD')
        // 设置提交地址
        this.submitAttr.url = `/chisAPI/member/save`
        this.submitAttr.method = 'POST'
      }
    },

    /**
     * 关闭添加/编辑界面后执行的呢绒
     */
    dialogClosed () {
      this.$refs.editForm.resetFields()
    },

    /**
     * 将输入的名称转成拼音助记码
     */
    editFormSetPyCode () {
      this.editForm.code = getPyCode(this.editForm.name)
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
     * 提交数据
     */
    editFormSubmit () {
      this.$refs.editForm.validate((valid) => {
        if (!valid) {
          return false
        }
        this.$loading()
        let url = this.submitAttr.url
        let method = this.submitAttr.method
        let params = this.editForm

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
</style>
<style>
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9; /* 边线样式 */
    border-radius: 6px; /* 边角弧度 */
    cursor: pointer; /* 鼠标指针样式 */
    position: relative;
    left: 28%;
    overflow: hidden;
    background-color: white;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 180px;
    height: 210px;
    line-height: 210px;
    text-align: center;
  }
  .avatar {
    width: 180px;
    height: 210px;
    display: block;
  }
</style>
