<template>
  <div v-if="edition">
    <header id="header">
      <router-link :to="{ name: 'account' }" class="pull-right">
        <img src="/../static/account.svg" style="height:25px"/>
      </router-link>
      <div class="header-branding">
        &nbsp;
        <router-link :to="{ name: 'gallery' }" class="back-arrow" style="float: left">
          <img src="../../../static/back_arrow.svg" style="width: 35px"/>
        </router-link>
      </div>
    </header>

    <h1>{{ edition.otherMeta.artworkName }}</h1>

    <div class="qr-code">
      <edition-qr-code :edition="edition"></edition-qr-code>
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

  export default {
    name: 'confirmPurchase',
    components: {EditionQrCode, GalleryEdition, ConfirmPurchaseButton},
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

<style scoped>
  img {
    width: auto;
  }

  .qr-code {
    width: 50%;
    text-align: center;
  }
</style>
