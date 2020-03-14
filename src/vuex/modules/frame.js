export default {
  state: {
    // 是否折叠侧边栏
    isFoldLeftBar: false,

    // 侧边栏高度
    leftBarMaxHeight: window.innerHeight,

    // 显示侧边栏菜单名称
    leftBarMenuName: '',

    // 显示修改密码面板
    passwordPanelVisible: false,

    // 数据表最大高度
    dataGridHeight: window.innerHeight - 120,
    dialogDataGridHeight: window.innerHeight - 50
  },

  /**
   * 获取 state 中属性的值
   * this.$store.getters.方法名
   */
  getters: {
    isFoldLeftBar: (state) => {
      return state.isFoldLeftBar
    },

    leftBarMaxHeight: (state) => {
      return state.leftBarMaxHeight
    },

    leftBarMenuName: (state) => {
      return state.leftBarMenuName
    },

    passwordPanelVisible: (state) => {
      return state.passwordPanelVisible
    },

    dataGridHeight: (state) => {
      return state.dataGridHeight
    },

    dialogDataGridHeight: (state) => {
      return state.dialogDataGridHeight
    }
  },

  /**
   * 修改 state 中属性的值
   * 不能在这里进行异步操作
   * this.$store.commit(方法名, 参数...)
   */
  mutations: {
    isFoldLeftBar (state, isFold) {
      state.isFoldLeftBar = isFold
    },

    leftBarMenuName (state, activeModuleName) {
      state.leftBarMenuName = activeModuleName
    },

    passwordPanelVisible (state, isShow) {
      state.passwordPanelVisible = isShow
    }
  },

  /**
   * 接受对 vuex 的各种操作,可以是异步的
   * 持久化数据的存储和访问应该在这里进行
   * this.$store.dispatch(mutations方法名, 参数...)
   */
  actions: {
    isFoldLeftBar (context, isFold) {
      context.commit('isFoldLeftBar', isFold)
    },

    leftBarMenuName (context, activeModuleName) {
      context.commit('leftBarMenuName', activeModuleName)
    },

    passwordPanelVisible (context, isShow) {
      context.commit('passwordPanelVisible', isShow)
    }
  }
}
