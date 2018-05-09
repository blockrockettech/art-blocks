<template>
  <div>
    <div class="row mt-5">
      <div class="col">
        <div v-for="obj, key in hashes" :key="key" class="alert alert-light" role="alert">
          <span class="badge">#{{ key }}</span>
          <clickable-blockhash :ethAddress="obj.hash" :blocknumber="key"></clickable-blockhash>
          <span class="badge badge-primary float-right" v-if="getHashMatch(obj.hash)">{{ getHashMatch(obj.hash) }}</span>
          <span class="badge badge-warning float-right" v-if="!getHashMatch(obj.hash)">Blockchain</span>
        </div>
      </div>
      <div class="col">
        <div class="card text-center">
          <div class="card-header">
            Funding dART Tokens
          </div>
          <div class="card-body">
            <p>
              Call <span class="text-info">fundDart(_tokenId)</span> at the address: <code>{{contractAddress}}</code>
            </p>
            <div class="row">
              <div class="col">
                Rate: <strong>{{pricePerBlockInEth}}</strong> per block.
              </div>
              <div class="col">
                Max blocks: <strong>{{maxBlockPurchaseInOneGo}}</strong> per purchase
              </div>
            </div>
            <div class="row mt-2">
              <div class="col">
                Current blocknumber is: <strong>{{ blocknumber }}</strong>
              </div>
              <div class="col">
                Next available blocknumber is: <strong>{{nextBlockToFund}}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row mt-5">

      <div class="col">
        <loading-spinner v-if="!assets || assets.length == 0"></loading-spinner>

        <div class="card-columns">
          <div class="card" v-for="dART, key in assets" :key="key">
            <div class="text-center">
              <address-icon :ethAddress="dART.blockhash"></address-icon>
            </div>
            <div class="card-body">
              <h5 class="card-title">{{ dART.nickname }} <span class="badge badge-primary float-right">{{ dART.tokenId
                }}</span></h5>
            </div>
            <ul class="list-group list-group-flush">
              <li class="list-group-item">
                <small><samp>{{ dART.blockhash }}</samp></small>
              </li>
              <li class="list-group-item"><span class="text-muted">Owner: </span>
                <clickable-address :eth-address="dART.owner"></clickable-address>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>

  import { mapGetters, mapState } from 'vuex';
  import LoadingSpinner from '../ui-controls/LoadingSpinner.vue';
  import ClickableAddress from '../ui-controls/ClickableAddress';
  import ClickableBlockhash from '../ui-controls/ClickableBlockhash';
  import AddressIcon from '../ui-controls/AddressIcon';
  import * as actions from '../../store/actions';
  import CurrentNetwork from "../ui-controls/CurrentNetwork.vue";

  export default {
    name: 'gallery',
    components: {
      CurrentNetwork,
      LoadingSpinner,
      ClickableAddress,
      ClickableBlockhash,
      AddressIcon
    },
    computed: {
      ...mapState([
        'assets',
        'account',
        'blocknumber',
        'pricePerBlockInEth',
        'maxBlockPurchaseInOneGo',
        'nextBlockToFund',
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
