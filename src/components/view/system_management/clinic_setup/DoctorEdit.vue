<template>
  <el-dialog
    top="3%"
    width="65%"
    :show-close="false"
    :close-on-click-modal="false"
    :visible="dialog.visible"
    @opened="dialogOpened"
    @closed="dialogClosed">

    <!-- 模态框标题栏与功能按钮 -->
    <el-row slot="title">
      <el-col :span="5" style="font-size: 20px;">
        <span>门诊医生注册</span>
      </el-col>
      <el-col :span="19" style="text-align: right;">
        <el-button size="mini" type="primary" icon="el-icon-check" @click="editFormSubmit">提 交</el-button>
        <el-button size="mini" type="warning" icon="el-icon-right" @click="dialog.visible = false">返 回</el-button>
      </el-col>
    </el-row>

    <el-form :model="editForm" ref="editForm" :rules="editFormRules" size="small" label-width="120px">
      <el-row>
        <el-col :span="14">
          <el-form-item label="账户注册地" prop="sysClinicId">
            <el-select
              ref="sysClinicId"
              v-model.trim="editForm.sysClinicId"
              @change="clinicIdChange"
              filterable
              placeholder="请选择">
              <el-option v-for="item in sysClinicList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
            </el-select>
          </el-form-item>

          <el-form-item label="执业注册地" prop="mainSysClinicId">
            <el-select
              ref="mainSysClinicId"
              v-model.trim="editForm.mainSysClinicId"
              filterable
              placeholder="请选择">
              <el-option v-for="item in sysClinicList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
            </el-select>
          </el-form-item>

          <el-form-item label="多点执业地" prop="subSysClinicId">
            <el-select
              ref="subSysClinicId"
              v-model.trim="editForm.subSysClinicId"
              filterable
              clearable
              placeholder="请选择">
              <el-option v-for="item in sysClinicList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
            </el-select>
          </el-form-item>

          <el-form-item label="多点有效期" prop="subSysClinicExpiryDate">
            <el-date-picker
              ref="subSysClinicExpiryDate"
              v-model="editForm.subSysClinicExpiryDate"
              type="date"
              placeholder="选择日期"
              value-format="yyyy-MM-dd"
              :picker-options="pickerOptions"
              clearable
              style="width: 50%;"/>
          </el-form-item>

          <el-form-item label="简介" prop="intro">
            <el-input type="textarea" v-model="editForm.intro" :rows="3" resize="none"/>
          </el-form-item>

          <el-row>
            <el-col :span="12">
              <el-form-item label="医生头像" prop="avatarUrl">
                <el-upload
                  class="uploader-box"
                  action=""
                  :show-file-list="false"
                  :before-upload="uploadAvatarBefore"
                  :http-request="uploadAvatar">
                  <el-image v-if="editForm.avatarUrl" :src="'/chisAPI' + editForm.avatarUrl" fit="contain" class="image-box"/>
                  <i v-else class="el-icon-plus uploader-box-icon"></i>
                </el-upload>
                <el-button size="mini" class="uploader-del-btn" @click="deleteAvatar">删除头像</el-button>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="医生签名" prop="signatureUrl">
                <el-upload
                  class="uploader-box"
                  action=""
                  :show-file-list="false"
                  :before-upload="uploadSignatureBefore"
                  :http-request="uploadSignature">
                  <el-image v-if="editForm.signatureUrl" :src="'/chisAPI' + editForm.signatureUrl" fit="contain" class="image-box"/>
                  <i v-else class="el-icon-plus uploader-box-icon"></i>
                </el-upload>
                <el-button size="mini" class="uploader-del-btn" @click="deleteSignature">删除签名</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-col> <!-- end left -->

        <el-col :span="10">
          <el-form-item label="医生姓名" prop="id">
            <el-select
              ref="id"
              v-model.trim="editForm.id"
              filterable
              placeholder="请选择">
              <el-option v-for="item in dialog.clinicUserList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
            </el-select>
          </el-form-item>

          <el-form-item label="科室名称" prop="sysClinicRoomId">
            <el-select
              ref="sysClinicRoomId"
              v-model.trim="editForm.sysClinicRoomId"
              filterable
              placeholder="请选择">
              <el-option v-for="item in dialog.clinicRoomList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
            </el-select>
          </el-form-item>

          <el-form-item label="医师职称" prop="doctorTitlesId">
            <el-select
              ref="doctorTitlesId"
              v-model.trim="editForm.doctorTitlesId"
              filterable
              placeholder="请选择">
              <el-option v-for="item in doctorTitlesList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
            </el-select>
          </el-form-item>

          <el-form-item label="执业类别" prop="practiceTypeId">
            <el-select
              ref="practiceTypeId"
              v-model.trim="editForm.practiceTypeId"
              @change="loadPracticeScopeList"
              filterable
              placeholder="请选择">
              <el-option v-for="item in practiceTypeList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
            </el-select>
          </el-form-item>

          <el-form-item label="职业范围" prop="sysPracticeScopeId">
            <el-select
              ref="sysPracticeScopeId"
              v-model.trim="editForm.sysPracticeScopeId"
              filterable
              placeholder="请选择">
              <el-option v-for="item in dialog.practiceScopeList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
            </el-select>
          </el-form-item>
        </el-col> <!-- end right -->
      </el-row>

    </el-form>
  </el-dialog>
