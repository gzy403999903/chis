import axios from 'axios'

/**
 * 该模块中的 getter 方法不能直接调用 dispatch
 * 在页面中使用 计算属性 获取, 但在获取之前使用 mounted 调用该属性的 dispatch 进行查询
 * 否则切换机构后 获取到数据可能是切换之前机构的
 * readme.txt
 *
 * 此模块中 state 中属性都以 clinic 开头
 */
export default {
  state: {
    // 机构用户
    clinicUserList: null,

    // 机构医生
    clinicDoctorList: null,

    // 货位
    clinicShelfPositionList: null
  },

  /**
   * 获取 state 中属性的值
   * this.$store.getters.方法名
   */
  getters: {
    clinicUserList: (state) => {
      return state.clinicUserList
    },

    clinicDoctorList: (state) => {
      return state.clinicDoctorList
    },

    clinicShelfPositionList: (state) => {
      return state.clinicShelfPositionList
    }
  },

  /**
   * 修改 state 中属性的值
   * 不能在这里进行异步操作
   * this.$store.commit(方法名, 参数...)
   */
  mutations: {
    clinicUserList (state, data) {
      state.clinicUserList = data
    },

    clinicDoctorList (state, data) {
      state.clinicDoctorList = data
    },

    clinicShelfPositionList (state, data) {
      state.clinicShelfPositionList = data
    }
  },

  /**
   * 接受对 vuex 的各种操作,可以是异步的
   * 持久化数据的存储和访问应该在这里进行
   * this.$store.dispatch(mutations方法名, 参数...)
   */
  actions: {
    // 获取机构启用状态用户
    queryClinicUserList (context) {
      const url = '/chisAPI/user/getClinicEnabled'
      axios.get(url).then((res) => {
        context.commit('clinicUserList', res.data)
      })
    },

    // 获取机构启用状态医生
    queryClinicDoctorList (context) {
      const url = '/chisAPI/doctor/getClinicEnabled'
      axios.get(url).then((res) => {
        context.commit('clinicDoctorList', res.data)
      })
    },

    // 查询机构对应的货位
    queryClinicShelfPositionList (context) {
      const url = '/chisAPI/shelfPosition/getClinicListAll'
      axios.get(url).then((res) => {
        context.commit('clinicShelfPositionList', res.data)
      })
    }

  } // end actions
}
