<template>
  <div>
    <h4>Simple Artist Contract Management
      <small>{{$route.params.sacAddress}}</small>
    </h4>

    <div v-if="contractError">
      <span class="text-danger">Error - SAC address not found or valid</span>
    </div>

    <div v-else class="row justify-content-center">

      <div class="col-sm-12">
        <div v-if="sacDetails[$route.params.sacAddress]">

          <ul class="list-group list-group-flush">
            <li class="list-group-item">
              <div v-show="!edits['pricePerBlockInWei']">
                Price per block: {{sacDetails[$route.params.sacAddress].pricePerBlockInWei | toEth}} ETH
                <span class="text-muted text-sm float-right"
                      style="cursor: pointer;"
                      v-on:click="toggleEdit('pricePerBlockInWei')">edit</span>
              </div>

              <div class="input-group mb-2 mr-sm-2" v-show="edits['pricePerBlockInWei']">
                <div class="input-group-prepend">
                  <div class="input-group-text">Wei</div>
                </div>
                <input type="number" class="form-control form-control-sm"
                       placeholder="Price per block..."
                       v-model="sacDetails[$route.params.sacAddress].pricePerBlockInWei">
                <div class="input-group-append">
                  <button class="btn btn-outline-secondary" type="button">Commit
                  </button>
                </div>
              </div>

            </li>
            <li class="list-group-item">
              Max blocks in one go: {{sacDetails[$route.params.sacAddress].maxBlockPurchaseInOneGo}}
            </li>
            <li class="list-group-item">
              Only show purchased: {{sacDetails[$route.params.sacAddress].onlyShowPurchased}}
            </li>
            <li class="list-group-item">
              Foundation: {{sacDetails[$route.params.sacAddress].foundationAddress}} at
              ({{sacDetails[$route.params.sacAddress].foundationPercentage}}%)
            </li>
            <li class="list-group-item">
              Artist Account: {{sacDetails[$route.params.sacAddress].artist}}
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
  import Vue from 'vue';
  import Web3 from 'web3';
  import {mapGetters, mapState} from 'vuex';

  export default {
    name: 'SACManagement',
    components: {},
    data() {
      return {
        contractError: false,
        edits: {}
      };
    },
    computed: {
      ...mapState(['sacDetails', 'account']),
      ...mapGetters(['getSacDetails'])
    },
    methods: {
      toggleEdit: function (type) {
        Vue.set(this.edits, type, true);
      },
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
