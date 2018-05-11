<template>
  <span v-if="ethAddress">
    <a :href="buildLink" target="_blank">{{ dotDotDot }}</a>
  </span>
</template>

<script>
  /* global web3:true */
  import { mapGetters, mapState } from 'vuex';

  export default {
    name: 'clickableBlockhash',
    components: {},
    props: {
      ethAddress: {
        type: String
      },
      blocknumber: {
        type: String
      }
    },
    computed: {
      ...mapState([
        'etherscanBase',
      ]),
      dotDotDot: function () {
        if (this.ethAddress) {
          return this.ethAddress.substr(0, 12) + '...' + this.ethAddress.substr(this.ethAddress.length - 12, this.ethAddress.length);
        }
        return '';
      },
      buildLink: function () {
        return `${this.etherscanBase}/block/${this.blocknumber}`;
      }
    }
  };
</script>

<style>

</style>
