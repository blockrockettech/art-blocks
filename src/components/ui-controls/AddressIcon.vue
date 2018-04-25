<template>
  <span v-if="ethAddress">
    <!--<img :class="'icon-' + size" :src="'data:image/png;base64,' + createIcon"/>-->
    <eth-address :value="ethAddress"></eth-address>
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
      },
      size: {
        type: String,
        default: 'normal'
      }
    },
    computed: {
      createIcon: function () {
        return new Identicon(this.ethAddress, 420).toString();
      }
    }
  };
</script>

<style>
  .icon-normal {
    height: 64px;
    width: 64px;
  }

  .icon-small {
    height: 32px;
    width: 32px;
  }
</style>
