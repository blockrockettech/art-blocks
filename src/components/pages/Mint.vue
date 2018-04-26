<template>
  <div class="jumbotron jumbotron-fluid">
    <div class="container">
      <h1 class="display-4">Mint dART Tokens</h1>
      <p class="lead">From Ethereum address:
        <clickable-address :eth-address="account"></clickable-address>
      </p>
    </div>
  </div>
</template>

<script>

  import { mapGetters, mapState } from 'vuex';
  import ClickableAddress from '../ui-controls/ClickableAddress';

  export default {
    name: 'mint',
    components: {ClickableAddress},
    computed: {
      ...mapState([
        'account'
      ]),
      ...mapGetters([])
    },
    mounted() {}
  };
</script>

<style scoped>
  img {
    width: auto;
  }
</style>
