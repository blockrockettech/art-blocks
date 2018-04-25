<template>
  <div v-if="assetId">
    <p>
      Please verify your purchase, this means that once we have finished building the platform, you can download the high res asset.
    </p>
    <button type="button" class="btn btn-sm btn-action" @click="verifyPurchase">
      Verify
    </button>
  </div>
</template>

<script>
  /* global web3:true */
  import * as actions from '../../store/actions';

  export default {
    name: 'verifyPurchase',
    props: ['assetId'],
    methods: {
      verifyPurchase: function () {
        this.$store.dispatch(actions.VERIFY_PURCHASE, this.assetId);
      }
    }
  };
</script>

<style>
</style>
