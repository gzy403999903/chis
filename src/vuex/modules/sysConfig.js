export default {
  state: {
    // 分页插件配置
    pagination: {
      total: 0, /* 总记录数 */
      pageSize: 30, /* 每页显示的行数 */
      currentPage: 1, /* 当前页页码 */
      pagerCount: 5, /* 分页页码按钮的数量 */
      pageSizes: [30, 50, 100], /* 选取每页显示的行数 */
      layout: 'total, sizes, prev, pager, next, jumper'
    },

    // 存储后台给予权限的 token
    tokenKey: 'Authorization',
    token: null,

    // 允许在 select 中创建诊断
    allowCreateDiagnose: false,

    // 自动刷新时间(秒)
    autoRefreshTime: 120
  },

  /**
   * 获取 state 中属性的值
   * this.$store.getters.方法名
   */
  getters: {
    pagination: (state) => {
      return state.pagination
    },

    // 获取 tokenKey
    tokenKey: (state) => {
      return state.tokenKey
    },

    // 获取 token
    token: (state) => {
      if (!state.token) {
        state.token = localStorage.getItem(state.tokenKey)
      }
      return state.token
    },

    allowCreateDiagnose: (state) => {
      return state.allowCreateDiagnose
    },

    autoRefreshTime: (state) => {
      return state.autoRefreshTime
    }
  },

  /**
   * 修改 state 中属性的值
   * 不能在这里进行异步操作
   * this.$store.commit(方法名, 参数...)
   */
  mutations: {
    // 存储 token
    setToken (state, token) {
      state.token = token
      localStorage.setItem(state.tokenKey, token)
    },

    // 删除 token
    removeToken (state) {
      state.token = null
      localStorage.removeItem(state.tokenKey)
    }
  },

  /**
   * 接受对 vuex 的各种操作,可以是异步的
   * 持久化数据的存储和访问应该在这里进行
   * this.$store.dispatch(mutations方法名, 参数...)
   */
  actions: {
    // 设置 token
    setToken (context, token) {
      context.commit('setToken', token)
    },

    // 删除 token
    removeToken (context) {
      context.commit('removeToken')
    }
  }
}
