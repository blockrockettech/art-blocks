<template>
  <div>
    <artist-short-bio :artist="lookupArtist()"></artist-short-bio>

    <div class="card-columns">
        <galleryEdition
          v-for="assetEdition, key in lookupAssetsByArtistCode($route.params.artistCode)"
          :edition="assetEdition[0]"
          :key="key">
        </galleryEdition>
    </div>
  </div>
</template>

<script>

  import { mapGetters, mapState } from 'vuex';
  import ArtistShortBio from '../ui-controls/ArtistShortBio';
  import Asset from '../Asset';
  import GalleryEdition from '../GalleryEdition';

  export default {
    name: 'artistPage',
    components: {ArtistShortBio, GalleryEdition},
    computed: {
      ...mapGetters(['lookupAssetsByArtistCode'])
    },
    methods: {
      lookupArtist: function () {
        return this.$store.getters.findArtist(this.$route.params.artistCode);
      }
    }
  };
</script>

<style scoped>
</style>
