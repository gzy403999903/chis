# frame        ---------------- 前端框架组件配置选项
# itemDict     ---------------- 收费项目字典数据
# goodsDict    ---------------- 商品字典数据
# memberDict   ---------------- 会员字典数据
# financeDict  ---------------- 财务字典数据
# definedEnum  ---------------- 定义的枚举数据
# globalData   ---------------- 全局公共数据
# clinicData   ---------------- 仅限于机构的数据

########################################################################################################################
frame definedEnum 在页面中直接可使用 getter 获取
例子:
data () {
  return {
    approveState: this.$this.$store.getters.approveState
  }
}

########################################################################################################################
itemDict goodsDict memberDict financeDict globalData 在页面中需使用 计算属性 获取
例子:
computed: {
  originList: function () {
    return this.$store.getters.originList
  }
}
在页面初始化后会通过 getter 获取对应属性, 如果该属性不存在则会调用自身的 dispatch 进行查询,
获取到结果后计算属性会自动获取数据到页面, 如果不使用计算属性则无法获取到数据

########################################################################################################################
clinicData 在页面中使用计算属性 获取, 但在获取之前需要调用该属性的 dispatch 进行查询
例子:
computed: {
  clinicShelfPositionList: function () {
    return this.$store.getters.clinicShelfPositionList
  }
}, // end computed

mounted () {
  this.$store.dispatch('queryClinicShelfPositionList')
}, // end mounted


