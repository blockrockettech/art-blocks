<template>
  <span v-if="edition">
    <a class="twitter-share-button"
       target="_blank"
       :href="purchaseText">
      Tweet
    </a>
  </span>
</template>

<script>
  export default {
    name: 'tweetAssetButton',
    props: ['edition'],
    computed: {
      purchaseText: function () {
        let artistCode = this.edition.edition.substring(0, 3);
        let editionCode = this.edition.edition;
        let url = `${window.location.origin}/artists/${artistCode}/editions/${editionCode}`;
        let text = `Check out this awesome KnownOrigin digital asset`;
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
