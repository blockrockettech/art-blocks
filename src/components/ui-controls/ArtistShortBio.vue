<template>
  <h1 v-if="artist">{{ artist.name }}</h1>
</template>

<script>
  export default {
    name: 'artistShortBio',
    props: ['artist'],
  };
</script>

<style scoped>
</style>
