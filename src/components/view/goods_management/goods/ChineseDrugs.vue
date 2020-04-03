<template>
  <Goods title="中药" :goodsType="goodsType.CHINESE_DRUGS" action="chineseDrugs"/>
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
