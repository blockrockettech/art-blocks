<template>
  <div>
    <h1>&nbsp;</h1>

    <div class="row mt-5">
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

      <div class="col-5">
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
            <td><span class="badge badge-primary">{{ totalSupply }}</span></td>
          </tr>
          </tbody>
        </table>
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
