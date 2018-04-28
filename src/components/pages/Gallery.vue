<template>
  <div>
    <h1>&nbsp;</h1>

    <div class="alert alert-primary" role="alert" v-if="hash">
      #{{ blockNumber }} &gt;&gt; {{ hash }} - {{ getHashMatch() }}
    </div>

    <div class="row mt-5">
      <div class="col">
        <table class="table table-striped">
          <tbody>
          <tr v-if="contractAddress">
            <td>Contract</td>
            <td>
              <clickable-address :eth-address="contractAddress"></clickable-address>
            </td>
          </tr>
          <tr v-if="contractName">
            <td>Name</td>
            <td>
              {{ contractName }}
            </td>
          </tr>
          <tr v-if="contractSymbol">
            <td>Symbol</td>
            <td>{{ contractSymbol }}</td>
          </tr>
          <tr v-if="curatorAddress">
            <td>Curator</td>
            <td>
              <clickable-address :eth-address="curatorAddress"></clickable-address>
            </td>
          </tr>
          <tr v-if="totalSupply">
            <td>Supply:</td>
            <td>{{ totalSupply }}</td>
          </tr>
          </tbody>
        </table>

        <div class="card text-center">
          <div class="card-header">
            Funding dART Tokens
          </div>
          <div class="card-body">
            <p>
              Fund your dArt token is easy as pie!
            </p>
            <p>
              Simply call the function <strong><span class="text-info">fundDart(_tokenId)</span></strong> at the address: <strong>{{contractAddress}}</strong>
            </p>
            <p>
              Current exchange rate is <strong>{{pricePerBlockInEth}}</strong> per block.
            </p>
            <p>
              The maximum number of blocks which can be purchased in one go <strong>{{maxBlockPurchaseInOneGo}}</strong>
            </p>
            <p>
              The next block which you will see your Dart token is <strong>{{nextBlockToFund}}</strong>
            </p>
          </div>
          <div class="card-footer">
            <current-network></current-network>
          </div>
        </div>

      </div>
      <div class="col">
        <loading-spinner v-if="!assets"></loading-spinner>


        <div class="card-deck">
          <div class="card" v-for="dART, key in assets" :key="key">
            <div class="text-center">
              <address-icon :ethAddress="dART.blockhash"></address-icon>
            </div>
            <div class="card-body">
              <h5 class="card-title">{{ dART.nickname }} <span class="badge badge-primary float-right">{{ dART.tokenId }}</span></h5>
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
  import AddressIcon from '../ui-controls/AddressIcon';
  import * as actions from '../../store/actions';
  import CurrentNetwork from "../ui-controls/CurrentNetwork.vue";

  export default {
    name: 'gallery',
    components: {
      CurrentNetwork,
      LoadingSpinner,
      ClickableAddress,
      AddressIcon
    },
    data() {},
    methods: {},
    computed: {
      ...mapState([
        'assets',
        'curatorAddress',
        'totalSupply',
        'contractName',
        'contractSymbol',
        'contractAddress',
        'hash',
        'blockNumber',
        'account',
        'pricePerBlockInEth',
        'maxBlockPurchaseInOneGo',
        'nextBlockToFund',
        'contractAddress'
      ]),
      ...mapGetters([
        'getHashMatch'
      ])
    },
    mounted() {

    }
  };
</script>

<style scoped lang="scss">
</style>
