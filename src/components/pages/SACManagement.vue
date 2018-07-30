<template>
  <div>
    <h4>Simple Artist Contract Management
      <small>{{$route.params.sacAddress}}</small>
    </h4>

    <div v-if="contractError">
      ERROR!
    </div>
    <div v-else class="row justify-content-center">

      <div class="col-sm-12">
        <h5>Manage your token!</h5>

        <div v-if="sacDetails[$route.params.sacAddress]">
          <ul class="list-group list-group-flush">
            <li class="list-group-item">
              Price per block: {{sacDetails[$route.params.sacAddress].pricePerBlockInWei | toEth}} ETH
            </li>
            <li class="list-group-item">
              Max blocks in one go: {{sacDetails[$route.params.sacAddress].maxBlockPurchaseInOneGo}}
            </li>
            <li class="list-group-item">
              Only show purchased: {{sacDetails[$route.params.sacAddress].onlyShowPurchased}}
            </li>
            <li class="list-group-item">
              Foundation: {{sacDetails[$route.params.sacAddress].foundationAddress}} - at - ({{sacDetails[$route.params.sacAddress].foundationPercentage}}%)
            </li>
          </ul>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
  /* global web3:true */
  import * as actions from '../../store/actions';
  import Web3 from 'web3';
  import {mapGetters, mapState} from 'vuex';

  export default {
    name: 'SACManagement',
    components: {},
    data() {
      return {
        contractError: false
      };
    },
    computed: {
      ...mapState(['sacDetails']),
      ...mapGetters(['getSacDetails'])
    },
    mounted: function () {
      this.$nextTick(function () {
        if (!this.$route.params.sacAddress || !Web3.utils.isAddress(this.$route.params.sacAddress)) {
          this.contractError = true;
          return;
        }
        this.$store.dispatch(actions.GET_SAC_DETAILS, this.$route.params.sacAddress);
      });
    }
  };
</script>

<style>
</style>
