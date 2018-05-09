<template>
  <div class="m-4">
    Network: {{ currentNetwork }}
  </div>
</template>

<script>
  /* global web3:true */

  import Web3 from 'web3';
  import {mapState} from 'vuex';

  export default {
    name: 'currentNetwork',
    computed: {
      ...mapState(['currentNetwork']),
    },
  };
</script>

<style scoped>

</style>
