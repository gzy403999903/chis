import axios from 'axios'
import store from '../index'

export default {
  state: {
    genderList: null, // 性别

    nationalityList: null, // 民族

    maritalList: null, // 婚姻状况

    educationList: null, // 文化程度

    bloodTypeList: null, // 血型

    rhList: null, // RH

    professionList: null, // 职业

    ffsPaymentWayList: null, // 医疗费用支付方式

    memberTypeList: null, // 会员类型

    allergyList: null, // 药物过敏史

    exposureList: null, // 暴露史

    illnessList: null, // 疾病

    familyIllnessList: null, // 家族史疾病

    disabilityList: null, // 残疾状况

    kitchenExhaustList: null, // 厨房排风

    fuelTypeList: null, // 燃料类型

    waterSourceList: null, // 饮水

    toiletTypeList: null, // 厕所类型

    livestockFenceList: null // 禽畜栏
  },

  /**
   * 获取 state 中属性的值
   * this.$store.getters.方法名
   */
  getters: {
    genderList: (state) => {
      if (!state.genderList) {
        store.dispatch('queryGenderList')
      }
      return state.genderList
    },

    nationalityList: (state) => {
      if (!state.nationalityList) {
        store.dispatch('queryNationalityList')
      }
      return state.nationalityList
    },

    maritalList: (state) => {
      if (!state.maritalList) {
        store.dispatch('queryMaritalList')
      }
      return state.maritalList
    },

    educationList: (state) => {
      if (!state.educationList) {
        store.dispatch('queryEducationList')
      }
      return state.educationList
    },

    bloodTypeList: (state) => {
      if (!state.bloodTypeList) {
        store.dispatch('queryBloodTypeList')
      }
      return state.bloodTypeList
    },

    rhList: (state) => {
      if (!state.rhList) {
        store.dispatch('queryRhList')
      }
      return state.rhList
    },

    professionList: (state) => {
      if (!state.professionList) {
        store.dispatch('queryProfessionList')
      }
      return state.professionList
    },

    ffsPaymentWayList: (state) => {
      if (!state.ffsPaymentWayList) {
        store.dispatch('queryFFSPaymentWayList')
      }
      return state.ffsPaymentWayList
    },

    memberTypeList: (state) => {
      if (!state.memberTypeList) {
        store.dispatch('queryMemberTypeList')
      }
      return state.memberTypeList
    },

    allergyList: (state) => {
      if (!state.allergyList) {
        store.dispatch('queryAllergyList')
      }
      return state.allergyList
    },

    exposureList: (state) => {
      if (!state.exposureList) {
        store.dispatch('queryExposureList')
      }
      return state.exposureList
    },

    illnessList: (state) => {
      if (!state.illnessList) {
        store.dispatch('queryIllnessList')
      }
      return state.illnessList
    },

    familyIllnessList: (state) => {
      if (!state.familyIllnessList) {
        store.dispatch('queryFamilyIllnessList')
      }
      return state.familyIllnessList
    },

    disabilityList: (state) => {
      if (!state.disabilityList) {
        store.dispatch('queryDisabilityList')
      }
      return state.disabilityList
    },

    kitchenExhaustList: (state) => {
      if (!state.kitchenExhaustList) {
        store.dispatch('queryKitchenExhaustList')
      }
      return state.kitchenExhaustList
    },

    fuelTypeList: (state) => {
      if (!state.fuelTypeList) {
        store.dispatch('queryFuelTypeList')
      }
      return state.fuelTypeList
    },

    waterSourceList: (state) => {
      if (!state.waterSourceList) {
        store.dispatch('queryWaterSourceList')
      }
      return state.waterSourceList
    },

    toiletTypeList: (state) => {
      if (!state.toiletTypeList) {
        store.dispatch('queryToiletTypeList')
      }
      return state.toiletTypeList
    },

    livestockFenceList: (state) => {
      if (!state.livestockFenceList) {
        store.dispatch('queryLivestockFenceList')
      }
      return state.livestockFenceList
    }
  },

  /**
   * 修改 state 中属性的值
   * 不能在这里进行异步操作
   * this.$store.commit(方法名, 参数...)
   */
  mutations: {
    genderList (state, data) {
      state.genderList = data
    },

    nationalityList (state, data) {
      state.nationalityList = data
    },

    maritalList (state, data) {
      state.maritalList = data
    },

    educationList (state, data) {
      state.educationList = data
    },

    bloodTypeList (state, data) {
      state.bloodTypeList = data
    },

    rhList (state, data) {
      state.rhList = data
    },

    professionList (state, data) {
      state.professionList = data
    },

    ffsPaymentWayList (state, data) {
      state.ffsPaymentWayList = data
    },

    memberTypeList (state, data) {
      state.memberTypeList = data
    },

    allergyList (state, data) {
      state.allergyList = data
    },

    exposureList (state, data) {
      state.exposureList = data
    },

    illnessList (state, data) {
      state.illnessList = data
    },

    familyIllnessList (state, data) {
      state.familyIllnessList = data
    },

    disabilityList (state, data) {
      state.disabilityList = data
    },

    kitchenExhaustList (state, data) {
      state.kitchenExhaustList = data
    },

    fuelTypeList (state, data) {
      state.fuelTypeList = data
    },

    waterSourceList (state, data) {
      state.waterSourceList = data
    },

    toiletTypeList (state, data) {
      state.toiletTypeList = data
    },

    livestockFenceList (state, data) {
      state.livestockFenceList = data
    }
  },

  /**
   * 接受对 vuex 的各种操作,可以是异步的
   * 持久化数据的存储和访问应该在这里进行
   * this.$store.dispatch(mutations方法名, 参数...)
   */
  actions: {
    // 获取性别字典
    queryGenderList (context) {
      const url = '/chisAPI/gender/getEnabledByTypeId'
      axios.get(url).then((res) => {
        context.commit('genderList', res.data)
      })
    },

    // 获取民族字典
    queryNationalityList (context) {
      const url = '/chisAPI/nationality/getEnabledByTypeId'
      axios.get(url).then((res) => {
        context.commit('nationalityList', res.data)
      })
    },

    // 获取婚姻状况字典
    queryMaritalList (context) {
      const url = '/chisAPI/marital/getEnabledByTypeId'
      axios.get(url).then((res) => {
        context.commit('maritalList', res.data)
      })
    },

    // 获取文化程度字典
    queryEducationList (context) {
      const url = '/chisAPI/education/getEnabledByTypeId'
      axios.get(url).then((res) => {
        context.commit('educationList', res.data)
      })
    },

    // 获取血型字典
    queryBloodTypeList (context) {
      const url = '/chisAPI/bloodType/getEnabledByTypeId'
      axios.get(url).then((res) => {
        context.commit('bloodTypeList', res.data)
      })
    },

    // 获取RH字典
    queryRhList (context) {
      const url = '/chisAPI/rh/getEnabledByTypeId'
      axios.get(url).then((res) => {
        context.commit('rhList', res.data)
      })
    },

    // 获取职业字典
    queryProfessionList (context) {
      const url = '/chisAPI/profession/getEnabledByTypeId'
      axios.get(url).then((res) => {
        context.commit('professionList', res.data)
      })
    },

    // 获取医疗费用支付方式字典
    queryFFSPaymentWayList (context) {
      const url = '/chisAPI/ffsPaymentWay/getEnabledByTypeId'
      axios.get(url).then((res) => {
        context.commit('ffsPaymentWayList', res.data)
      })
    },

    // 获取全部会员类型
    queryMemberTypeList (context) {
      const url = '/chisAPI/memberType/getEnabled'
      axios.get(url).then((res) => {
        context.commit('memberTypeList', res.data)
      })
    },

    // 获取药物过敏史字典
    queryAllergyList (context) {
      const url = '/chisAPI/allergy/getEnabledByTypeId'
      axios.get(url).then((res) => {
        context.commit('allergyList', res.data)
      })
    },

    // 获取暴露史字典
    queryExposureList (context) {
      const url = '/chisAPI/exposure/getEnabledByTypeId'
      axios.get(url).then((res) => {
        context.commit('exposureList', res.data)
      })
    },

    // 获取疾病种类字典
    queryIllnessList (context) {
      const url = '/chisAPI/illness/getEnabledByTypeId'
      axios.get(url).then((res) => {
        context.commit('illnessList', res.data)
      })
    },

    // 获取家族史疾病种类字典
    queryFamilyIllnessList (context) {
      const url = '/chisAPI/familyIllness/getEnabledByTypeId'
      axios.get(url).then((res) => {
        context.commit('familyIllnessList', res.data)
      })
    },

    // 获取残疾状况字典
    queryDisabilityList (context) {
      const url = '/chisAPI/disability/getEnabledByTypeId'
      axios.get(url).then((res) => {
        context.commit('disabilityList', res.data)
      })
    },

    // 获取厨房排风字典
    queryKitchenExhaustList (context) {
      const url = '/chisAPI/kitchenExhaust/getEnabledByTypeId'
      axios.get(url).then((res) => {
        context.commit('kitchenExhaustList', res.data)
      })
    },

    // 获取燃料类型字典
    queryFuelTypeList (context) {
      const url = '/chisAPI/fuelType/getEnabledByTypeId'
      axios.get(url).then((res) => {
        context.commit('fuelTypeList', res.data)
      })
    },

    // 获取饮水字典
    queryWaterSourceList (context) {
      const url = '/chisAPI/waterSource/getEnabledByTypeId'
      axios.get(url).then((res) => {
        context.commit('waterSourceList', res.data)
      })
    },

    // 获取厕所字典
    queryToiletTypeList (context) {
      const url = '/chisAPI/toiletType/getEnabledByTypeId'
      axios.get(url).then((res) => {
        context.commit('toiletTypeList', res.data)
      })
    },

    // 获取禽畜栏字典
    queryLivestockFenceList (context) {
      const url = '/chisAPI/livestockFence/getEnabledByTypeId'
      axios.get(url).then((res) => {
        context.commit('livestockFenceList', res.data)
      })
    }

  } // end actions
}
