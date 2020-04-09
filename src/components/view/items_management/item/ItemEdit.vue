<template>
  <el-dialog
    width="55%"
    :show-close="false"
    :close-on-click-modal="false"
    :visible="visible"
    @opened="dialogOpened"
    @closed="dialogClosed">

    <!-- 模态框标题栏与功能按钮 -->
    <el-row slot="title">
      <el-col :span="5" style="font-size: 20px;">
        <span>{{title}}</span>
      </el-col>
      <el-col :span="19" style="text-align: right;">
        <el-button type="primary" size="mini" icon="el-icon-check" @click="editFormSubmit">提 交</el-button>
        <el-button type="warning" size="mini" icon="el-icon-right" @click="dialogClose">返 回</el-button>
      </el-col>
    </el-row>

    <!-- 编辑表单 -->
    <el-form :model="editForm" ref="editForm" :rules="editFormRules" size="small" label-width="100px">
      <el-form-item prop="id" v-show="false">
        <el-input v-model.trim="editForm.id"/>
      </el-form-item>

      <el-row>
        <el-col :span="12">
          <el-form-item label="项目名称" prop="name">
            <el-input v-model.trim="editForm.name" autofocus ref="name"
                      @blur="editFormSetPyCode" @change="editFormSetPyCode"
                      @keyup.enter.native="editFormValidateField('name', 'itemUnitsId')"/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="助记码" prop="code">
            <el-input v-model.trim="editForm.code"/>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="8">
          <el-form-item label="单位" prop="itemUnitsId">
            <el-select
              ref="itemUnitsId"
              @keyup.enter.native="editFormValidateField('itemUnitsId', 'befitGenderId')"
              v-model.trim="editForm.itemUnitsId"
              filterable
              default-first-option
              placeholder="请选择">
              <el-option v-for="item in itemUnitsList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8" :offset="4">
          <el-form-item label="适用性别" prop="befitGenderId">
            <el-select
              ref="befitGenderId"
              @keyup.enter.native="editFormValidateField('befitGenderId', 'quantity')"
              v-model.trim="editForm.befitGenderId"
              filterable
              default-first-option
              placeholder="请选择">
              <el-option :value="''" label="全部"/>
              <el-option v-for="item in befitGenderList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="8">
          <el-form-item label="可执行次数" prop="quantity">
            <el-input-number v-model="editForm.quantity" :controls="false" :max="100" :min="1" :precision="0"
                             ref="quantity" @keyup.enter.native="editFormValidateField('quantity', (dialog.editable ? 'retailPrice' : 'billingTypeId'))"/>
          </el-form-item>
        </el-col>
        <el-col :span="8" :offset="4">
          <el-form-item label="零售单价" prop="retailPrice">
            <el-input-number v-model="editForm.retailPrice" :controls="false" :max="9999" :min="0" :precision="2"
                             ref="retailPrice" style="width: 80%;" v-if="dialog.editable"
                             @keyup.enter.native="editFormValidateField('retailPrice', 'billingTypeId')"/>
            <span v-if="dialog.editable">&nbsp;&nbsp;元</span>
            <span v-if="!dialog.editable">{{editForm.retailPrice}} &nbsp;&nbsp;元</span>
          </el-form-item>
        </el-col>
      </el-row>

      <el-alert style="height: 30px; margin-bottom: 20px;"
                title="可执行次数指单次销售所包含的次数, 例如 1疗程 12次, 可执行次数就填写 12"
                :closable="false"
                type="info"/>

      <el-row>
        <el-col :span="12">
          <el-form-item label="计费类型" prop="billingTypeId">
            <el-select
              ref="billingTypeId"
              @keyup.enter.native="editFormValidateField('billingTypeId', 'itemClassifyId')"
              v-model.trim="editForm.billingTypeId"
              filterable
              default-first-option
              placeholder="请选择">
              <el-option v-for="item in billingTypeList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="项目分类" prop="itemClassifyId">
            <el-select
              ref="itemClassifyId"
              @keyup.enter.native="editFormValidateField('itemClassifyId', 'explains')"
              v-model.trim="editForm.itemClassifyId"
              filterable
              default-first-option
              placeholder="请选择">
              <el-option :value="''" label="无"/>
              <el-option v-for="item in itemClassifyList" :key="item.id" :value="item.id" :label="item.name + ' [' +item.code + ']'"/>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="项目说明" prop="explains">
        <el-input v-model.trim="editForm.explains" ref="explains"/>
      </el-form-item>

      <el-row>
        <el-col :span="12">
          <el-form-item label="参与打折" prop="discountable">
            <el-radio-group v-model="editForm.discountable">
              <el-radio :label="true">是</el-radio>
              <el-radio :label="false">否</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="可退费" prop="returnable">
            <el-radio-group v-model="editForm.returnable">
              <el-radio :label="true">是</el-radio>
              <el-radio :label="false">否</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="医保项目" prop="ybItem">
            <el-radio-group v-model="editForm.ybItem">
              <el-radio :label="true">是</el-radio>
              <el-radio :label="false">否</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="state">
            <el-radio-group v-model="editForm.state">
              <el-radio :label="true">启用</el-radio>
              <el-radio :label="false">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

    </el-form>
  </el-dialog>
