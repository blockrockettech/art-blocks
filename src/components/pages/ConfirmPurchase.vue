<template>
  <div>
    <loading-spinner v-if="!edition"></loading-spinner>

    <div v-else-if="edition" class="row justify-content-sm-center">
      <div class="col col-sm-6">
        <gallery-edition :edition="edition" :purchase="true"></gallery-edition>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';
  import Artist from '../Artist';
  import GalleryEdition from '../GalleryEdition';
  import ConfirmPurchaseButton from '../ui-controls/ConfirmPurchaseButton';
  import _ from 'lodash';
  import EditionQrCode from '../ui-controls/EditionQrCode';
  import LoadingSpinner from "../ui-controls/LoadingSpinner.vue";

  export default {
    name: 'confirmPurchase',
    components: {
      LoadingSpinner,
      EditionQrCode,
      GalleryEdition,
      ConfirmPurchaseButton
    },
    computed: {
      ...mapGetters([
        'firstAssetForEdition'
      ]),
      edition: function () {
        return this.firstAssetForEdition(this.$route.params.edition);
      },
      title: function () {
        return `${this.edition.editionName} #${this.edition.edition}`;
      },
    },
    methods: {
      countPurchased: (assets) => {
        return _.filter(assets, (val) => {
          return val.purchased === 1 || val.purchased === 2;
        });
      },
      countAvailable: (assets) => {
        return _.filter(assets, {'purchased': 0});
      },
    }
  };
</script>

<style scoped lang="scss">
</style>
