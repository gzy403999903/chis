import axios from 'axios'
import store from '../index'

export default {
  state: {
    // 计费类型
    billingTypeList: null,

    // 发票类型
    invoiceTypeList: null,

    // 付款类型
    paymentTypeList: null,

    // 付款方式
    paymentWayList: null,

    // 纳税人类型
    taxpayerTypeList: null,

    // 收费班次
    workGroupList: null
  }, // end state

  /**
   * 获取 state 中属性的值
   * this.$store.getters.方法名
   */
  getters: {
    billingTypeList: (state) => {
      if (!state.billingTypeList) {
        store.dispatch('queryBillingTypeList')
      }
      return state.billingTypeList
    },

    invoiceTypeList: (state) => {
      if (!state.invoiceTypeList) {
        store.dispatch('queryInvoiceTypeList')
      }
      return state.invoiceTypeList
    },

    paymentTypeList: (state) => {
      if (!state.paymentTypeList) {
        store.dispatch('queryPaymentTypeList')
      }
      return state.paymentTypeList
    },

    paymentWayList: (state) => {
      if (!state.paymentWayList) {
        store.dispatch('queryPaymentWayList')
      }
      return state.paymentWayList
    },

    taxpayerTypeList: (state) => {
      if (!state.taxpayerTypeList) {
        store.dispatch('queryTaxpayerTypeList')
      }
      return state.taxpayerTypeList
    },

    workGroupList: (state) => {
      if (!state.workGroupList) {
        store.dispatch('queryWorkGroupList')
      }
      return state.workGroupList
    }
  }, // end getters

  /**
   * 修改 state 中属性的值
   * 不能在这里进行异步操作
   * this.$store.commit(方法名, 参数...)
   */
  mutations: {
    billingTypeList (state, data) {
      state.billingTypeList = data
    },

    invoiceTypeList (state, data) {
      state.invoiceTypeList = data
    },

    paymentTypeList (state, data) {
      state.paymentTypeList = data
    },

    paymentWayList (state, data) {
      state.paymentWayList = data
    },

    taxpayerTypeList (state, data) {
      state.taxpayerTypeList = data
    },

    workGroupList (state, data) {
      state.workGroupList = data
    }
  }, // end mutations

  /**
   * 接受对 vuex 的各种操作,可以是异步的
   * 持久化数据的存储和访问应该在这里进行
   * this.$store.dispatch(mutations方法名, 参数...)
   */
  actions: {
    // 查询计费类型
    queryBillingTypeList (context) {
      const url = '/chisAPI/billingType/getEnabledByTypeId'
      axios.get(url).then((res) => {
        context.commit('billingTypeList', res.data)
      })
    },

    // 查询发票类型
    queryInvoiceTypeList (context) {
      const url = '/chisAPI/invoiceType/getEnabledByTypeId'
      axios.get(url).then((res) => {
        context.commit('invoiceTypeList', res.data)
      })
    },

    // 查询付款类型
    queryPaymentTypeList (context) {
      const url = '/chisAPI/paymentType/getEnabledByTypeId'
      axios.get(url).then((res) => {
        context.commit('paymentTypeList', res.data)
      })
    },

    // 查询付款方式
    queryPaymentWayList (context) {
      const url = '/chisAPI/paymentWay/getEnabled'
      axios.get(url).then((res) => {
        context.commit('paymentWayList', res.data.resultSet.list)
      })
    },

    // 查询纳税人类型
    queryTaxpayerTypeList (context) {
      const url = '/chisAPI/taxpayerType/getEnabledByTypeId'
      axios.get(url).then((res) => {
        context.commit('taxpayerTypeList', res.data)
      })
    },

    // 收费班次
    queryWorkGroupList (context) {
      const url = '/chisAPI/workGroup/getEnabled'
      axios.get(url).then((res) => {
        context.commit('workGroupList', res.data)
      })
    }
  } // end actions
}
