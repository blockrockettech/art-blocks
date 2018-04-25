<template>
  <div>
    <h1>Smart contract</h1>

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
      <tr v-if="contractDeveloperAddress">
        <td>Developer:</td>
        <td>
          <clickable-address :eth-address="contractDeveloperAddress"></clickable-address>
        </td>
      </tr>
      <tr v-if="totalSupply">
        <td>Supply:</td>
        <td>{{ totalSupply }}</td>
      </tr>
      <tr v-if="totalNumberOfPurchases">
        <td>Sales</td>
        <td>{{ totalNumberOfPurchases }}</td>
      </tr>
      <tr v-if="totalPurchaseValueInEther">
        <td>Total</td>
        <td>{{ totalPurchaseValueInEther }} ETH</td>
      </tr>
      </tbody>
    </table>

  </div>
</template>

<script>

  import { mapGetters, mapState } from 'vuex';
  import AddressIcon from '../ui-controls/AddressIcon';
  import ClickableAddress from '../ui-controls/ClickableAddress';

  export default {
    name: 'details',
    components: {AddressIcon, ClickableAddress},
    computed: {
      ...mapState([
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
      ])
    }
  };
</script>

<style scoped>
</style>
