<template>
  <Goods title="卫生材料" :goodsType="goodsType.HYGIENIC_MATERIAL" action="hygienicMaterial"/>
</template>

<script>
import Goods from './Goods'

export default {
  components: {
    Goods
  },

  data () {
    return {
      goodsType: this.$store.getters.goodsType
    }
  }
}
</script>

<style scoped>
</style>
