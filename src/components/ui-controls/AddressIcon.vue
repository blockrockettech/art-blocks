<template>
  <span v-if="ethAddress">
    <img :src="'data:image/svg+xml;base64,' + createIcon"/>
  </span>
</template>

<script>
  /* global web3:true */
  import Identicon from 'identicon.js';
  import EthAddress from './EthAddress';

  export default {
    name: 'addressIcon',
    components: {EthAddress},
    props: {
      ethAddress: {
        type: String
      }
    },
    computed: {
      createIcon: function () {
        return new Identicon(this.ethAddress, {background: [255, 255, 255, 255], format: 'svg'}).toString();
      }
    }
  };
</script>

<style>
  img {
    width: 50%;
  }
</style>
