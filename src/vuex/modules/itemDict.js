import axios from 'axios'
import store from '../index'

export default {
  state: {
    // 项目单位
    itemUnitsList: null,

    // 适用性别
    befitGenderList: null,

    // 项目分类
    itemClassifyList: null
  },

  /**
   * 获取 state 中属性的值
   * this.$store.getters.方法名
   */
  getters: {
    itemUnitsList: (state) => {
      if (!state.itemUnitsList) {
        store.dispatch('queryItemUnitsList')
      }
      return state.itemUnitsList
    },

    befitGenderList: (state) => {
      if (!state.befitGenderList) {
        store.dispatch('queryBefitGenderList')
      }
      return state.befitGenderList
    },

    itemClassifyList: (state) => {
      if (!state.itemClassifyList) {
        store.dispatch('queryItemClassifyList')
      }
      return state.itemClassifyList
    }
  },

  /**
   * 修改 state 中属性的值
   * 不能在这里进行异步操作
   * this.$store.commit(方法名, 参数...)
   */
  mutations: {
    itemUnitsList (state, data) {
      state.itemUnitsList = data
    },

    befitGenderList (state, data) {
      state.befitGenderList = data
    },

    itemClassifyList (state, data) {
      state.itemClassifyList = data
    }
  },

  /**
   * 接受对 vuex 的各种操作,可以是异步的
   * 持久化数据的存储和访问应该在这里进行
   * this.$store.dispatch(mutations方法名, 参数...)
   */
  actions: {
    // 查询项目单位
    queryItemUnitsList (context) {
      const url = '/chisAPI/itemUnits/getEnabledByTypeId'
      axios.get(url).then((res) => {
        context.commit('itemUnitsList', res.data)
      })
    },

    // 查询适用性别
    queryBefitGenderList (context) {
      const url = '/chisAPI/gender/getEnabledByTypeId'
      axios.get(url).then((res) => {
        // 只过滤出 男 和 女
        let data = res.data.filter((item) => {
          return (item.name === '男' || item.name === '女')
        })
        context.commit('befitGenderList', data)
      })
    },

    // 查询项目分类
    queryItemClassifyList (context) {
      const url = '/chisAPI/itemClassify/getEnabledByTypeId'
      axios.get(url).then((res) => {
        context.commit('itemClassifyList', res.data)
      })
    }
  } // end actions
}
