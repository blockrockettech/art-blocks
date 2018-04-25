<template>
  <div>
    <h1>Gallery</h1>

    <loading-spinner v-if="!hasFinishedLoading()"></loading-spinner>

    <div class="form-row mb-4" v-if="hasFinishedLoading()">
      <div class="col">
        <select class="form-control" title="price filter" v-model="priceFilter">
          <option value="asc">Low to high</option>
          <option value="desc">High to low</option>
        </select>
      </div>
      <div class="col">
        <input type="text" class="form-control" v-model="search" placeholder="Search assets..."/>
      </div>
    </div>

    <div class="card-columns" v-if="editions.length > 0">
      <galleryEdition
        v-for="edition in editions"
        :edition="edition"
        :key="edition.edition">
      </galleryEdition>
    </div>


    <div class="form-row mb-4" v-if="hasFinishedLoading()">
      <div class="col">
        <toggle-button :value="showSold"
                       :labels="{checked: 'Sold', unchecked: 'Unsold'}"
                       :sync="true" color="#82C7EB" :width="65"
                       @change="onSoldToggleChanged">
        </toggle-button>
      </div>
    </div>
  </div>
</template>

<script>

  import {mapGetters, mapState} from 'vuex';
  import GalleryEdition from '../GalleryEdition';
  import LoadingSpinner from "../ui-controls/LoadingSpinner.vue";

  export default {
    name: 'gallery',
    components: {
      LoadingSpinner,
      GalleryEdition
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
      onSoldToggleChanged: function ({value}) {
        this.showSold = value;
      },
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
