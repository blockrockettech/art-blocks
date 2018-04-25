<template>
  <div>
    <h1>aART Gallery</h1>

    <!--<loading-spinner v-if="!hasFinishedLoading()"></loading-spinner>-->

    <h2>Hello!</h2>
  </div>
</template>

<script>

  import {mapGetters, mapState} from 'vuex';
  import LoadingSpinner from "../ui-controls/LoadingSpinner.vue";

  export default {
    name: 'gallery',
    components: {
      LoadingSpinner
    },
    data() {
      return {
        showSold: false,
        finishedLoading: false,
        priceFilter: 'asc',
        search: ''
      };
    },
    methods: {
      hasFinishedLoading: function () {
        // Use the lack of assets in the store to determine initial loading state
        if (this.assets.length === 0) {
          return false;
        }
        return this.editions.length > 0 || this.finishedLoading === true;
      },
    },
    computed: {
      ...mapState([
        'editionSummary',
        'assets',
      ]),
      editions: function () {
        this.finishedLoading = false;

        let results = this.$store.getters.editionSummaryFilter(this.showSold, this.priceFilter)
          .filter(function (item) {

            if (this.search.length === 0) {
              return true;
            }

            let matchesName = item.artworkName.toLowerCase().indexOf(this.search.toLowerCase()) >= 0;
            let matchesDescription = item.description.toLowerCase().indexOf(this.search.toLowerCase()) >= 0;
            let matchesArtist = item.otherMeta.artist.toLowerCase().indexOf(this.search.toLowerCase()) >= 0;

            return matchesName || matchesDescription || matchesArtist;
          }.bind(this));
        this.finishedLoading = true;
        return results;
      }
    }
  };
</script>

<style scoped lang="scss">
</style>
