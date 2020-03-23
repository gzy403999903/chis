import Vue from 'vue'
import Vuex from 'vuex'

import frame from './modules/frame'
import itemDict from './modules/itemDict'
import goodsDict from './modules/goodsDict'
import memberDict from './modules/memberDict'
import financeDict from './modules/financeDict'
import definedEnum from './modules/definedEnum'
import otherDict from './modules/otherDict'
import clinicData from './modules/clinicData'
import sysConfig from './modules/sysConfig'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    frame,
    itemDict,
    goodsDict,
    memberDict,
    financeDict,
    definedEnum,
    otherDict,
    clinicData,
    sysConfig
  }
})
