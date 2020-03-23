<template>
  <el-dialog
    class="fullscreen-dialog"
    fullscreen
    :show-close="false"
    :close-on-click-modal="false"
    :visible="visible"
    @opened="dialogOpened"
    @closed="dialogClosed">

    <!-- 模态框标题栏与功能按钮 -->
    <el-row slot="title">
      <el-col :span="5" style="font-size: 20px;">
        <span>会员健康档案</span>
      </el-col>
      <el-col :span="19" style="text-align: right;">
        <el-button size="mini" type="primary" icon="el-icon-check" @click="editFormSubmit">提 交</el-button>
        <el-button size="mini" type="warning" icon="el-icon-right" @click="dialogClose">返 回</el-button>
      </el-col>
    </el-row>

    <!--健康档案主体-->
    <div class="health-archive">
      <el-form :model="editForm" ref="editForm" :rules="editFormRules" size="small">
        <el-form-item prop="id" v-show="false">
          <el-input v-model.trim="editForm.id"/>
        </el-form-item>
        <table>
          <tr>
            <td width="40"></td>  <!--标题-->
            <td width="100"></td><!--标题-->
            <td width="200"></td>
            <td width="130"></td><!--标题-->
            <td width="200"></td>
            <td width="130"></td><!--标题-->
            <td width="250"></td>
            <td width="200"></td>
          </tr>
          <tr>
            <td colspan="2">
              <el-form-item label="建档单位"/>
            </td>
            <td colspan="3">
              <el-form-item prop="sysClinicName">
                <el-input v-model.trim="editForm.sysClinicName" readonly/>
              </el-form-item>
            </td>
            <td>
              <el-form-item label="档案编号"/>
            </td>
            <td>
              <el-form-item prop="archiveNo">
                <el-input v-model.trim="editForm.archiveNo" readonly/>
              </el-form-item>
            </td>
            <td rowspan="6" align="center">
              <img src="../../../../assets/images/girl.png" v-if="editForm.genderId === 15"/>
              <img src="../../../../assets/images/boy.png" v-else/>
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <el-form-item label="建档人"/>
            </td>
            <td>
              <el-form-item prop="creatorName">
                <el-input v-model.trim="editForm.creatorName" readonly/>
              </el-form-item>
            </td>
            <td>
              <el-form-item label="建档日期"/>
            </td>
            <td>
              <el-form-item prop="creationDate">
                <el-input v-model.trim="editForm.creationDate" readonly/>
              </el-form-item>
            </td>
            <td>
              <el-form-item label="责任医生"/>
            </td>
            <td>
              <el-form-item prop="doctorId">
                <el-select
                  ref="doctorId"
                  v-model.trim="editForm.doctorId"
                  v-if="editFormIsCreationClinic()"
                  filterable
                  placeholder="请选择">
                  <el-option v-for="item in clinicDoctorList" :key="item.id" :value="item.id" :label="item.name"/>
                </el-select>
                <span v-if="!editFormIsCreationClinic()">{{row.doctorName}}</span>
              </el-form-item>
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <el-form-item label="姓名"/>
            </td>
            <td>
              <el-form-item prop="name">
                <el-input v-model.trim="editForm.name" placeholder="请填写" readonly/>
              </el-form-item>
            </td>
            <td>
              <el-form-item label="性别"/>
            </td>
            <td colspan="3">
              <el-form-item prop="genderId">
                <el-radio-group v-model="editForm.genderId">
                  <el-radio v-for="item in genderList" :key="item.id" :label="item.id">{{item.name}}</el-radio>
                </el-radio-group>
              </el-form-item>
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <el-form-item label="身份证号码"/>
            </td>
            <td>
              <el-form-item prop="idCardNo">
                <el-input v-model.trim="editForm.idCardNo" placeholder="请填写"/>
              </el-form-item>
            </td>
            <td>
              <el-form-item label="出生日期"/>
            </td>
            <td>
              <el-form-item prop="birth">
                <el-date-picker
                  style="width: 100%;"
                  v-model="editForm.birth"
                  type="date"
                  placeholder="选择日期"
                  value-format="yyyy-MM-dd"
                  :picker-options="pickerOptionsBefore">
                </el-date-picker>
              </el-form-item>
            </td>
            <td>
              <el-form-item label="民族"/>
            </td>
            <td>
              <el-form-item prop="nationalityId">
                <el-select
                  v-model.trim="editForm.nationalityId"
                  filterable
                  placeholder="请选择">
                  <el-option v-for="item in nationalityList" :key="item.id" :value="item.id" :label="item.name"/>
                </el-select>
              </el-form-item>
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <el-form-item label="本人电话"/>
            </td>
            <td>
              <el-form-item prop="phone">
                <el-input v-model.trim="editForm.phone" placeholder="请填写"/>
              </el-form-item>
            </td>
            <td>
              <el-form-item label="联系人姓名"/>
            </td>
            <td>
              <el-form-item prop="contactName">
                <el-input v-model.trim="editForm.contactName" placeholder="请填写"/>
              </el-form-item>
            </td>
            <td>
              <el-form-item label="联系人电话"/>
            </td>
            <td>
              <el-form-item prop="contactPhone">
                <el-input v-model.trim="editForm.contactPhone" placeholder="请填写"/>
              </el-form-item>
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <el-form-item label="常驻类型"/>
            </td>
            <td>
              <el-form-item prop="domicilePlace">
                <el-radio-group v-model="editForm.domicilePlace">
                  <el-radio :label="true">户籍</el-radio>
                  <el-radio :label="false">非户籍</el-radio>
                </el-radio-group>
              </el-form-item>
            </td>
            <td>
              <el-form-item label="婚姻状况"/>
            </td>
            <td colspan="3">
              <el-form-item prop="maritalId">
                <el-radio-group v-model="editForm.maritalId">
                  <el-radio v-for="item in maritalList" :key="item.id" :label="item.id">{{item.name}}</el-radio>
                </el-radio-group>
              </el-form-item>
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <el-form-item label="血型"/>
            </td>
            <td colspan="3">
              <el-form-item prop="bloodTypeId">
                <el-radio-group v-model="editForm.bloodTypeId">
                  <el-radio v-for="item in bloodTypeList" :key="item.id" :label="item.id">{{item.name}}</el-radio>
                </el-radio-group>
              </el-form-item>
            </td>
            <td>
              <el-form-item label="RH"/>
            </td>
            <td colspan="2">
              <el-form-item prop="rhId">
                <el-radio-group v-model="editForm.rhId">
                  <el-radio v-for="item in rhList" :key="item.id" :label="item.id">{{item.name}}</el-radio>
                </el-radio-group>
              </el-form-item>
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <el-form-item label="文化程度"/>
            </td>
            <td colspan="6">
              <el-form-item prop="educationId">
                <el-radio-group v-model="editForm.educationId">
                  <el-radio v-for="item in educationList" :key="item.id" :label="item.id">{{item.name}}</el-radio>
                </el-radio-group>
              </el-form-item>
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <el-form-item label="职业"/>
            </td>
            <td colspan="6">
              <el-form-item prop="professionId" style="height: 50px;">
                <el-radio-group v-model="editForm.professionId">
                  <el-radio v-for="item in professionList" :key="item.id" :label="item.id">
                    <span style="display: inline-block; padding: 10px 0;">{{item.name}}</span>
                  </el-radio>
                </el-radio-group>
              </el-form-item>
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <el-form-item label="工作单位"/>
            </td>
            <td colspan="6">
              <el-form-item prop="company">
                <el-input v-model.trim="editForm.company" placeholder="请填写"/>
              </el-form-item>
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <el-form-item label="现住址"/>
            </td>
            <td colspan="3">
              <el-form-item prop="address">
                <el-input v-model.trim="editForm.address" placeholder="请填写"/>
              </el-form-item>
            </td>
            <td>
              <el-form-item label="户籍住址"/>
            </td>
            <td colspan="2">
              <el-form-item prop="dpAddress">
                <el-input v-model.trim="editForm.dpAddress" placeholder="请填写"/>
              </el-form-item>
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <el-form-item label="乡镇(街道)名称"/>
            </td>
            <td colspan="3">
              <el-form-item prop="mrmTownshipId">
                <el-select
                  v-model.trim="editForm.mrmTownshipId"
                  @change="editFormGetCommitteeList"
                  :disabled="editForm.archiveNo !== ''"
                  filterable
                  placeholder="请选择">
                  <el-option v-for="item in townshipList" :key="item.id" :value="item.id" :label="item.name"/>
                </el-select>
              </el-form-item>
            </td>
            <td>
              <el-form-item label="村(居委会)名称"/>
            </td>
            <td colspan="2">
              <el-form-item prop="mrmCommitteeId">
                <el-select
                  v-model.trim="editForm.mrmCommitteeId"
                  :disabled="editForm.archiveNo !== ''"
                  filterable
                  placeholder="请选择">
                  <el-option v-for="item in select.committees" :key="item.id" :value="item.id" :label="item.name"/>
                </el-select>
              </el-form-item>
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <el-form-item label="医疗费用支付方式"/>
            </td>
            <td colspan="6">
              <el-form-item prop="multipleOption.ffsPaymentWayArray">
                <el-checkbox-group v-model="editForm.multipleOption.ffsPaymentWayArray">
                  <el-checkbox v-for="item in ffsPaymentWayList" :key="item.id" :label="item.id">{{item.name}}</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <el-form-item label="药物过敏史"/>
            </td>
            <td colspan="6">
              <el-row>
                <el-col :span="2">
                  <el-form-item prop="multipleOption.allergyNone">
                    <el-checkbox v-model="editForm.multipleOption.allergyNone" :label="true"
                                 :disabled="!editFormAllergyIsEmpty()">无</el-checkbox>
                  </el-form-item>
                </el-col>
                <el-col :span="7">
                  <el-form-item prop="multipleOption.allergyArray">
                    <el-checkbox-group v-model="editForm.multipleOption.allergyArray">
                      <el-checkbox v-for="item in allergyList" :key="item.id" :label="item.id"
                                   :disabled="editForm.multipleOption.allergyNone">{{item.name}}</el-checkbox>
                    </el-checkbox-group>
                  </el-form-item>
                </el-col>
                <el-col :span="1" class="title">其他</el-col>
                <el-col :span="5">
                  <el-form-item prop="multipleOption.allergyOther">
                    <el-input v-model.trim="editForm.multipleOption.allergyOther" placeholder="请填写"
                              :disabled="editForm.multipleOption.allergyNone"/>
                  </el-form-item>
                </el-col>
              </el-row>
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <el-form-item label="暴露史"/>
            </td>
            <td colspan="6">
              <el-row>
                <el-col :span="2">
                  <el-form-item prop="multipleOption.exposureNone">
                    <el-checkbox v-model="editForm.multipleOption.exposureNone" :label="true"
                                 :disabled="!editFormExposureIsEmpty()">无</el-checkbox>
                  </el-form-item>
                </el-col>
                <el-col :span="22">
                  <el-form-item prop="multipleOption.exposureArray">
                    <el-checkbox-group v-model="editForm.multipleOption.exposureArray">
                      <el-checkbox v-for="item in exposureList" :key="item.id" :label="item.id"
                                   :disabled="editForm.multipleOption.exposureNone">{{item.name}}</el-checkbox>
                    </el-checkbox-group>
                  </el-form-item>
                </el-col>
              </el-row>
            </td>
          </tr>
          <tr>
            <td rowspan="4">
              <el-form-item label="既往史"/>
            </td>
            <td>
              <el-form-item label="疾病"/>
            </td>
            <td colspan="6">
              <el-row>
                <el-col :span="2">
                  <el-form-item prop="multipleOption.illnessNone">
                    <el-checkbox v-model="editForm.multipleOption.illnessNone" :label="true"
                                 :disabled="!editFormIllnessIsEmpty()">无</el-checkbox>
                  </el-form-item>
                </el-col>
                <el-col :span="22">
                  <el-row>
                    <el-col :span="8" v-for="(item, index) in illnessList" :key="index">
                      {{editFormInitIllnessArray(index, item)}}<!-- 初始化疾病数组 -->
                      <el-form-item :prop="'multipleOption.illnessArray[' + index + '].date'" v-if="illnessList.length > 0">
                        <span class="title">{{item.name}}</span>
                        <el-date-picker
                          v-model="editForm.multipleOption.illnessArray[index].date"
                          type="date"
                          placeholder="确诊日期"
                          :picker-options="pickerOptionsBefore"
                          :disabled="editForm.multipleOption.illnessNone"
                          value-format="yyyy-MM-dd"
                          style="width: 140px;"/>
                      </el-form-item>
                    </el-col>
                    <el-col :span="1" class="title">其他</el-col>
                    <el-col :span="3">
                      <el-form-item prop="multipleOption.illnessOther">
                        <el-input v-model.trim="editForm.multipleOption.illnessOther" placeholder="请填写"
                                  :disabled="editForm.multipleOption.illnessNone"/>
                      </el-form-item>
                    </el-col>
                    <el-col :span="3">
                      <el-form-item prop="multipleOption.illnessOtherDate">
                        <el-date-picker
                          v-model="editForm.multipleOption.illnessOtherDate"
                          type="date"
                          placeholder="确诊日期"
                          :picker-options="pickerOptionsBefore"
                          :disabled="editForm.multipleOption.illnessNone"
                          value-format="yyyy-MM-dd"
                          style="width: 140px;"/>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-col><!--end span22-->
              </el-row>
            </td>
          </tr>
          <tr>
            <td>
              <el-form-item label="手术"/>
            </td>
            <td colspan="6">
              <el-row>
                <el-col :span="2">
                  <el-form-item prop="multipleOption.surgeryNone">
                    <el-checkbox v-model="editForm.multipleOption.surgeryNone" :label="true"
                                 :disabled="!editFormSurgeryIsEmpty()">无</el-checkbox>
                  </el-form-item>
                </el-col>
                <el-col :span="22">
                  <el-row>
                    <el-col :span="1" class="title">名称1</el-col>
                    <el-col :span="4">
                      <el-form-item prop="multipleOption.surgeryName1">
                        <el-input v-model.trim="editForm.multipleOption.surgeryName1" placeholder="请填写"
                                  :disabled="editForm.multipleOption.surgeryNone"/>
                      </el-form-item>
                    </el-col>
                    <el-col :span="1" class="title">日期</el-col>
                    <el-col :span="4">
                      <el-form-item prop="multipleOption.surgeryDate1">
                        <el-date-picker
                          v-model="editForm.multipleOption.surgeryDate1"
                          type="date"
                          placeholder="确诊日期"
                          :picker-options="pickerOptionsBefore"
                          :disabled="editForm.multipleOption.surgeryNone"
                          value-format="yyyy-MM-dd"
                          style="width: 140px;"/>
                      </el-form-item>
                    </el-col>

                    <el-col :span="1" class="title">名称2</el-col>
                    <el-col :span="4">
                      <el-form-item prop="multipleOption.surgeryName2">
                        <el-input v-model.trim="editForm.multipleOption.surgeryName2" placeholder="请填写"
                                  :disabled="editForm.multipleOption.surgeryNone"/>
                      </el-form-item>
                    </el-col>
                    <el-col :span="1" class="title">日期</el-col>
                    <el-col :span="4">
                      <el-form-item prop="multipleOption.surgeryDate2">
                        <el-date-picker
                          v-model="editForm.multipleOption.surgeryDate2"
                          type="date"
                          placeholder="确诊日期"
                          :picker-options="pickerOptionsBefore"
                          :disabled="editForm.multipleOption.surgeryNone"
                          value-format="yyyy-MM-dd"
                          style="width: 140px;"/>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
            </td>
          </tr>
          <tr>
            <td>
              <el-form-item label="外伤"/>
            </td>
            <td colspan="6">
              <el-row>
                <el-col :span="2">
                  <el-form-item prop="multipleOption.traumaNone">
                    <el-checkbox v-model="editForm.multipleOption.traumaNone" :label="true"
                                 :disabled="!editFormTraumaIsEmpty()">无</el-checkbox>
                  </el-form-item>
                </el-col>
                <el-col :span="22">
                  <el-row>
                    <el-col :span="1" class="title">名称1</el-col>
                    <el-col :span="4">
                      <el-form-item prop="multipleOption.traumaName1">
                        <el-input v-model.trim="editForm.multipleOption.traumaName1" placeholder="请填写"
                                  :disabled="editForm.multipleOption.traumaNone"/>
                      </el-form-item>
                    </el-col>
                    <el-col :span="1" class="title">日期</el-col>
                    <el-col :span="4">
                      <el-form-item prop="multipleOption.traumaDate1">
                        <el-date-picker
                          v-model="editForm.multipleOption.traumaDate1"
                          type="date"
                          placeholder="确诊日期"
                          :picker-options="pickerOptionsBefore"
                          :disabled="editForm.multipleOption.traumaNone"
                          value-format="yyyy-MM-dd"
                          style="width: 140px;"/>
                      </el-form-item>
                    </el-col>

                    <el-col :span="1" class="title">名称2</el-col>
                    <el-col :span="4">
                      <el-form-item prop="multipleOption.traumaName2">
                        <el-input v-model.trim="editForm.multipleOption.traumaName2" placeholder="请填写"
                                  :disabled="editForm.multipleOption.traumaNone"/>
                      </el-form-item>
                    </el-col>
                    <el-col :span="1" class="title">日期</el-col>
                    <el-col :span="4">
                      <el-form-item prop="multipleOption.traumaDate2">
                        <el-date-picker
                          v-model="editForm.multipleOption.traumaDate2"
                          type="date"
                          placeholder="确诊日期"
                          :picker-options="pickerOptionsBefore"
                          :disabled="editForm.multipleOption.traumaNone"
                          value-format="yyyy-MM-dd"
                          style="width: 140px;"/>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
            </td>
          </tr>
          <tr>
            <td>
              <el-form-item label="输血"/>
            </td>
            <td colspan="6">
              <el-row>
                <el-col :span="2">
                  <el-form-item prop="multipleOption.transfusionNone">
                    <el-checkbox v-model="editForm.multipleOption.transfusionNone" :label="true"
                                 :disabled="!editFormTransfusionIsEmpty()">无</el-checkbox>
                  </el-form-item>
                </el-col>
                <el-col :span="22">
                  <el-col :span="1" class="title">原因1</el-col>
                  <el-col :span="4">
                    <el-form-item prop="multipleOption.transfusionName1">
                      <el-input v-model.trim="editForm.multipleOption.transfusionName1" placeholder="请填写"
                                :disabled="editForm.multipleOption.transfusionNone"/>
                    </el-form-item>
                  </el-col>
                  <el-col :span="1" class="title">日期</el-col>
                  <el-col :span="4">
                    <el-form-item prop="multipleOption.transfusionDate1">
                      <el-date-picker
                        v-model="editForm.multipleOption.transfusionDate1"
                        type="date"
                        placeholder="输血日期"
                        :picker-options="pickerOptionsBefore"
                        :disabled="editForm.multipleOption.transfusionNone"
                        value-format="yyyy-MM-dd"
                        style="width: 140px;"/>
                    </el-form-item>
                  </el-col>

                  <el-col :span="1" class="title">原因2</el-col>
                  <el-col :span="4">
                    <el-form-item prop="multipleOption.transfusionName2">
                      <el-input v-model.trim="editForm.multipleOption.transfusionName2" placeholder="请填写"
                                :disabled="editForm.multipleOption.transfusionNone"/>
                    </el-form-item>
                  </el-col>
                  <el-col :span="1" class="title">日期</el-col>
                  <el-col :span="4">
                    <el-form-item prop="multipleOption.transfusionDate2">
                      <el-date-picker
                        v-model="editForm.multipleOption.transfusionDate2"
                        type="date"
                        placeholder="输血日期"
                        :picker-options="pickerOptionsBefore"
                        :disabled="editForm.multipleOption.transfusionNone"
                        value-format="yyyy-MM-dd"
                        style="width: 140px;"/>
                    </el-form-item>
                  </el-col>
                </el-col>
              </el-row>
            </td>
          </tr>
          <tr>
            <td rowspan="4">
              <el-form-item label="家族史"/>
            </td>
            <td>
              <el-form-item label="父亲"/>
            </td>
            <td colspan="6">
              <el-row>
                <el-col :span="2">
                  <el-form-item prop="multipleOption.fatherNone">
                    <el-checkbox v-model="editForm.multipleOption.fatherNone" :label="true"
                                 :disabled="!editFormFatherIsEmpty()">无</el-checkbox>
                  </el-form-item>
                </el-col>
                <el-col :span="14">
                  <el-form-item prop="multipleOption.fatherArray">
                    <el-select
                      v-model.trim="editForm.multipleOption.fatherArray"
                      filterable
                      multiple
                      :disabled="editForm.multipleOption.fatherNone"
                      placeholder="请选择">
                      <el-option v-for="item in familyIllnessList" :key="item.id" :value="item.id" :label="item.name"/>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="1" class="title">其他</el-col>
                <el-col :span="7">
                  <el-form-item prop="multipleOption.fatherOther">
                    <el-input v-model.trim="editForm.multipleOption.fatherOther" placeholder="请填写"
                              :disabled="editForm.multipleOption.fatherNone"/>
                  </el-form-item>
                </el-col>
              </el-row>
            </td>
          </tr>
          <tr>
            <td>
              <el-form-item label="母亲"/>
            </td>
            <td colspan="6">
              <el-row>
                <el-col :span="2">
                  <el-form-item prop="multipleOption.motherNone">
                    <el-checkbox v-model="editForm.multipleOption.motherNone" :label="true"
                                 :disabled="!editFormMotherIsEmpty()">无</el-checkbox>
                  </el-form-item>
                </el-col>
                <el-col :span="14">
                  <el-form-item prop="multipleOption.motherArray">
                    <el-select
                      v-model.trim="editForm.multipleOption.motherArray"
                      filterable
                      multiple
                      :disabled="editForm.multipleOption.motherNone"
                      placeholder="请选择">
                      <el-option v-for="item in familyIllnessList" :key="item.id" :value="item.id" :label="item.name"/>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="1" class="title">其他</el-col>
                <el-col :span="7">
                  <el-form-item prop="multipleOption.motherOther">
                    <el-input v-model.trim="editForm.multipleOption.motherOther" placeholder="请填写"
                              :disabled="editForm.multipleOption.motherNone"/>
                  </el-form-item>
                </el-col>
              </el-row>
            </td>
          </tr>
          <tr>
            <td>
              <el-form-item label="兄弟姐妹"/>
            </td>
            <td colspan="6">
              <el-row>
                <el-col :span="2">
                  <el-form-item prop="multipleOption.siblingNone">
                    <el-checkbox v-model="editForm.multipleOption.siblingNone" :label="true"
                                 :disabled="!editFormSiblingIsEmpty()">无</el-checkbox>
                  </el-form-item>
                </el-col>
                <el-col :span="14">
                  <el-form-item prop="multipleOption.siblingArray">
                    <el-select
                      v-model.trim="editForm.multipleOption.siblingArray"
                      filterable
                      multiple
                      :disabled="editForm.multipleOption.siblingNone"
                      placeholder="请选择">
                      <el-option v-for="item in familyIllnessList" :key="item.id" :value="item.id" :label="item.name"/>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="1" class="title">其他</el-col>
                <el-col :span="7">
                  <el-form-item prop="multipleOption.siblingOther">
                    <el-input v-model.trim="editForm.multipleOption.siblingOther" placeholder="请填写"
                              :disabled="editForm.multipleOption.siblingNone"/>
                  </el-form-item>
                </el-col>
              </el-row>
            </td>
          </tr>
          <tr>
            <td>
              <el-form-item label="子女"/>
            </td>
            <td colspan="6">
              <el-row>
                <el-col :span="2">
                  <el-form-item prop="multipleOption.childrenNone">
                    <el-checkbox v-model="editForm.multipleOption.childrenNone" :label="true"
                                 :disabled="!editFormChildrenIsEmpty()">无</el-checkbox>
                  </el-form-item>
                </el-col>
                <el-col :span="14">
                  <el-form-item prop="multipleOption.childrenArray">
                    <el-select
                      v-model.trim="editForm.multipleOption.childrenArray"
                      filterable
                      multiple
                      :disabled="editForm.multipleOption.childrenNone"
                      placeholder="请选择">
                      <el-option v-for="item in familyIllnessList" :key="item.id" :value="item.id" :label="item.name"/>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="1" class="title">其他</el-col>
                <el-col :span="7">
                  <el-form-item prop="multipleOption.childrenOther">
                    <el-input v-model.trim="editForm.multipleOption.childrenOther" placeholder="请填写"
                              :disabled="editForm.multipleOption.childrenNone"/>
                  </el-form-item>
                </el-col>
              </el-row>
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <el-form-item label="遗传病史"/>
            </td>
            <td colspan="6">
              <el-row>
                <el-col :span="2">
                  <el-form-item prop="geneticIllnessNone">
                    <el-checkbox v-model="editForm.geneticIllnessNone" :label="true"
                                 :disabled="editForm.geneticIllness !== ''">无</el-checkbox>
                  </el-form-item>
                </el-col>
                <el-col :span="22">
                  <el-form-item prop="geneticIllness">
                    <el-input v-model.trim="editForm.geneticIllness" placeholder="请填写"
                              :disabled="editForm.geneticIllnessNone"/>
                  </el-form-item>
                </el-col>
              </el-row>
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <el-form-item label="残疾情况"/>
            </td>
            <td colspan="6">
              <el-row>
                <el-col :span="2">
                  <el-form-item prop="multipleOption.disabilityNone">
                    <el-checkbox v-model="editForm.multipleOption.disabilityNone" :label="true"
                                 :disabled="!editFormDisabilityIsEmpty()">无</el-checkbox>
                  </el-form-item>
                </el-col>
                <el-col :span="16">
                  <el-form-item prop="multipleOption.disabilityArray">
                    <el-checkbox-group v-model="editForm.multipleOption.disabilityArray">
                      <el-checkbox v-for="item in disabilityList" :key="item.id" :label="item.id"
                                   :disabled="editForm.multipleOption.disabilityNone">{{item.name}}</el-checkbox>
                    </el-checkbox-group>
                  </el-form-item>
                </el-col>
                <el-col :span="1" class="title">其他</el-col>
                <el-col :span="5">
                  <el-form-item prop="multipleOption.disabilityOther">
                    <el-input v-model.trim="editForm.multipleOption.disabilityOther" placeholder="请填写"
                              :disabled="editForm.multipleOption.disabilityNone"/>
                  </el-form-item>
                </el-col>
              </el-row>
            </td>
          </tr>
          <tr>
            <td rowspan="5">
              <el-form-item label="生活环境"/>
            </td>
            <td>
              <el-form-item label="厨房排风"/>
            </td>
            <td colspan="6">
              <el-form-item prop="kitchenExhaustId">
                <el-radio-group v-model="editForm.kitchenExhaustId">
                  <el-radio v-for="item in kitchenExhaustList" :key="item.id" :label="item.id">{{item.name}}</el-radio>
                </el-radio-group>
              </el-form-item>
            </td>
          </tr>
          <tr>
            <td>
              <el-form-item label="燃料类型"/>
            </td>
            <td colspan="6">
              <el-form-item prop="fuelTypeId">
                <el-radio-group v-model="editForm.fuelTypeId">
                  <el-radio v-for="item in fuelTypeList" :key="item.id" :label="item.id">{{item.name}}</el-radio>
                </el-radio-group>
              </el-form-item>
            </td>
          </tr>
          <tr>
            <td>
              <el-form-item label="饮水"/>
            </td>
            <td colspan="6">
              <el-form-item prop="waterSourceId">
                <el-radio-group v-model="editForm.waterSourceId">
                  <el-radio v-for="item in waterSourceList" :key="item.id" :label="item.id">{{item.name}}</el-radio>
                </el-radio-group>
              </el-form-item>
            </td>
          </tr>
          <tr>
            <td>
              <el-form-item label="厕所"/>
            </td>
            <td colspan="6">
              <el-form-item prop="toiletTypeId">
                <el-radio-group v-model="editForm.toiletTypeId">
                  <el-radio v-for="item in toiletTypeList" :key="item.id" :label="item.id">{{item.name}}</el-radio>
                </el-radio-group>
              </el-form-item>
            </td>
          </tr>
          <tr>
            <td>
              <el-form-item label="禽畜栏"/>
            </td>
            <td colspan="6">
              <el-form-item prop="livestockFenceId">
                <el-radio-group v-model="editForm.livestockFenceId">
                  <el-radio v-for="item in livestockFenceList" :key="item.id" :label="item.id">{{item.name}}</el-radio>
                </el-radio-group>
              </el-form-item>
            </td>
          </tr>
        </table><!--end table-->
      </el-form><!--end form-->
    </div><!--end health-archive-body-->

  </el-dialog>
