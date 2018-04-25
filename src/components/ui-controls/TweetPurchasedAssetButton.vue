<template>
  <div v-if="assetId">
    <a class="twitter-share-button"
       target="_blank"
       :href="purchaseText">
      Tweet
    </a>
  </div>
</template>

<script>
  export default {
    name: 'tweetPurchasedAssetButton',
    props: ['assetId'],
    computed: {
      purchaseText: function () {
        let url = `${window.location.origin}/assets/${this.assetId}`;
        let text = `Check out my latest KnownOrigin digital asset purchase`;
        let hashtags = 'KnownOrigin,DApp,ethereum,nft,erc721';
        let via = "knownorigin_io";
        return `https://twitter.com/intent/tweet?text=${text}&url=${url}&hashtags=${hashtags}&via=${via}`;
      }
    },
    mounted: function () {
      this.$nextTick(function () {
        twttr.widgets.load();
      });
    }
  };
</script>

<style scoped>

</style>