</template>

<script>
export default {
  props: {
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
      signatureFile: '',
      avatarFile: '',
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() < Date.now()
        }
      },
      editForm: {
        id: '',
        sysClinicId: '',
        mainSysClinicId: '',
        subSysClinicId: '',
        subSysClinicExpiryDate: '',
        sysClinicRoomId: '',
        doctorTitlesId: '',
        practiceTypeId: '',
        sysPracticeScopeId: '',
        intro: '',
        avatarUrl: '',
        signatureUrl: ''
      },
      editFormRules: {
        id: [
          {required: true, message: '不能为空'}
        ],
        sysClinicId: [
          {required: true, message: '不能为空'}
        ],
        mainSysClinicId: [
          {required: true, message: '不能为空'}
        ],
        sysClinicRoomId: [
          {required: true, message: '不能为空'}
        ],
        doctorTitlesId: [
          {required: true, message: '不能为空'}
        ],
        practiceTypeId: [
          {required: true, message: '不能为空'}
        ],
        sysPracticeScopeId: [
          {required: true, message: '不能为空'}
        ],
        intro: [
          {max: 200, message: '长度不合法[1-200]'}
        ]
      },
      dialog: {
        url: '',
        method: 'POST',
        visible: false,
        clinicUserList: [],
        clinicRoomList: [],
        practiceScopeList: []
      }
    }
  }, // end data

  computed: {
    sysClinicList: function () {
      return this.$store.getters.sysClinicList
    },
    doctorTitlesList: function () {
      return this.$store.getters.doctorTitlesList
    },
    practiceTypeList: function () {
      return this.$store.getters.practiceTypeList
    }
  }, // end computed

  methods: {
    /**
     * 添加/编辑界面打开后执行的内容
     */
    dialogOpened () {
      let row = this.row
      if (row.id) {
        this.clinicIdChange(row.sysClinicId) // 预加载数据[不能放到赋值后]
        if (row.practiceTypeId) {
          this.loadPracticeScopeList(row.practiceTypeId) // 预加载数据[不能放到赋值后]
        }
        for (let key in this.editForm) {
          if (this.editForm.hasOwnProperty(key)) {
            this.editForm[key] = row[key]
          }
        }
        this.dialog.url = `/chisAPI/doctor/update`
        this.dialog.method = 'PUT'
      } else {
        this.dialog.url = `/chisAPI/doctor/save`
        this.dialog.method = 'POST'
      }
    },

    /**
     * 关闭添加/编辑界面后执行的呢绒
     */
    dialogClosed () {
      this.$refs.editForm.resetFields()
      this.signatureFile = ''
      this.avatarFile = ''
    },

    /**
     * 当机构所在机构 ID 改变时进行的操作
     */
    clinicIdChange (sysClinicId) {
      this.loadClinicUserList(sysClinicId)
      this.loadClinicRoomList(sysClinicId)
    },

    /**
     * 载入对应机构用户
     */
    loadClinicUserList (sysClinicId) {
      // 清空 已选中的 医师 ID
      this.editForm.id = ''
      // 进行查询
      const url = `/chisAPI/user/getEnabledByClinicId`
      let params = {sysClinicId}

      this.$http.get(url, {params}).then((res) => {
        if (res.data.code === 200) {
          this.dialog.clinicUserList = res.data.resultSet.list
        }
      })
    },

    /**
     * 载入对应机构诊室
     */
    loadClinicRoomList (sysClinicId) {
      // 清空 已选中的 诊室 ID
      this.editForm.sysClinicRoomId = ''
      // 进行查询
      const url = `/chisAPI/clinicRoom/geByClinicId`
      let params = {sysClinicId}

      this.$http.get(url, {params}).then((res) => {
        if (res.data.code === 200) {
          this.dialog.clinicRoomList = res.data.resultSet.list
        }
      })
    },

    /**
     * 载入对应职业类别的执业范围
     */
    loadPracticeScopeList (practiceTypeId) {
      // 清空 已选中的 执业范围 ID
      this.editForm.sysPracticeScopeId = ''
      // 进行查询
      const url = `/chisAPI/practiceScope/getByPracticeTypeId`
      let params = {practiceTypeId}

      this.$http.get(url, {params}).then((res) => {
        if (res.data.code === 200) {
          this.dialog.practiceScopeList = res.data.resultSet.list
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
        let url = this.dialog.url
        let method = this.dialog.method
        let params = this.editForm

        this.$http({method, url, params}).then((res) => {
          if (res.data.code === 200) {
            this.$message.success(res.data.msg)
            this.dialog.visible = false
            this.dataGridLoadData()
          } else {
            this.$loading().close()
          }
        })
      })
    },

    /* 医生签名上传 -------------------------------------------------------------------------------------------------- */
    /**
     * 上传之前执行的操作
     * @param file
     * @returns {boolean}
     */
    uploadSignatureBefore (file) {
      this.signatureFile = file
      const isSpecify = ('image/jpeg, image/jpg').indexOf(file.type) !== -1
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isSpecify) {
        this.$message.error('上传图片只能是 jpeg 或 jpg 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传图片大小不能超过 2MB!')
      }
      return isSpecify && isLt2M
    },

    /**
     * 上传操作
     */
    uploadSignature () {
      // 上传地址
      const url = '/chisAPI/doctor/fileUploadSignature'
      // 创建 form 对象并添加上传文件
      let params = new FormData()
      params.append('file', this.signatureFile)
      // 设置请求头
      let config = {
        headers: {'Content-Type': 'multipart/form-data'}
      }
      // 上传
      this.$http.post(url, params, config).then(res => {
        if (res.data.code === 200) {
          this.editForm.signatureUrl = res.data.resultSet.signatureUrl
        }
      })
    },

    /**
     * 删除签名
     */
    deleteSignature () {
      if (this.editForm.signatureUrl) {
        this.editForm.signatureUrl = ''
      }
    },

    /* 医生头像上传 -------------------------------------------------------------------------------------------------- */
    /**
     * 上传医生头像之前执行的内容
     */
    uploadAvatarBefore (file) {
      this.avatarFile = file
      const isSpecify = ('image/jpeg, image/jpg').indexOf(file.type) !== -1
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isSpecify) {
        this.$message.error('上传图片只能是 jpeg 或 jpg 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传图片大小不能超过 2MB!')
      }
      return isSpecify && isLt2M
    },

    /**
     * 上传医生头像
     */
    uploadAvatar () {
      // 上传地址
      const url = '/chisAPI/doctor/fileUploadAvatar'
      // 创建 form 对象并添加上传文件
      let params = new FormData()
      params.append('file', this.avatarFile)
      // 设置请求头
      let config = {
        headers: {'Content-Type': 'multipart/form-data'}
      }
      // 上传
      this.$http.post(url, params, config).then(res => {
        if (res.data.code === 200) {
          this.editForm.avatarUrl = res.data.resultSet.avatarUrl
        }
      })
    },

    /**
     * 删除头像
     */
    deleteAvatar () {
      if (this.editForm.avatarUrl) {
        this.editForm.avatarUrl = ''
      }
    }

  } // end methods
}
</script>

<style scoped>
</style>
<style>
  .uploader-box .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .uploader-box .el-upload:hover {
    border-color: #3BB878;
  }
  .uploader-box-icon {
    font-size: 25px;
    color: #8c939d;
    width: 150px;
    height: 150px;
    line-height: 150px;
    text-align: center;
  }
  .image-box {
    width: 150px;
    height: 150px;
    display: block;
  }
  .uploader-del-btn {
    width: 150px;
    position: relative;
    bottom: 10px;
  }
</style>