</template>

<script>
import {getPyCode} from '../../../../common/py'
export default {
  props: {
    title: {
      type: String,
      required: true
    },
    action: {
      type: String,
      required: true
    },
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
      editForm: {
        id: '',
        name: '',
        code: '',
        itemUnitsId: '',
        befitGenderId: '',
        billingTypeId: '',
        itemClassifyId: '',
        retailPrice: 0,
        quantity: 1,
        explains: '',
        discountable: true,
        returnable: true,
        ybItem: false,
        state: true
      },
      editFormRules: {
        name: [
          {required: true, message: '不能为空'},
          {max: 30, message: '长度不合法[1-30]'}
        ],
        code: [
          {required: true, message: '不能为空'},
          {max: 30, message: '长度不合法[1-30]'}
        ],
        itemUnitsId: [
          {required: true, message: '不能为空'}
        ],
        befitGenderId: [
          /* {required: true, message: '不能为空'} */
        ],
        billingTypeId: [
          {required: true, message: '不能为空'}
        ],
        retailPrice: [
          {required: true, message: '不能为空'}
        ],
        quantity: [
          {required: true, message: '不能为空'}
        ],
        explains: [
          {max: 30, message: '长度不合法[1-30]'}
        ]
      },
      dialog: {
        url: '',
        method: '',
        editable: true
      }
    }
  }, // end data

  computed: {
    itemUnitsList: function () {
      return this.$store.getters.itemUnitsList
    },
    itemClassifyList: function () {
      return this.$store.getters.itemClassifyList
    },
    befitGenderList: function () {
      return this.$store.getters.befitGenderList
    },
    billingTypeList: function () {
      return this.$store.getters.billingTypeList
    }
  },

  methods: {
    /* -------------------------------------------------------------------------------------------------------------- */
    dialogOpened () {
      let row = this.row
      if (row.id) {
        for (let key in this.editForm) {
          if (this.editForm.hasOwnProperty(key) && row[key] !== undefined) {
            this.editForm[key] = row[key]
          }
        }
        this.dialog.editable = false
        this.dialog.url = `/chisAPI/${this.action}/update`
        this.dialog.method = 'PUT'
      } else {
        this.dialog.editable = true
        this.dialog.url = `/chisAPI/${this.action}/save`
        this.dialog.method = 'POST'
      }
    },

    dialogClosed () {
      this.$refs.editForm.resetFields()
    },

    editFormValidateField (currentProp, nextRef) {
      this.$refs.editForm.validateField(currentProp, (valid) => {
        if (!valid) {
          this.$refs[nextRef].focus()
        } else {
          return false
        }
      })
    },

    editFormSetPyCode () {
      this.editForm.code = getPyCode(this.editForm.name)
    },

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
            this.dataGridLoadData()
            this.dialogClose()
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
