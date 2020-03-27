<template>
  <div>
    <ItemPrescription :mrmMemberId="mrmMemberId" :dwtClinicalHistoryId="dwtClinicalHistoryId"
                      :itemTypeId="itemType.ADJUVANT_ITEM" action="adjuvantItem"
                      :loadCountPrescription="loadCountPrescription"/>
  </div>
</template>

<script>
import ItemPrescription from './ItemPrescription'

export default {
  props: {
    mrmMemberId: {
      type: Number,
      required: true
    },
    dwtClinicalHistoryId: {
      type: Number,
      required: true
    },
    loadCountPrescription: {
      type: Function,
      required: true
    }
  },

  components: {
    ItemPrescription
  },

  data () {
    return {
      itemType: this.$store.getters.itemType
    }
  }
}
</script>

<style scoped>
</style>
