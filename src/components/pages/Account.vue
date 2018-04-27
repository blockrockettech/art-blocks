<template>
  <div>

    <h1>Account <small><span class="badge badge-pill badge-primary">{{assetsPurchasedByAccount.length}}</span></small></h1>

    <div class="row mb-4">
      <div class="col">
        <clickable-address :eth-address="account"></clickable-address>
      </div>
    </div>

    <div class="card-deck" v-if="assetsPurchasedByAccount.length > 0">
      <div class="card" v-for="tokenId, key in assetsPurchasedByAccount" :key="key">
        <div class="card-body">
          <h5 class="card-title">{{ assetById(tokenId).handle }} <span class="badge badge-primary float-right">{{ assetById(tokenId).tokenId }}</span></h5>
        </div>
        <ul class="list-group list-group-flush">
          <li class="list-group-item"><small><samp>{{ assetById(tokenId).hash }}</samp></small></li>
          <li class="list-group-item"><span class="text-muted">Owner: </span><clickable-address :eth-address="assetById(tokenId).owner"></clickable-address></li>
        </ul>
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
  import ClickableAddress from '../ui-controls/ClickableAddress';

  export default {
    name: 'account',
    components: {AddressIcon, ClickableAddress},
    computed: {
      ...mapState([
        'account',
        'assetsPurchasedByAccount',
      ]),
      ...mapGetters([
        'assetById',
      ])
    },
    mounted() {}
  };
</script>

<style scoped>
  img {
    width: auto;
  }
</style>
