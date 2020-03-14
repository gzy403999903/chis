import axios from 'axios'
import store from '../index'

export default {
  state: {
    // 省份
    provincesList: null,

    // 乡镇(街道)
    townshipList: null,

    // 挂号费
    registrationFeeList: null,

    // 西医诊断分类
    westernDiagnoseClassifyList: null,

    // 中医诊断分类
    chineseDiagnoseClassifyList: null

  },

  /**
   * 获取 state 中属性的值
   * this.$store.getters.方法名
   */
  getters: {
    provincesList: (state) => {
      if (!state.provincesList) {
        store.dispatch('queryProvincesList')
      }
      return state.provincesList
    },

    townshipList: (state) => {
      if (!state.townshipList) {
        store.dispatch('queryTownshipList')
      }
      return state.townshipList
    },

    registrationFeeList: (state) => {
      if (!state.registrationFeeList) {
        store.dispatch('queryRegistrationFeeList')
      }
      return state.registrationFeeList
    },

    westernDiagnoseClassifyList: (state) => {
      if (!state.westernDiagnoseClassifyList) {
        store.dispatch('queryWesternDiagnoseClassifyList')
      }
      return state.westernDiagnoseClassifyList
    },

    chineseDiagnoseClassifyList: (state) => {
      if (!state.chineseDiagnoseClassifyList) {
        store.dispatch('queryChineseDiagnoseClassifyList')
      }
      return state.chineseDiagnoseClassifyList
    }

  },

  /**
   * 修改 state 中属性的值
   * 不能在这里进行异步操作
   * this.$store.commit(方法名, 参数...)
   */
  mutations: {
    provincesList (state, data) {
      state.provincesList = data
    },

    townshipList (state, data) {
      state.townshipList = data
    },

    registrationFeeList (state, data) {
      state.registrationFeeList = data
    },

    westernDiagnoseClassifyList (state, data) {
      state.westernDiagnoseClassifyList = data
    },

    chineseDiagnoseClassifyList (state, data) {
      state.chineseDiagnoseClassifyList = data
    }
  },

  /**
   * 接受对 vuex 的各种操作,可以是异步的
   * 持久化数据的存储和访问应该在这里进行
   * this.$store.dispatch(mutations方法名, 参数...)
   */
  actions: {
    // 获取省份列表
    queryProvincesList (context) {
      const url = '/chisAPI/location/getProvinceIdGroupList'
      axios.get(url).then((res) => {
        context.commit('provincesList', res.data)
      })
    },

    // 获取所有乡镇(街道)
    queryTownshipList (context) {
      const url = '/chisAPI/township/getAll'
      axios.get(url).then((res) => {
        context.commit('townshipList', res.data)
      })
    },

    // 获取所有启用状态挂号费
    queryRegistrationFeeList (context) {
      const url = '/chisAPI/otherItem/getEnabledRegistrationFee'
      axios.get(url).then((res) => {
        context.commit('registrationFeeList', res.data)
      })
    },

    // 获取西医诊断分类
    queryWesternDiagnoseClassifyList (context) {
      const url = '/chisAPI/westernDiagnoseClassify/getAll'
      axios.get(url).then((res) => {
        context.commit('westernDiagnoseClassifyList', res.data)
      })
    },

    // 获取中医诊断分类
    queryChineseDiagnoseClassifyList (context) {
      const url = '/chisAPI/chineseDiagnoseClassify/getAll'
      axios.get(url).then((res) => {
        context.commit('chineseDiagnoseClassifyList', res.data)
      })
    }

  } // end actions

}
