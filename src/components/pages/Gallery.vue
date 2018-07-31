<template>
  <div>
    <h1>&nbsp;</h1>

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
            <td>Supply</td>
            <td>{{ totalSupply }}</td>
          </tr>
          </tbody>
        </table>
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
              <h5 class="card-title"><span class="badge badge-primary float-right">{{ dART.tokenId }}</span></h5>
            </div>
            <ul class="list-group list-group-flush">
              <li class="list-group-item">
                <small><samp>{{ dART.blockhash }}</samp></small>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>

  import {mapGetters, mapState} from 'vuex';
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
