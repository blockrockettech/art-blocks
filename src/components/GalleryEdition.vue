<template>
  <div class="card" v-if="edition">

    <img class="card-img-top" :src="edition.lowResImg"/>

    <ul class="list-group list-group-flush">
      <li class="list-group-item bg-danger text-center text-white" v-if="availableAssetsForEdition(edition.edition).length == 0">
        SOLD
      </li>
    </ul>

    <div class="card-body">

      <p class="card-text">
        <span class="badge badge-light">
          <span v-if="assetsForEdition(edition.edition).length == 1">Ultra rare</span>
          <span v-if="assetsForEdition(edition.edition).length > 1 && assetsForEdition(edition.edition).length <= 5">Rare</span>
          <span v-if="assetsForEdition(edition.edition).length > 5">Common</span>
        </span>
        <span class="badge badge-light">1 of {{ assetsForEdition(edition.edition).length }}</span>
        <span class="badge badge-light" v-if="availableAssetsForEdition(edition.edition).length > 0">{{ availableAssetsForEdition(edition.edition).length }} available</span>
        <span class="float-right">
          <tweet-asset-button :edition="edition" v-if="purchase"></tweet-asset-button>
        </span>
      </p>

      <edition-name-by-artist :edition="edition" :purchase="purchase"></edition-name-by-artist>

      <p class="card-text" v-if="purchase">{{ edition.description }}</p>
    </div>

    <ul class="list-group list-group-flush">
      <li class="list-group-item text-center no-bottom-border"><price-in-eth :value="edition.priceInEther"></price-in-eth></li>
    </ul>

    <div class="card-footer text-center" v-if="!purchase">
      <router-link class="btn btn-outline-primary btn-block" tag="button" :to="{ name: 'confirmPurchase', params: { artistCode: edition.edition.substring(0, 3), edition: edition.edition }}">
        View details
      </router-link>
    </div>

    <div class="card-footer text-center" v-if="purchase && availableAssetsForEdition(edition.edition).length > 0">
      <confirm-purchase-button :edition="edition"></confirm-purchase-button>
    </div>

  </div>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';
  import _ from 'lodash';
  import PriceInEth from './ui-controls/PriceInEth.vue';
  import EditionNameByArtist from './ui-controls/EditionNameByArtist.vue';
  import ConfirmPurchaseButton from './ui-controls/ConfirmPurchaseButton';
  import TweetAssetButton from "./ui-controls/TweetAssetButton.vue";

  export default {
    name: 'galleryEdition',
    components: {
      TweetAssetButton,
      PriceInEth,
      EditionNameByArtist,
      ConfirmPurchaseButton
    },
    props: {
      edition: {
        required: true,
        type: Object
      },
      purchase: {
        type: Boolean
      }
    },
    computed: {
      ...mapGetters([
        'availableAssetsForEdition',
        'assetsForEdition',
      ]),
    },
    methods: {
    }
  };
</script>

<style scoped lang="scss">
  li.no-bottom-border {
    border-bottom: 0 none;
  }
</style>