</template>

<script>
import {IdCardValidate} from '../../../../common/idCardVerify'
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
      if (this.editForm.idCardNo) {
        let idCardBirth = this.editForm.idCardNo.substring(6, 14)
        let birth = value.replace(/-/g, '')

        if (idCardBirth !== birth) {
          callback(new Error('不真实的出生日期'))
        } else {
          callback()
        }
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

    // 验证联系人或联系人电话是否与会员本人一致
    let validateContact = (rule, value, callback) => {
      if (value && (this.editForm.name === this.editForm.contactName || this.editForm.phone === this.editForm.contacterPhone)) {
        callback(new Error('联系人信息不能与本人一致'))
      } else {
        callback()
      }
    }

    // 验证既往史--其他和日期组合
    let validateIllnessOther = (rule, value, callback) => {
      if (!value && this.editForm.multipleOption.illnessOtherDate) {
        callback(new Error('不能为空'))
      } else {
        callback()
      }
    }

    let validateIllnessOtherDate = (rule, value, callback) => {
      if (!value && this.editForm.multipleOption.illnessOther) {
        callback(new Error('不能为空'))
      } else {
        callback()
      }
    }

    // 验证手术--名称和日期组合
    let validateSurgeryName1 = (rule, value, callback) => {
      if (!value && this.editForm.multipleOption.surgeryDate1) {
        callback(new Error('不能为空'))
      } else {
        callback()
      }
    }

    let validateSurgeryDate1 = (rule, value, callback) => {
      if (!value && this.editForm.multipleOption.surgeryName1) {
        callback(new Error('不能为空'))
      } else {
        callback()
      }
    }

    let validateSurgeryName2 = (rule, value, callback) => {
      if (!value && this.editForm.multipleOption.surgeryDate2) {
        callback(new Error('不能为空'))
      } else {
        callback()
      }
    }

    let validateSurgeryDate2 = (rule, value, callback) => {
      if (!value && this.editForm.multipleOption.surgeryName2) {
        callback(new Error('不能为空'))
      } else {
        callback()
      }
    }

    // 验证外伤--名称和日期组合
    let validateTraumaName1 = (rule, value, callback) => {
      if (!value && this.editForm.multipleOption.traumaDate1) {
        callback(new Error('不能为空'))
      } else {
        callback()
      }
    }

    let validateTraumaDate1 = (rule, value, callback) => {
      if (!value && this.editForm.multipleOption.traumaName1) {
        callback(new Error('不能为空'))
      } else {
        callback()
      }
    }

    let validateTraumaName2 = (rule, value, callback) => {
      if (!value && this.editForm.multipleOption.traumaDate2) {
        callback(new Error('不能为空'))
      } else {
        callback()
      }
    }

    let validateTraumaDate2 = (rule, value, callback) => {
      if (!value && this.editForm.multipleOption.traumaName2) {
        callback(new Error('不能为空'))
      } else {
        callback()
      }
    }

    // 验证输血--原因和日期组合
    let validateTransfusionName1 = (rule, value, callback) => {
      if (!value && this.editForm.multipleOption.transfusionDate1) {
        callback(new Error('不能为空'))
      } else {
        callback()
      }
    }

    let validateTransfusionDate1 = (rule, value, callback) => {
      if (!value && this.editForm.multipleOption.transfusionName1) {
        callback(new Error('不能为空'))
      } else {
        callback()
      }
    }

    let validateTransfusionName2 = (rule, value, callback) => {
      if (!value && this.editForm.multipleOption.transfusionDate2) {
        callback(new Error('不能为空'))
      } else {
        callback()
      }
    }

    let validateTransfusionDate2 = (rule, value, callback) => {
      if (!value && this.editForm.multipleOption.transfusionName2) {
        callback(new Error('不能为空'))
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
      payload: jwtDecode(this.$store.getters.token),
      editForm: {
        id: '', // 会员ID (主键)

        sysClinicName: '', // 建档单位
        archiveNo: '', // 档案编号
        creatorName: '', // 建档人姓名
        creationDate: '', // 建档日期
        doctorId: '', // 责任医生ID
        name: '', // 姓名
        genderId: '', // 性别
        birth: '', // 出生日期
        idCardNo: '', // 身份证号码
        nationalityId: '', // 民族
        phone: '', // 本人电话
        contactName: '', // 联系人姓名
        contactPhone: '', // 联系人电话
        domicilePlace: true, // 常驻类型
        bloodTypeId: '', // 血型
        rhId: '', // RH
        educationId: '', // 文化程度
        professionId: '', // 职业
        maritalId: '', // 婚姻状况
        company: '', // 工作单位
        address: '', // 现住址
        dpAddress: '', // 户籍住址
        mrmTownshipId: '', // 乡镇(街道)名称
        mrmCommitteeId: '', // 村(居委会)名称

        geneticIllnessNone: false,
        geneticIllness: '', // 遗传疾病
        kitchenExhaustId: '', // 厨房排风
        fuelTypeId: '', // 燃料类型
        waterSourceId: '', // 饮水
        toiletTypeId: '', // 厕所
        livestockFenceId: '', // 禽畜栏

        imageUrl: '', // 头像地址
        archiveState: true, // 档案状态

        // 多选
        multipleOption: {
          // 支付方式
          ffsPaymentWayArray: [],

          // 过敏史
          allergyNone: false,
          allergyArray: [],
          allergyOther: '',

          // 暴露史
          exposureNone: false,
          exposureArray: [],

          // 疾病
          illnessNone: false,
          illnessArray: [
            {id: '', date: ''},
            {id: '', date: ''},
            {id: '', date: ''},
            {id: '', date: ''},
            {id: '', date: ''},
            {id: '', date: ''},
            {id: '', date: ''},
            {id: '', date: ''},
            {id: '', date: ''},
            {id: '', date: ''},
            {id: '', date: ''},
            {id: '', date: ''},
            {id: '', date: ''},
            {id: '', date: ''},
            {id: '', date: ''},
            {id: '', date: ''},
            {id: '', date: ''},
            {id: '', date: ''},
            {id: '', date: ''}
          ],
          illnessOther: '',
          illnessOtherDate: '',

          // 手术
          surgeryNone: false,
          surgeryName1: '',
          surgeryDate1: '',
          surgeryName2: '',
          surgeryDate2: '',

          // 外伤
          traumaNone: false,
          traumaName1: '',
          traumaDate1: '',
          traumaName2: '',
          traumaDate2: '',

          // 输血
          transfusionNone: false,
          transfusionName1: '',
          transfusionDate1: '',
          transfusionName2: '',
          transfusionDate2: '',

          // 家族史-父亲
          fatherNone: false,
          fatherArray: [],
          fatherOther: '',

          // 家族史-母亲
          motherNone: false,
          motherArray: [],
          motherOther: '',

          // 家族史-兄弟姐妹
          siblingNone: false,
          siblingArray: [],
          siblingOther: '',

          // 家族史-子女
          childrenNone: false,
          childrenArray: [],
          childrenOther: '',

          // 残疾情况
          disabilityNone: false,
          disabilityArray: [],
          disabilityOther: ''
        }
      },
      editFormRules: {
        doctorId: [
          {required: true, message: '不能为空'}
        ],
        name: [
          {required: true, message: '不能为空'}
        ],
        genderId: [
          {required: true, message: '不能为空'}
        ],
        birth: [
          {required: true, message: '不能为空'},
          {validator: validateBirthMatchIdCardNo}
        ],
        idCardNo: [
          {required: true, message: '不能为空'},
          {validator: validateIdCardNo, trigger: 'blur'}
        ],
        nationalityId: [
          {required: true, message: '不能为空'}
        ],
        phone: [
          {required: true, message: '不能为空'},
          {validator: validatePhone, trigger: 'blur'}
        ],
        contactName: [
          {required: true, message: '不能为空'},
          {validator: validateContact, trigger: 'blur'}
        ],
        contactPhone: [
          {required: true, message: '不能为空'},
          {validator: validatePhone, trigger: 'blur'},
          {validator: validateContact, trigger: 'blur'}
        ],
        bloodTypeId: [
          {required: true, message: '不能为空'}
        ],
        rhId: [
          {required: true, message: '不能为空'}
        ],
        educationId: [
          {required: true, message: '不能为空'}
        ],
        professionId: [
          {required: true, message: '不能为空'}
        ],
        maritalId: [
          {required: true, message: '不能为空'}
        ],
        company: [
          {required: true, message: '不能为空'}
        ],
        address: [
          {required: true, message: '不能为空'}
        ],
        dpAddress: [
          {required: true, message: '不能为空'}
        ],
        mrmTownshipId: [
          {required: true, message: '不能为空'}
        ],
        mrmCommitteeId: [
          {required: true, message: '不能为空'}
        ],
        geneticIllness: [
          {max: 50, message: '长度不合法[1-50]'}
        ],
        // 多选
        multipleOption: {
          ffsPaymentWayArray: [
            {required: true, message: '不能为空'}
          ],
          illnessOther: [ // 疾病其他
            {validator: validateIllnessOther, trigger: 'blur'}
          ],
          illnessOtherDate: [
            {validator: validateIllnessOtherDate, trigger: 'blur'}
          ],
          surgeryName1: [ // 手术名称1
            {validator: validateSurgeryName1, trigger: 'blur'}
          ],
          surgeryDate1: [
            {validator: validateSurgeryDate1, trigger: 'blur'}
          ],
          surgeryName2: [
            {validator: validateSurgeryName2, trigger: 'blur'}
          ],
          surgeryDate2: [
            {validator: validateSurgeryDate2, trigger: 'blur'}
          ],
          traumaName1: [ // 外伤名称1
            {validator: validateTraumaName1, trigger: 'blur'}
          ],
          traumaDate1: [
            {validator: validateTraumaDate1, trigger: 'blur'}
          ],
          traumaName2: [
            {validator: validateTraumaName2, trigger: 'blur'}
          ],
          traumaDate2: [
            {validator: validateTraumaDate2, trigger: 'blur'}
          ],
          transfusionName1: [ // 输血名称1
            {validator: validateTransfusionName1, trigger: 'blur'}
          ],
          transfusionDate1: [
            {validator: validateTransfusionDate1, trigger: 'blur'}
          ],
          transfusionName2: [
            {validator: validateTransfusionName2, trigger: 'blur'}
          ],
          transfusionDate2: [
            {validator: validateTransfusionDate2, trigger: 'blur'}
          ]
        }
      },
      select: {
        committees: []
      },
      dictType: {
        FFS_PAYMENT_WAY: 308, // 医疗费用支付方式
        EXPOSURE: 309, // 暴露史
        ALLERGY: 310, // 过敏史
        DISABILITY: 312, // 残疾情况
        PREVIOUS_ILLNESS: 318, // 既往史--疾病
        PREVIOUS_SURGERY: 319, // 既往史--手术
        PREVIOUS_TRAUMA: 320, // 既往史--外伤
        PREVIOUS_TRANSFUSION: 321, // 既往史--输血
        FAMILY_FATHER: 322, // 家族史--父亲
        FAMILY_MOTHER: 323, // 家族史--母亲
        FAMILY_SIBLING: 324, // 家族史--兄弟姐妹
        FAMILY_CHILDREN: 325 // 家族史--子女
      }
    }
  }, // end data,

  computed: {
    clinicDoctorList: function () {
      return this.$store.getters.clinicDoctorList
    },
    genderList: function () {
      return this.$store.getters.genderList
    },
    nationalityList: function () {
      return this.$store.getters.nationalityList
    },
    bloodTypeList: function () {
      return this.$store.getters.bloodTypeList
    },
    rhList: function () {
      return this.$store.getters.rhList
    },
    educationList: function () {
      return this.$store.getters.educationList
    },
    professionList: function () {
      return this.$store.getters.professionList
    },
    maritalList: function () {
      return this.$store.getters.maritalList
    },
    townshipList: function () {
      return this.$store.getters.townshipList
    },
    ffsPaymentWayList: function () {
      return this.$store.getters.ffsPaymentWayList
    },
    allergyList: function () {
      return this.$store.getters.allergyList
    },
    exposureList: function () {
      return this.$store.getters.exposureList
    },
    illnessList: function () {
      return this.$store.getters.illnessList
    },
    familyIllnessList: function () {
      return this.$store.getters.familyIllnessList
    },
    disabilityList: function () {
      return this.$store.getters.disabilityList
    },
    kitchenExhaustList: function () {
      return this.$store.getters.kitchenExhaustList
    },
    fuelTypeList: function () {
      return this.$store.getters.fuelTypeList
    },
    waterSourceList: function () {
      return this.$store.getters.waterSourceList
    },
    toiletTypeList: function () {
      return this.$store.getters.toiletTypeList
    },
    livestockFenceList: function () {
      return this.$store.getters.livestockFenceList
    }
  }, // end computed

  mounted () {
    this.$store.dispatch('queryClinicDoctorList')
  }, // end mounted

  methods: {
    /* -------------------------------------------------------------------------------------------------------------- */
    /**
     * 界面打开后执行的内容
     */
    dialogOpened () {
      if (this.row.id) {
        // 填充表单
        for (let key in this.editForm) {
          if (this.row[key] !== undefined) {
            this.editForm[key] = this.row[key]
          }
        }
        // 填充对应的村(居委会)
        this.editFormLoadCommittee(this.row)
        // 获取对应会员的健康信息
        this.editFormGetMemberHealth(this.row.id)
      }
    },

    /**
     * 关闭添加/编辑界面后执行的内容
     */
    dialogClosed () {
      this.$refs.editForm.resetFields()
    },

    /**
     * 初始化表单疾病种类数组
     */
    editFormInitIllnessArray (index, item) {
      if (item.id) {
        this.editForm.multipleOption.illnessArray[index].id = item.id
      } else {
        this.$message.error('请刷新页面, 重新加载字典数据')
      }
    },

    /**
     * 判断当前操作机构是否为创建机构
     */
    editFormIsCreationClinic () {
      if (!this.row.sysClinicId || !this.payload.clinicId) {
        return false
      }

      return (this.payload.clinicId === this.row.sysClinicId)
    },

    /**
     * 载入对应的 村(居委会)
     */
    editFormGetCommitteeList (id) {
      this.$loading()
      this.editForm.mrmCommitteeId = ''
      const url = `/chisAPI/committee/getByMrmTownshipId`
      let params = {
        mrmTownshipId: id
      }
      this.$http.get(url, {params}).then((res) => {
        this.select.committees = res.data
        this.$loading().close()
      })
    },

    /**
     * 从 row 中加载一个 committee 对象
     * 修改填充表单时调用
     */
    editFormLoadCommittee (row) {
      this.select.committees = []
      let committee = {}
      committee.id = row.mrmCommitteeId
      committee.name = row.mrmCommitteeName
      committee.code = row.mrmCommitteeCode
      this.select.committees.push(committee)
    },

    /**
     * 判断所有过敏史填写项是否为空
     * 只要其中一个填写了就返回 false
     */
    editFormAllergyIsEmpty () {
      if (this.editForm.multipleOption.allergyArray.length > 0 ||
        this.editForm.multipleOption.allergyOther) {
        return false
      }

      return true
    },

    /**
     * 判断所有暴露史填写项是否为空
     * 只要其中一个填写了就返回 false
     */
    editFormExposureIsEmpty () {
      if (this.editForm.multipleOption.exposureArray > 0) {
        return false
      }

      return true
    },

    /**
     * 判断所有疾病种类是否为空
     * 只要其中一个填写了就返回 false
     */
    editFormIllnessIsEmpty () {
      let b = true

      b = this.editForm.multipleOption.illnessArray.every(item => !item.date)

      if (this.editForm.multipleOption.illnessOther ||
        this.editForm.multipleOption.illnessOtherDate) {
        b = false
      }

      return b
    },

    /**
     * 判断所有手术填写项是否为空
     * 只要其中一个填写了就返回 false
     */
    editFormSurgeryIsEmpty () {
      if (this.editForm.multipleOption.surgeryName1 ||
        this.editForm.multipleOption.surgeryDate1 ||
        this.editForm.multipleOption.surgeryName2 ||
        this.editForm.multipleOption.surgeryDate2) {
        return false
      }

      return true
    },

    /**
     * 判断所有外伤填写项是否为空
     * 只要其中一个填写了就返回 false
     */
    editFormTraumaIsEmpty () {
      if (this.editForm.multipleOption.traumaName1 ||
        this.editForm.multipleOption.traumaDate1 ||
        this.editForm.multipleOption.traumaName2 ||
        this.editForm.multipleOption.traumaDate2) {
        return false
      }

      return true
    },

    /**
     * 判断所有输血填写项是否为空
     * 只要其中一个填写了就返回 false
     */
    editFormTransfusionIsEmpty () {
      if (this.editForm.multipleOption.transfusionName1 ||
        this.editForm.multipleOption.transfusionDate1 ||
        this.editForm.multipleOption.transfusionName2 ||
        this.editForm.multipleOption.transfusionDate2) {
        return false
      }

      return true
    },

    /**
     * 判断所有家族史-父亲填写项是否为空
     * 只要其中一个填写了就返回 false
     */
    editFormFatherIsEmpty () {
      if (this.editForm.multipleOption.fatherArray.length > 0 ||
        this.editForm.multipleOption.fatherOther) {
        return false
      }

      return true
    },

    /**
     * 判断所有家族史-母亲填写项是否为空
     * 只要其中一个填写了就返回 false
     */
    editFormMotherIsEmpty () {
      if (this.editForm.multipleOption.motherArray.length > 0 ||
        this.editForm.multipleOption.motherOther) {
        return false
      }

      return true
    },

    /**
     * 判断所有家族史-兄弟姐妹填写项是否为空
     * 只要其中一个填写了就返回 false
     */
    editFormSiblingIsEmpty () {
      if (this.editForm.multipleOption.siblingArray.length > 0 ||
        this.editForm.multipleOption.siblingOther) {
        return false
      }

      return true
    },

    /**
     * 判断所有家族史-子女填写项是否为空
     * 只要其中一个填写了就返回 false
     */
    editFormChildrenIsEmpty () {
      if (this.editForm.multipleOption.childrenArray.length > 0 ||
        this.editForm.multipleOption.childrenOther) {
        return false
      }

      return true
    },

    /**
     * 判断所有残疾情况填写项是否为空
     * 只要其中一个填写了就返回 false
     */
    editFormDisabilityIsEmpty () {
      if (this.editForm.multipleOption.disabilityArray.length > 0 ||
        this.editForm.multipleOption.disabilityOther) {
        return false
      }

      return true
    },

    /**
     * 获取会员健康信息
     */
    editFormGetMemberHealth (mrmMemberId) {
      this.$loading()
      const url = '/chisAPI/memberHealth/getByMrmMemberId'
      let params = {mrmMemberId}

      this.$http.get(url, {params}).then(res => {
        this.editFormLoadMemberHealth(res.data)
        this.$loading().close()
      })
    },

    /**
     * 载入会员健康信息到编辑表单
     */
    editFormLoadMemberHealth (memberHealthList) {
      memberHealthList.forEach(item => {
        // 载入医疗费用支付方式
        if (item.sysDictTypeId === this.dictType.FFS_PAYMENT_WAY) {
          if (item.sysDictId) {
            this.editForm.multipleOption.ffsPaymentWayArray.push(item.sysDictId)
          }
        }

        // 载入药物过敏史
        if (item.sysDictTypeId === this.dictType.ALLERGY) {
          if (item.sysDictId) {
            this.editForm.multipleOption.allergyArray.push(item.sysDictId)
          } else {
            this.editForm.multipleOption.allergyOther = item.diagnosisDetail
          }
        }

        // 载入暴露史
        if (item.sysDictTypeId === this.dictType.EXPOSURE) {
          if (item.sysDictId) {
            this.editForm.multipleOption.exposureArray.push(item.sysDictId)
          }
        }

        // 载入既往史--疾病
        if (item.sysDictTypeId === this.dictType.PREVIOUS_ILLNESS) {
          if (item.sysDictId) {
            let illness = this.editForm.multipleOption.illnessArray.find(illness => illness.id === item.sysDictId)
            illness.date = item.diagnosisDate
          } else {
            this.editForm.multipleOption.illnessOther = item.diagnosisDetail
            this.editForm.multipleOption.illnessOtherDate = item.diagnosisDate
          }
        }

        // 载入家族史--父亲
        if (item.sysDictTypeId === this.dictType.FAMILY_FATHER) {
          if (item.sysDictId) {
            this.editForm.multipleOption.fatherArray.push(item.sysDictId)
          } else {
            this.editForm.multipleOption.fatherOther = item.diagnosisDetail
          }
        }

        // 载入家族史--母亲
        if (item.sysDictTypeId === this.dictType.FAMILY_MOTHER) {
          if (item.sysDictId) {
            this.editForm.multipleOption.motherArray.push(item.sysDictId)
          } else {
            this.editForm.multipleOption.motherOther = item.diagnosisDetail
          }
        }

        // 载入家族史--兄弟姐妹
        if (item.sysDictTypeId === this.dictType.FAMILY_SIBLING) {
          if (item.sysDictId) {
            this.editForm.multipleOption.siblingArray.push(item.sysDictId)
          } else {
            this.editForm.multipleOption.siblingOther = item.diagnosisDetail
          }
        }

        // 载入家族史--子女
        if (item.sysDictTypeId === this.dictType.FAMILY_CHILDREN) {
          if (item.sysDictId) {
            this.editForm.multipleOption.childrenArray.push(item.sysDictId)
          } else {
            this.editForm.multipleOption.childrenOther = item.diagnosisDetail
          }
        }

        // 载入残疾情况
        if (item.sysDictTypeId === this.dictType.DISABILITY) {
          if (item.sysDictId) {
            this.editForm.multipleOption.disabilityArray.push(item.sysDictId)
          } else {
            this.editForm.multipleOption.disabilityOther = item.diagnosisDetail
          }
        }
      }) // end forEach

      // 载入既往史--手术
      let surgeryArray = memberHealthList.filter(item => {
        return item.sysDictTypeId === this.dictType.PREVIOUS_SURGERY
      })

      surgeryArray.forEach((item, index) => {
        if (index === 0) {
          this.editForm.multipleOption.surgeryName1 = item.diagnosisDetail
          this.editForm.multipleOption.surgeryDate1 = item.diagnosisDate
        }

        if (index === 1) {
          this.editForm.multipleOption.surgeryName2 = item.diagnosisDetail
          this.editForm.multipleOption.surgeryDate2 = item.diagnosisDate
        }
      })

      // 载入既往史--外伤
      let traumaArray = memberHealthList.filter(item => {
        return item.sysDictTypeId === this.dictType.PREVIOUS_TRAUMA
      })

      traumaArray.forEach((item, index) => {
        if (index === 0) {
          this.editForm.multipleOption.traumaName1 = item.diagnosisDetail
          this.editForm.multipleOption.traumaDate1 = item.diagnosisDate
        }

        if (index === 1) {
          this.editForm.multipleOption.traumaName2 = item.diagnosisDetail
          this.editForm.multipleOption.traumaDate2 = item.diagnosisDate
        }
      })

      // 载入既往史--输血
      let transfusionArray = memberHealthList.filter(item => {
        return item.sysDictTypeId === this.dictType.PREVIOUS_TRANSFUSION
      })

      transfusionArray.forEach((item, index) => {
        if (index === 0) {
          this.editForm.multipleOption.transfusionName1 = item.diagnosisDetail
          this.editForm.multipleOption.transfusionDate1 = item.diagnosisDate
        }

        if (index === 1) {
          this.editForm.multipleOption.transfusionName2 = item.diagnosisDetail
          this.editForm.multipleOption.transfusionDate2 = item.diagnosisDate
        }
      })

      // 对于空的选项选择无
      this.editFormEmptyCheckNone()
    },

    /**
     * 对于空的选择选择无
     */
    editFormEmptyCheckNone () {
      // 药物过敏史
      if (this.editFormAllergyIsEmpty()) {
        this.editForm.multipleOption.allergyNone = true
      }

      // 暴露史
      if (this.editFormExposureIsEmpty()) {
        this.editForm.multipleOption.exposureNone = true
      }

      // 既往史--疾病
      if (this.editFormIllnessIsEmpty()) {
        this.editForm.multipleOption.illnessNone = true
      }

      // 既往史--手术
      if (this.editFormSurgeryIsEmpty()) {
        this.editForm.multipleOption.surgeryNone = true
      }

      // 既往史--外伤
      if (this.editFormTraumaIsEmpty()) {
        this.editForm.multipleOption.traumaNone = true
      }

      // 既往史--输血
      if (this.editFormTransfusionIsEmpty()) {
        this.editForm.multipleOption.transfusionNone = true
      }

      // 家族史--父亲
      if (this.editFormFatherIsEmpty()) {
        this.editForm.multipleOption.fatherNone = true
      }

      // 家族史--母亲
      if (this.editFormMotherIsEmpty()) {
        this.editForm.multipleOption.motherNone = true
      }

      // 家族史--兄弟姐妹
      if (this.editFormSiblingIsEmpty()) {
        this.editForm.multipleOption.siblingNone = true
      }

      // 家族史--子女
      if (this.editFormChildrenIsEmpty()) {
        this.editForm.multipleOption.childrenNone = true
      }

      // 遗传病史
      if (!this.editForm.geneticIllness) {
        this.editForm.geneticIllnessNone = true
      }

      // 残疾情况
      if (this.editFormDisabilityIsEmpty()) {
        this.editForm.multipleOption.disabilityNone = true
      }
    },

    /**
     * 获取提交的会员健康信息
     */
    editFormGetSubmitMemberHealth () {
      const dataArray = []

      // 获取会员ID
      const mrmMemberId = this.editForm.id
      if (!mrmMemberId) {
        this.$message.error('获取会员ID失败')
        return
      }

      // 获取医疗费用支付方式
      this.editForm.multipleOption.ffsPaymentWayArray.forEach(id => {
        let data = {}

        data.mrmMemberId = mrmMemberId
        data.sysDictTypeId = this.dictType.FFS_PAYMENT_WAY
        data.sysDictId = id
        data.diagnosisDetail = null
        data.diagnosisDate = null

        dataArray.push(data)
      })

      // 获取药物过敏史
      this.editForm.multipleOption.allergyArray.forEach(id => {
        let data = {}

        data.mrmMemberId = mrmMemberId
        data.sysDictTypeId = this.dictType.ALLERGY
        data.sysDictId = id
        data.diagnosisDetail = null
        data.diagnosisDate = null

        dataArray.push(data)
      })

      if (this.editForm.multipleOption.allergyOther) {
        let data = {}

        data.mrmMemberId = mrmMemberId
        data.sysDictTypeId = this.dictType.ALLERGY
        data.sysDictId = null
        data.diagnosisDetail = this.editForm.multipleOption.allergyOther
        data.diagnosisDate = null

        dataArray.push(data)
      }

      // 获取暴露史
      this.editForm.multipleOption.exposureArray.forEach(id => {
        let data = {}

        data.mrmMemberId = mrmMemberId
        data.sysDictTypeId = this.dictType.EXPOSURE
        data.sysDictId = id
        data.diagnosisDetail = null
        data.diagnosisDate = null

        dataArray.push(data)
      })

      // 获取既往史--疾病
      this.editForm.multipleOption.illnessArray.forEach(item => {
        if (item.id && item.date) {
          let data = {}

          data.mrmMemberId = mrmMemberId
          data.sysDictTypeId = this.dictType.PREVIOUS_ILLNESS
          data.sysDictId = item.id
          data.diagnosisDetail = null
          data.diagnosisDate = item.date

          dataArray.push(data)
        }
      })

      if (this.editForm.multipleOption.illnessOther) {
        let data = {}

        data.mrmMemberId = mrmMemberId
        data.sysDictTypeId = this.dictType.PREVIOUS_ILLNESS
        data.sysDictId = null
        data.diagnosisDetail = this.editForm.multipleOption.illnessOther
        data.diagnosisDate = this.editForm.multipleOption.illnessOtherDate

        dataArray.push(data)
      }

      // 获取既往史--手术
      if (this.editForm.multipleOption.surgeryName1) {
        let data = {}

        data.mrmMemberId = mrmMemberId
        data.sysDictTypeId = this.dictType.PREVIOUS_SURGERY
        data.sysDictId = null
        data.diagnosisDetail = this.editForm.multipleOption.surgeryName1
        data.diagnosisDate = this.editForm.multipleOption.surgeryDate1

        dataArray.push(data)
      }

      if (this.editForm.multipleOption.surgeryName2) {
        let data = {}

        data.mrmMemberId = mrmMemberId
        data.sysDictTypeId = this.dictType.PREVIOUS_SURGERY
        data.sysDictId = null
        data.diagnosisDetail = this.editForm.multipleOption.surgeryName2
        data.diagnosisDate = this.editForm.multipleOption.surgeryDate2

        dataArray.push(data)
      }

      // 获取既往史--外伤
      if (this.editForm.multipleOption.traumaName1) {
        let data = {}

        data.mrmMemberId = mrmMemberId
        data.sysDictTypeId = this.dictType.PREVIOUS_TRAUMA
        data.sysDictId = null
        data.diagnosisDetail = this.editForm.multipleOption.traumaName1
        data.diagnosisDate = this.editForm.multipleOption.traumaDate1

        dataArray.push(data)
      }

      if (this.editForm.multipleOption.traumaName2) {
        let data = {}

        data.mrmMemberId = mrmMemberId
        data.sysDictTypeId = this.dictType.PREVIOUS_TRAUMA
        data.sysDictId = null
        data.diagnosisDetail = this.editForm.multipleOption.traumaName2
        data.diagnosisDate = this.editForm.multipleOption.traumaDate2

        dataArray.push(data)
      }

      // 获取既往史--输血
      if (this.editForm.multipleOption.transfusionName1) {
        let data = {}

        data.mrmMemberId = mrmMemberId
        data.sysDictTypeId = this.dictType.PREVIOUS_TRANSFUSION
        data.sysDictId = null
        data.diagnosisDetail = this.editForm.multipleOption.transfusionName1
        data.diagnosisDate = this.editForm.multipleOption.transfusionDate1

        dataArray.push(data)
      }

      if (this.editForm.multipleOption.transfusionName2) {
        let data = {}

        data.mrmMemberId = mrmMemberId
        data.sysDictTypeId = this.dictType.PREVIOUS_TRANSFUSION
        data.sysDictId = null
        data.diagnosisDetail = this.editForm.multipleOption.transfusionName2
        data.diagnosisDate = this.editForm.multipleOption.transfusionDate2

        dataArray.push(data)
      }

      // 获取家族史--父亲
      this.editForm.multipleOption.fatherArray.forEach(id => {
        let data = {}

        data.mrmMemberId = mrmMemberId
        data.sysDictTypeId = this.dictType.FAMILY_FATHER
        data.sysDictId = id
        data.diagnosisDetail = null
        data.diagnosisDate = null

        dataArray.push(data)
      })

      if (this.editForm.multipleOption.fatherOther) {
        let data = {}

        data.mrmMemberId = mrmMemberId
        data.sysDictTypeId = this.dictType.FAMILY_FATHER
        data.sysDictId = null
        data.diagnosisDetail = this.editForm.multipleOption.fatherOther
        data.diagnosisDate = null

        dataArray.push(data)
      }

      // 获取家族史--母亲
      this.editForm.multipleOption.motherArray.forEach(id => {
        let data = {}

        data.mrmMemberId = mrmMemberId
        data.sysDictTypeId = this.dictType.FAMILY_MOTHER
        data.sysDictId = id
        data.diagnosisDetail = null
        data.diagnosisDate = null

        dataArray.push(data)
      })

      if (this.editForm.multipleOption.motherOther) {
        let data = {}

        data.mrmMemberId = mrmMemberId
        data.sysDictTypeId = this.dictType.FAMILY_MOTHER
        data.sysDictId = null
        data.diagnosisDetail = this.editForm.multipleOption.motherOther
        data.diagnosisDate = null

        dataArray.push(data)
      }

      // 获取家族史--兄弟姐妹
      this.editForm.multipleOption.siblingArray.forEach(id => {
        let data = {}

        data.mrmMemberId = mrmMemberId
        data.sysDictTypeId = this.dictType.FAMILY_SIBLING
        data.sysDictId = id
        data.diagnosisDetail = null
        data.diagnosisDate = null

        dataArray.push(data)
      })

      if (this.editForm.multipleOption.siblingOther) {
        let data = {}

        data.mrmMemberId = mrmMemberId
        data.sysDictTypeId = this.dictType.FAMILY_SIBLING
        data.sysDictId = null
        data.diagnosisDetail = this.editForm.multipleOption.siblingOther
        data.diagnosisDate = null

        dataArray.push(data)
      }

      // 获取家族史--子女
      this.editForm.multipleOption.childrenArray.forEach(id => {
        let data = {}

        data.mrmMemberId = mrmMemberId
        data.sysDictTypeId = this.dictType.FAMILY_CHILDREN
        data.sysDictId = id
        data.diagnosisDetail = null
        data.diagnosisDate = null

        dataArray.push(data)
      })

      if (this.editForm.multipleOption.childrenOther) {
        let data = {}

        data.mrmMemberId = mrmMemberId
        data.sysDictTypeId = this.dictType.FAMILY_CHILDREN
        data.sysDictId = null
        data.diagnosisDetail = this.editForm.multipleOption.childrenOther
        data.diagnosisDate = null

        dataArray.push(data)
      }

      // 获取残疾情况
      this.editForm.multipleOption.disabilityArray.forEach(id => {
        let data = {}

        data.mrmMemberId = mrmMemberId
        data.sysDictTypeId = this.dictType.DISABILITY
        data.sysDictId = id
        data.diagnosisDetail = null
        data.diagnosisDate = null

        dataArray.push(data)
      })

      if (this.editForm.multipleOption.disabilityOther) {
        let data = {}

        data.mrmMemberId = mrmMemberId
        data.sysDictTypeId = this.dictType.DISABILITY
        data.sysDictId = null
        data.diagnosisDetail = this.editForm.multipleOption.disabilityOther
        data.diagnosisDate = null

        dataArray.push(data)
      }

      return dataArray
    },

    /**
     * 提交表单数据
     */
    editFormSubmit () {
      this.$refs.editForm.validate((valid) => {
        if (valid) {
          this.$loading()
          const url = '/chisAPI/member/updateHealthArchive'
          let method = 'PUT'

          let member = {}
          for (let key in this.editForm) {
            if (key !== 'multipleOption') {
              member[key] = this.editForm[key]
            }
          }
          let data = {
            mrmMemberJson: JSON.stringify(member),
            mrmMemberHealthJson: JSON.stringify(this.editFormGetSubmitMemberHealth())
          }

          this.$http({method, url, data}).then((res) => {
            if (res.data.code === 200) {
              this.$message.success(res.data.msg)
              this.dialogClose()
              this.dataGridLoadData()
            } else {
              this.$message.error(res.data.msg)
              this.$loading().close()
            }
          })
        } else {
          return false
        }
      })
    }
  } // end methods
}
</script>

