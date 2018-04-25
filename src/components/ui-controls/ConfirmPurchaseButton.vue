<template>
    <a v-on:click="confirmPurchase" class="btn btn-primary btn-block text-white" v-if="findNextAssetToPurchase(edition)">Buy Now</a>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';
  import _ from 'lodash';
  import * as actions from '../../store/actions';

  export default {
    name: 'confirmPurchaseButton',
    components: {},
    props: {
      edition: {
        required: true,
        type: Object
      },
    },
    computed: {
      ...mapGetters(['isKnownOrigin', 'findNextAssetToPurchase']),
    },
    data () {
      return {
        confirm_terms: false
      };
    },
    methods: {
      confirmPurchase: function () {
        let nextAssetToPurchase = this.$store.getters.findNextAssetToPurchase(this.edition);

        console.log('confirming purchase', nextAssetToPurchase);

        this.$router.push({
          name: 'completePurchase',
          params: {
            artistCode: nextAssetToPurchase.edition.substring(0, 3),
            edition: nextAssetToPurchase.edition,
            tokenId: nextAssetToPurchase.id
          }
        });
      }
    }
  };
</script>

<style scoped lang="scss">

</style>
