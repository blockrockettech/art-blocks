<template>
  <div>
    <h1>dART Gallery</h1>

    <div class="row mt-5">
      <div class="col">
        <table class="table table-striped">
          <tbody>
          <tr v-if="contractSymbol">
            <td>Contract</td>
            <td><clickable-address :eth-address="contractAddress"></clickable-address></td>
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
      </div>
      <div class="col">
        <loading-spinner v-if="!assets"></loading-spinner>
      </div>
    </div>
  </div>
</template>

<script>

  import {mapGetters, mapState} from 'vuex';
  import LoadingSpinner from '../ui-controls/LoadingSpinner.vue';
  import ClickableAddress from '../ui-controls/ClickableAddress';

  export default {
    name: 'gallery',
    components: {
      LoadingSpinner,
      ClickableAddress
    },
    data() {},
    methods: {},
    computed: {
      ...mapState([
        'assets',
        'curatorAddress',
        'contractDeveloperAddress',
        'commissionAddress',
        'totalSupply',
        'totalPurchaseValueInWei',
        'totalNumberOfPurchases',
        'totalPurchaseValueInEther',
        'contractName',
        'contractSymbol',
        'contractAddress'
      ]),
    }
  };
</script>

<style scoped lang="scss">
</style>
