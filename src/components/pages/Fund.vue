<template>
  <div class="row justify-content-center">
    <div class="col-sm-8">
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
            A maximum number of blocks which can be purchased in one go <strong>{{maxBlockPurchaseInOneGo}}</strong>
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
  </div>
</template>

<script>

  import {mapGetters, mapState} from 'vuex';
  import ClickableAddress from '../ui-controls/ClickableAddress';
  import * as actions from '../../store/actions';
  import CurrentNetwork from "../ui-controls/CurrentNetwork.vue";

  export default {
    name: 'mint',
    components: {
      CurrentNetwork,
      ClickableAddress},
    computed: {
      ...mapState([
        'account',
        'pricePerBlockInEth',
        'maxBlockPurchaseInOneGo',
        'nextBlockToFund',
        'contractAddress'
      ]),
      ...mapGetters([])
    },
    data() {
      return {
      };
    },
    methods: {

    },
    mounted() {
    }
  };
</script>

<style scoped>
  img {
    width: auto;
  }
</style>
