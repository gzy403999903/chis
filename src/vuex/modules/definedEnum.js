import moment from 'moment'

export default {
  state: {
    // 审批状态
    approveState: {
      UNAPPROVED: 0, // 驳回
      APPROVED: 1, // 通过
      CANCEL: 2, // 撤销
      PURCHASING: 97, // 待采购
      PRICING: 98, // 待定价
      PENDING: 99 // 待审核
    },

    // 项目类型
    itemType: {
      MEDICAL_ITEM: 101,
      ADJUVANT_ITEM: 102,
      OTHER_ITEM: 103
    },

    // 商品类型
    goodsType: {
      WESTERN_DRUGS: 101, // 西药
      CHINESE_DRUGS: 102, // 中药
      HYGIENIC_MATERIAL: 103 // 卫生材料
    },

    // 挂号状态
    waitState: {
      WAITING: 0, // 候诊中
      DIAGNOSING: 1, // 就诊中
      DIAGNOSED: 2 // 已就诊
    },

    // 诊断类型
    diagnoseType: {
      WESTERN_DIAGNOSE: 1, // 西医诊断
      CHINESE_DIAGNOSE: 2 // 中医诊断
    },

    // 销售类型
    sellType: {
      GOODS: 1, // 商品
      ITEM: 2 // 收费项目
    },

    // 销售方式
    sellWay: {
      PRESCRIPTION: 1, // 处方
      POS: 2 // POS
    },

    // 库房类型ID
    inventoryType: {
      WESTERN_DRUGS_INVENTORY: 1, // 药品库
      CHINESE_DRUGS_INVENTORY: 2, // 药材库
      HYGIENIC_MATERIAL_INVENTORY: 3, // 物资库
      SUBTRACT_INVENTORY: 4 // 退货库
    },

    // 总部ID  headquarters ID
    HQID: 1,

    // 数字类型SQL查询逻辑运算符
    numLogicalList: [
      {label: '等于', value: '='},
      {label: '不等于', value: '!='},
      {label: '大于', value: '>'},
      {label: '大于等于', value: '>='},
      {label: '小于', value: '<'},
      {label: '小于等于', value: '<='}
    ],

    // 查询日期跨度
    queryDate: [moment().subtract(1, 'months').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')]
  },

  /**
   * 获取 state 中属性的值
   * this.$store.getters.方法名
   */
  getters: {
    approveState: (state) => {
      return state.approveState
    },

    itemType: (state) => {
      return state.itemType
    },

    goodsType: (state) => {
      return state.goodsType
    },

    waitState: (state) => {
      return state.waitState
    },

    diagnoseType: (state) => {
      return state.diagnoseType
    },

    sellType: (state) => {
      return state.sellType
    },

    sellWay: (state) => {
      return state.sellWay
    },

    inventoryType: (state) => {
      return state.inventoryType
    },

    HQID: (state) => {
      return state.HQID
    },

    numLogicalList: (state) => {
      return state.numLogicalList
    },

    queryDate: (state) => {
      return state.queryDate
    }
  },

  /**
   * 修改 state 中属性的值
   * 不能在这里进行异步操作
   * this.$store.commit(方法名, 参数...)
   */
  mutations: {
  },

  /**
   * 接受对 vuex 的各种操作,可以是异步的
   * 持久化数据的存储和访问应该在这里进行
   * this.$store.dispatch(mutations方法名, 参数...)
   */
  actions: {
  }
}
