import axios from 'axios'
import store from '../index'

export default {
  state: {
    // 商品单位
    goodsUnitsList: null,

    // 商品分类
    goodsClassifyList: null,

    // 产地
    originList: null,

    // 销售分类
    sellClassifyList: null,

    // 剂型
    doseTypeList: null,

    // 剂量单位
    doseUnitsList: null,

    // 特殊药品
    specialDrugList: null,

    // 给药途径
    drugUsageList: null,

    // 存储条件
    storageTemperatureList: null,

    // 处方类型
    prescriptionTypeList: null,

    // 用药频次
    drugFrequencyList: null,

    // 药品炮制方法
    drugsPrepareMethodList: null

  },

  /**
   * 获取 state 中属性的值
   * this.$store.getters.方法名
   */
  getters: {
    goodsUnitsList: (state) => {
      if (!state.goodsUnitsList) {
        store.dispatch('queryGoodsUnitsList')
      }
      return state.goodsUnitsList
    },

    goodsClassifyList: (state) => {
      if (!state.goodsClassifyList) {
        store.dispatch('queryGoodsClassifyList')
      }
      return state.goodsClassifyList
    },

    originList: (state) => {
      if (!state.originList) {
        store.dispatch('queryOriginList')
      }
      return state.originList
    },

    sellClassifyList: (state) => {
      if (!state.sellClassifyList) {
        store.dispatch('querySellClassifyList')
      }
      return state.sellClassifyList
    },

    doseTypeList: (state) => {
      if (!state.doseTypeList) {
        store.dispatch('queryDoseTypeList')
      }
      return state.doseTypeList
    },

    doseUnitsList: (state) => {
      if (!state.doseUnitsList) {
        store.dispatch('queryDoseUnitsList')
      }
      return state.doseUnitsList
    },

    specialDrugList: (state) => {
      if (!state.specialDrugList) {
        store.dispatch('querySpecialDrugList')
      }
      return state.specialDrugList
    },

    drugUsageList: (state) => {
      if (!state.drugUsageList) {
        store.dispatch('queryDrugUsageList')
      }
      return state.drugUsageList
    },

    storageTemperatureList: (state) => {
      if (!state.storageTemperatureList) {
        store.dispatch('queryStorageTemperatureList')
      }
      return state.storageTemperatureList
    },

    prescriptionTypeList: (state) => {
      if (!state.prescriptionTypeList) {
        store.dispatch('queryPrescriptionTypeList')
      }
      return state.prescriptionTypeList
    },

    drugFrequencyList: (state) => {
      if (!state.drugFrequencyList) {
        store.dispatch('queryDrugFrequencyList')
      }
      return state.drugFrequencyList
    },

    drugsPrepareMethodList: (state) => {
      if (!state.drugsPrepareMethodList) {
        store.dispatch('queryDrugsPrepareMethodList')
      }
      return state.drugsPrepareMethodList
    }
  },

  /**
   * 修改 state 中属性的值
   * 不能在这里进行异步操作
   * this.$store.commit(方法名, 参数...)
   */
  mutations: {
    goodsUnitsList (state, data) {
      state.goodsUnitsList = data
    },

    goodsClassifyList (state, data) {
      state.goodsClassifyList = data
    },

    originList (state, data) {
      state.originList = data
    },
    sellClassifyList (state, data) {
      state.sellClassifyList = data
    },

    doseTypeList (state, data) {
      state.doseTypeList = data
    },

    doseUnitsList (state, data) {
      state.doseUnitsList = data
    },

    specialDrugList (state, data) {
      state.specialDrugList = data
    },

    drugUsageList (state, data) {
      state.drugUsageList = data
    },

    storageTemperatureList (state, data) {
      state.storageTemperatureList = data
    },

    prescriptionTypeList (state, data) {
      state.prescriptionTypeList = data
    },

    drugFrequencyList (state, data) {
      state.drugFrequencyList = data
    },

    drugsPrepareMethodList (state, data) {
      state.drugsPrepareMethodList = data
    }
  },

  /**
   * 接受对 vuex 的各种操作,可以是异步的
   * 持久化数据的存储和访问应该在这里进行
   * this.$store.dispatch(mutations方法名, 参数...)
   */
  actions: {
    // 查询商品单位
    queryGoodsUnitsList (context) {
      const url = '/chisAPI/goodsUnits/getEnabledByTypeId'
      axios.get(url).then((res) => {
        context.commit('goodsUnitsList', res.data)
      })
    },

    // 查询商品分类
    queryGoodsClassifyList (context) {
      const url = '/chisAPI/goodsClassify/getEnabledByTypeId'
      axios.get(url).then((res) => {
        context.commit('goodsClassifyList', res.data)
      })
    },

    // 查询产地
    queryOriginList (context) {
      const url = '/chisAPI/origin/getEnabledByTypeId'
      axios.get(url).then((res) => {
        context.commit('originList', res.data)
      })
    },

    // 查询销售分类
    querySellClassifyList (context) {
      const url = '/chisAPI/sellClassify/getEnabledByTypeId'
      axios.get(url).then((res) => {
        context.commit('sellClassifyList', res.data)
      })
    },

    // 查询剂型
    queryDoseTypeList (context) {
      const url = '/chisAPI/doseType/getEnabledByTypeId'
      axios.get(url).then((res) => {
        context.commit('doseTypeList', res.data)
      })
    },

    // 查询剂量单位
    queryDoseUnitsList (context) {
      const url = '/chisAPI/doseUnits/getEnabledByTypeId'
      axios.get(url).then((res) => {
        context.commit('doseUnitsList', res.data)
      })
    },

    // 查询特殊药品
    querySpecialDrugList (context) {
      const url = '/chisAPI/specialDrug/getEnabledByTypeId'
      axios.get(url).then((res) => {
        context.commit('specialDrugList', res.data)
      })
    },

    // 查询给药途径
    queryDrugUsageList (context) {
      const url = '/chisAPI/drugUsage/getEnabledByTypeId'
      axios.get(url).then((res) => {
        context.commit('drugUsageList', res.data)
      })
    },

    // 查询存储条件
    queryStorageTemperatureList (context) {
      const url = '/chisAPI/storageTemperature/getEnabledByTypeId'
      axios.get(url).then((res) => {
        context.commit('storageTemperatureList', res.data)
      })
    },

    // 查询处方类型
    queryPrescriptionTypeList (context) {
      const url = '/chisAPI/prescriptionType/getEnabledByTypeId'
      axios.get(url).then((res) => {
        context.commit('prescriptionTypeList', res.data)
      })
    },

    // 获取用药频次
    queryDrugFrequencyList (context) {
      const url = '/chisAPI/drugFrequency/getEnabledByTypeId'
      axios.get(url).then((res) => {
        context.commit('drugFrequencyList', res.data)
      })
    },

    // 获取药品炮制方法
    queryDrugsPrepareMethodList (context) {
      const url = '/chisAPI/drugsPrepareMethod/getEnabledByTypeId'
      axios.get(url).then((res) => {
        context.commit('drugsPrepareMethodList', res.data)
      })
    }

  }
}
