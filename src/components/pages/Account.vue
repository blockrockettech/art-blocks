<template>
  <div>

    <h1>Account ({{assetsPurchasedByAccount.length}})</h1>

    <div class="row mb-4">
      <div class="col">
        <address-icon :eth-address="account"></address-icon>
      </div>
    </div>

    <div class="card-columns" v-if="assetsPurchasedByAccount.length > 0">
      <div class="card" v-for="tokenId, key in assetsPurchasedByAccount" :key="key">
        {{ tokenId }}
      </div>
    </div>

    <div v-if="assetsPurchasedByAccount.length == 0" class="row text-center">
      <div class="col">You don't have any dART tokens...</div>
    </div>
  </div>
</template>

<script>

  import { mapGetters, mapState } from 'vuex';
  import AddressIcon from '../ui-controls/AddressIcon';
  import EthAddress from '../ui-controls/EthAddress';

  export default {
    name: 'account',
    components: {AddressIcon, EthAddress},
    computed: {
      ...mapState([
        'account',
        'accountBalance',
        'assetsPurchasedByAccount',
      ]),
      ...mapGetters([
        'assetById',
      ])
    },
    mounted() {
      if (!this.account) {
        this.$modal.show('no-web3-found');
      }
    }
  };
</script>

<style scoped>
  img {
    width: auto;
  }
</style>
