<template>
  <span>
    <h5 class="card-title">{{ edition.otherMeta.artworkName }}</h5>
    <h6 class="card-subtitle mb-2 text-muted">By {{ edition.otherMeta.artist }}</h6>
  </span>
</template>

<script>
  export default {
    name: 'editionNameByArtist',
    props: ['edition', 'purchase'],
  };
</script>

<style scoped>
</style>
