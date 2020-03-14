import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import App from './App' // 如果 APP 中有全局样式 需要在 ElementUI 之后引入
import router from './router'
import {LoadingBar} from 'iview'
import 'iview/dist/styles/iview.css'
import axios from 'axios'
import store from './vuex'
import './assets/qn_icons/iconfont.css' // 引入千牛图标

Vue.use(ElementUI)
Vue.use(LoadingBar)
Vue.prototype.$http = axios
Vue.config.productionTip = false

/**
 * 使用 axios 拦截器为所有发送的请求添加 Authorization 请求头
 */
axios.interceptors.request.use(config => {
  const token = store.getters.token
  // 2020-01-30 临时添加 用于请求 肺炎疫情实时数据时不在请求头添加 token
  if (config.url.indexOf('https://file1.dxycdn.com') !== 0) {
    if (token) {
      config.headers.Authorization = token
    }
  }

  /*
  if (token) {
    config.headers.Authorization = token
  }
  */
  return config
}, error => {
  return Promise.reject(error)
})

/**
 * 使用 axios 拦截器检查返回状态码
 * 如果状态码为 401则路由转发到 login
 * 清除 token
 */
axios.interceptors.response.use(res => {
  if (res.data.code === 401) {
    // Vue.prototype.$message.error('Axios:您的凭证已过期,请重新登录')
    // 必须先执行清除 路由卫士在跳转页面前会检查 token 状态
    store.dispatch('removeToken')
    router.replace({
      path: '/login'
      // query: { redirect: router.currentRoute.fullPath } // 将要跳转的路由 path 作为参数跳转到 login, 登录成功后则跳转到参数页面
    })
  }
  return res
}, error => {
  let status = error.response.status
  let statusText = error.response.statusText
  Vue.prototype.$message.error(status + ':' + statusText)
  return Promise.reject(error.response.data)
})

/**
 * 全局路由卫士
 */
router.beforeEach((to, from, next) => {
  LoadingBar.start()
  // 如果左侧菜单栏选项为空, 且请求路径不是首页, 则根据当前路径激活对应菜单
  let leftBarMenuName = store.getters.leftBarMenuName
  if (leftBarMenuName === '' && to.path !== '/main/home') {
    store.dispatch('leftBarMenuName', to.path.split('/')[2])
  }
  // 判断是否登陆
  let token = store.getters.token
  if (to.path === '/login' && token) {
    next('/main/home')
  } else if (to.path === '/login') {
    next()
  } else if (!token) {
    next('/login')
  } else {
    next()
  }
  LoadingBar.finish()
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { App },
  template: '<App/>',
  router,
  store
})
