<template>
  <el-dialog
    width="60%"
    :show-close="false"
    :close-on-click-modal="false"
    :visible="visible"
    @opened="dialogOpened"
    @closed="dialogClosed">

    <!-- 模态框标题栏与功能按钮 -->
    <el-row slot="title">
      <el-col :span="5" style="font-size: 20px;">
        <span>门诊挂号</span>
      </el-col>
      <el-col :span="19" style="text-align: right;">
        <el-button size="mini" type="primary" icon="el-icon-check" @click="submitData">提 交</el-button>
        <el-button size="mini" type="warning" icon="el-icon-right" @click="dialogClose">返 回</el-button>
      </el-col>
    </el-row>

    <el-form :model="editForm" ref="editForm" :rules="editFormRules" size="small" label-width="100px">
      <el-row>
        <el-col :span="10">
           <div style="border-bottom: #409EFF 1px dashed; margin: -20px 0 20px 0;">
             <el-tag type="" effect="plain">患者信息</el-tag>
           </div>
          <el-form-item label="会员编号" prop="mrmMemberId">
            <el-select
              ref="mrmMemberId"
              @keyup.enter.native="validateFieldToNextFocus('mrmMemberId', 'sysDoctorId')"
              v-model.trim="editForm.mrmMemberId"
              placeholder="输入 姓名 / 手机 搜索"
              :remote-method="queryMember"
              :loading="select.loading"
              remote
              @change="memberSelected"
              filterable>
              <el-option class="custom-el-option" :value="null" v-if="select.members.length > 0" disabled>
                <span class="select-option-top" style="width: 100px;">姓名</span>
                <span class="select-option-top" style="width: 100px;">性别</span>
                <span class="select-option-top" style="width: 120px;">出生年月</span>
                <span class="select-option-top" style="width: 150px;">联系电话</span>
                <span class="select-option-top">身份证号</span>
              </el-option>
              <el-option v-for="item in select.members" :key="item.id" :value="item.id" :label="item.oid" class="custom-el-option">
                <span class="select-option-text" style="width: 100px;">{{item.name}}</span>
                <span class="select-option-text" style="width: 100px;">{{item.genderName}}</span>
                <span class="select-option-text" style="width: 120px;">{{item.birth}}</span>
                <span class="select-option-text" style="width: 150px;">{{item.phone}}</span>
                <span class="select-option-text">{{item.idCardNo}}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="姓名" prop="mrmMemberName">
            {{editForm.mrmMemberName}}
          </el-form-item>
          <el-form-item label="性别" prop="genderName">
            {{editForm.genderName}}
          </el-form-item>
          <el-form-item label="年龄" prop="age">
            {{editForm.age}}
          </el-form-item>
          <el-form-item label="联系电话" prop="phone">
            {{editForm.phone}}
          </el-form-item>
        </el-col><!-- end left -->

        <el-col :span="10" :offset="2">
          <div style="border-bottom: #67C23A 1px dashed; margin: -20px 0 20px 0;">
            <el-tag type="success" effect="plain">医生信息</el-tag>
          </div>
          <el-form-item label="医生姓名" prop="sysDoctorId">
            <el-select
              ref="sysDoctorId"
              @keyup.enter.native="validateFieldToNextFocus('sysDoctorId', 'cimItemId')"
              v-model.trim="editForm.sysDoctorId"
              @change="sysDoctorSelected"
              default-first-option
              filterable
              placeholder="请选择">
              <el-option v-for="item in clinicDoctorList" :key="item.id" :value="item.id" :label="item.name"/>
            </el-select>
          </el-form-item>
          <el-form-item label="医师职称" prop="doctorTitlesName">
            {{editForm.doctorTitlesName}}
          </el-form-item>
          <el-form-item label="科室/诊室" prop="sysClinicRoomName">
            {{editForm.sysClinicRoomName}}
          </el-form-item>
          <el-form-item label="挂号类型" prop="cimItemId">
            <el-select
              ref="cimItemId"
              v-model.trim="editForm.cimItemId"
              @change="cimItemSelected"
              filterable
              default-first-option
              placeholder="请选择">
              <el-option v-for="item in registrationFeeList" :key="item.id" :value="item.id" :label="item.name"/>
            </el-select>
          </el-form-item>
          <el-form-item label="费用" prop="retailPrice">
            <span style="font-size: 20px; font-weight: 600; color: red;">
               {{editForm.retailPrice}}&nbsp;&nbsp;元
            </span>
          </el-form-item>
        </el-col> <!-- end right-->

      </el-row>
    </el-form>
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
  }, // end props

  data () {
    return {
      editForm: {
        mrmMemberId: '', // 会员ID
        mrmMemberName: '', // 姓名
        genderName: '', // 性别
        age: '', // 年龄
        phone: '', // 联系电话
        memberDiscountRate: '', // 会员折扣率

        sysDoctorId: '', // 医生ID
        sysDoctorName: '', // 医生姓名
        doctorTitlesName: '', // 医生职称
        sysClinicRoomName: '', // 所在诊室名称
        cimItemId: '', // 挂号费ID
        retailPrice: 0 // 挂号费价格
      },
      editFormRules: {
        sysDoctorId: [
          {required: true, message: '不能为空'}
        ],
        cimItemId: [
          {required: true, message: '不能为空'}
        ],

        mrmMemberId: [
          {required: true, message: '不能为空'}
        ]
      },
      select: {
        loading: false,
        members: []
      }
    }
  }, // end data

  computed: {
    clinicDoctorList: function () {
      return this.$store.getters.clinicDoctorList
    },
    registrationFeeList: function () {
      return this.$store.getters.registrationFeeList
    }
  }, // end computed

  mounted () {
    this.$store.dispatch('queryClinicDoctorList')
  }, // end mounted

  methods: {
    /**
     * 界面打开后执行的内容
     */
    dialogOpened () {},

    /**
     * 界面关闭后执行的内容
     */
    dialogClosed () {
      this.$refs.editForm.resetFields()
      this.select.members = []
    },

    /**
     * 通过验证后获取下一个焦点
     */
    validateFieldToNextFocus (currentProp, nextRef) {
      this.$refs.editForm.validateField(currentProp, (valid) => {
        if (!valid) {
          this.$refs[nextRef].focus()
        } else {
          return false
        }
      })
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
     * 选中会员后显示对应的信息
     * @param id
     */
    memberSelected (id) {
      let member = this.select.members.find(item => {
        return item.id === id
      })

      this.editForm.mrmMemberOid = member.oid
      this.editForm.mrmMemberName = member.name
      this.editForm.genderName = member.genderName
      this.editForm.age = member.age
      this.editForm.phone = member.phone
      this.editForm.memberDiscountRate = member.discountRate
    },

    /**
     * 选择医生后显示对应的信息
     * @param id
     */
    sysDoctorSelected (id) {
      let doctor = this.clinicDoctorList.find(item => {
        return item.id === id
      })
      this.editForm.sysDoctorName = doctor.name
      this.editForm.doctorTitlesName = doctor.doctorTitlesName
      this.editForm.sysClinicRoomName = doctor.sysClinicRoomName
    },

    /**
     * 选择挂号费后显示对应的信息
     * @param id
     */
    cimItemSelected (id) {
      let item = this.registrationFeeList.find(item => {
        return item.id === id
      })
      this.editForm.retailPrice = item.retailPrice
    },

    /**
     * 提交数据
     */
    submitData () {
      this.$refs.editForm.validate((valid) => {
        if (!valid) {
          return false
        }

        this.$loading()
        const url = '/chisAPI/registrationRecord/saveToCache'
        const method = 'POST'
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
