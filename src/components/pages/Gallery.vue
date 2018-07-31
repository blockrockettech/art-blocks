<template>
  <div>
    <div class="row justify-content-center">
      <div class="col-sm-12">
        <h2>TOKN <span class="badge badge-primary">{{assets.length || 0}}</span></h2>
        <h4><pre>{{contractAddress}}</pre></h4>
      </div>
    </div>

    <div class="row mt-2">
      <loading-spinner v-if="!assets || assets.length == 0"></loading-spinner>

      <div class="col-2 mb-4" v-for="tokn, key in limitBy(orderBy(assets, 'blocknumber', -1), 100)" :key="key">
        <div class="card">
          <div class="text-center">
            <address-icon :ethAddress="tokn.blockhash"></address-icon>
          </div>
          <ul class="list-group list-group-flush">
            <li class="list-group-item text-center">
              <span class="badge badge-primary">{{ tokn.tokenId }}</span>
            </li>
            <li class="list-group-item">
              <small><samp>{{ tokn.blockhash }}</samp></small>
            </li>
            <li class="list-group-item">
              <small><samp>block: {{ tokn.blocknumber }}</samp></small>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

  import { mapGetters, mapState } from 'vuex';
  import LoadingSpinner from '../ui-controls/LoadingSpinner.vue';
  import ClickableAddress from '../ui-controls/ClickableAddress';
  import AddressIcon from '../ui-controls/AddressIcon';
  import * as actions from '../../store/actions';
  import CurrentNetwork from '../ui-controls/CurrentNetwork.vue';

  export default {
    name: 'gallery',
    components: {
      CurrentNetwork,
      LoadingSpinner,
      ClickableAddress,
      AddressIcon
    },
    computed: {
      ...mapState([
        'assets',
        'curatorAddress',
        'totalSupply',
        'contractName',
        'contractSymbol',
        'account',
        'contractAddress',
        'hashes'
      ]),
      ...mapGetters([
        'getHashMatch'
      ])
    }
  };
</script>

<style scoped lang="scss">
</style>
