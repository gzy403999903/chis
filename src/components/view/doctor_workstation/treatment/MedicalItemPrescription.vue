<template>
  <div>
    <ItemPrescription :mrmMemberId="mrmMemberId" :dwtClinicalHistoryId="dwtClinicalHistoryId"
                      :itemTypeId="itemType.MEDICAL_ITEM" action="medicalItem"/>
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
