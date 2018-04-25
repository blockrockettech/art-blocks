<template>
  <strong>Price {{ value }} ETH</strong>
</template>

<script>
  export default {
    name: 'priceInEth',
    props: {
      value: {
        type: String
      }
    }
  };
</script>

<style scoped>
</style>
