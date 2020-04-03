<template>
  <Goods title="西药 / 中成药" :goodsType="goodsType.WESTERN_DRUGS" action="westernDrugs"/>
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