<style scoped>
  .health-archive {
    height: 93vh;
    overflow: auto;
    background: url('../../../../assets/images/tengwan.png') no-repeat 100% 10px; /*图片地址 重复 左距离 上距离*/
    background-size: 39%; /* 背景图片缩放比例*/
  }

  .health-archive .el-form {
    background-color: rgba(245, 249, 249, 0.88);
    padding: 30px 0;
  }

  .health-archive img {
    width: 150px;
  }

  .health-archive table {
    width: 1250px;
    margin: 0 auto;
    text-align: left;
    border-collapse: collapse; /* 边框合并成一条 */
  }

  .health-archive table tr:not(:first-child) td {
    padding: 0 10px;
    border: 1px solid #3BB878;
  }

  .health-archive .title {
    padding-top: 6px;
  }
</style>
<style>
  .health-archive .el-form-item {
    height: 15px;
  }

  .health-archive .el-select__tags-text {
    font-size: 14px;
  }

  .health-archive input.el-input__inner {
    font-size: 14px;
    background-color: transparent;
    border: 0;
    outline: none;
    cursor: auto;/*光标样式*/
    /*border-bottom: 1px solid #aaa;*//*底部边线: 像素 实线 颜色*/
    border-radius: 1px;/*边角弧度*/
  }
</style>
