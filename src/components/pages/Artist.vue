<template>
  <div>
    <div class="row mt-5">

      <div class="col-6">
        <div class="card text-center">
          <div class="card-header">
            Simple Artist Contract
          </div>
          <div class="card-body">
            <p>
              Contract: <code>{{simpleArtistContractAddress}}</code>
            </p>
            <p>
              Owner: <code>{{simpleArtistContractOwner}}</code>
            </p>
            <!--<p>-->
              <!--Balance: <code>{{simpleArtistContractBalance}}</code>-->
            <!--</p>-->
            <p>
              Call <code>purchase(_tokenId)</code> or send ETH direct to contract address
            </p>
            <div class="row">
              <div class="col">
                Rate: <code>{{pricePerBlockInEth}}</code> per block.
              </div>
              <div class="col">
                Max blocks: <code>{{maxBlockPurchaseInOneGo}}</code> per purchase
              </div>
            </div>
            <div class="row mt-2">
              <div class="col">
                Current: <code>#{{ blocknumber }}</code>
              </div>
              <div class="col">
                Next available: <code>#{{nextBlockToFund}}</code>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-6">
        <loading-spinner v-if="!assets || assets.length == 0"></loading-spinner>

        <div class="card-columns">
          <div class="card" v-for="dART, key in assets" :key="key">
            <div class="card-body">
              <p class="card-title">
                {{ dART.nickname }}
              </p>
              <p>
                <span class="badge badge-primary float-right">
                {{ dART.tokenId}}
                </span>
              </p>
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

    <div class="row mt-2">
      <div class="col">
        <div v-for="obj, key in hashes" :key="key" class="alert alert-light" role="alert">
          <span class="badge">#{{ key }}</span>
          <clickable-blockhash :ethAddress="obj.hash" :blocknumber="key"></clickable-blockhash>
          <span class="badge badge-primary float-right" v-if="getHashMatch(obj.hash)">
            {{ getHashMatch(obj.hash).nickname }}
          </span>
          <span class="badge badge-light float-right" v-if="getHashMatch(obj.hash)">
            {{ getHashMatch(obj.hash).tokenId }}
          </span>
          <span class="badge badge-warning float-right" v-if="!getHashMatch(obj.hash)">
            Blockchain
          </span>
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
        'hashes',
        'simpleArtistContractOwner',
        'simpleArtistContractAddress',
        'simpleArtistContractBalance'
      ]),
      ...mapGetters([
        'getHashMatch'
      ])
    }
  };
</script>

<style scoped lang="scss">
</style>
