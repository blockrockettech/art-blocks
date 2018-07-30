<template>
  <div>
    <h4>Simple Artist Contract Management
      <small>{{$route.params.sacAddress}}</small>
    </h4>

    <div v-if="contractError">
      <span class="text-danger">Error - SAC address not found or not invalid</span>
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
                      v-on:click="toggleEdit('pricePerBlockInWei')"
                      v-if="isArtist">edit</span>
              </div>

              <div class="input-group mb-2 mr-sm-2" v-show="edits['pricePerBlockInWei']">
                <div class="input-group-prepend">
                  <div class="input-group-text">Price per block (Wei)</div>
                </div>
                <input type="number" class="form-control form-control-sm"
                       placeholder="Price per block..."
                       v-model="sacDetails[$route.params.sacAddress].pricePerBlockInWei">
                <div class="input-group-append">
                  <button class="btn btn-outline-secondary" type="button"
                          v-on:click="commitChanges('pricePerBlockInWei')" >Commit
                  </button>
                </div>
              </div>
            </li>

            <li class="list-group-item">
              <div v-show="!edits['maxBlockPurchaseInOneGo']">
                Max blocks in one go: {{sacDetails[$route.params.sacAddress].maxBlockPurchaseInOneGo}}
                <span class="text-muted text-sm float-right"
                      style="cursor: pointer;"
                      v-on:click="toggleEdit('maxBlockPurchaseInOneGo')"
                      v-if="isArtist">edit</span>
              </div>

              <div class="input-group mb-2 mr-sm-2" v-show="edits['maxBlockPurchaseInOneGo']">
                <div class="input-group-prepend">
                  <div class="input-group-text">Max purchase (blocks)</div>
                </div>
                <input type="number" class="form-control form-control-sm"
                       placeholder="Max blocks..."
                       v-model="sacDetails[$route.params.sacAddress].maxBlockPurchaseInOneGo">
                <div class="input-group-append">
                  <button class="btn btn-outline-secondary" type="button"
                          v-on:click="commitChanges('maxBlockPurchaseInOneGo')">Commit
                  </button>
                </div>
              </div>
            </li>

            <li class="list-group-item">
              <div v-show="!edits['onlyShowPurchased']">
                Only show purchased: {{sacDetails[$route.params.sacAddress].onlyShowPurchased}}
                <span class="text-muted text-sm float-right"
                      style="cursor: pointer;"
                      v-on:click="toggleEdit('onlyShowPurchased')"
                      v-if="isArtist">edit</span>
              </div>

              <div class="input-group mb-2 mr-sm-2" v-show="edits['onlyShowPurchased']">
                <div class="input-group mb-3">
                  <div class="input-group-prepend">
                    <label class="input-group-text">Only show purchase</label>
                  </div>
                  <select class="custom-select"
                          v-model="sacDetails[$route.params.sacAddress].onlyShowPurchased">
                    <option disabled value="">Please select one</option>
                    <option value="true">true</option>
                    <option value="false">false</option>
                  </select>

                  <div class="input-group-append">
                    <button class="btn btn-outline-secondary" type="button"
                            v-on:click="commitChanges('onlyShowPurchased')">Commit
                    </button>
                  </div>
                </div>
              </div>
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
      isArtist: function () {
        return this.sacDetails[this.$route.params.sacAddress].artist === this.account;
      },
      commitChanges: function (type) {
        Vue.set(this.edits, type, false);
        const payload = {
          sacAddress: this.$route.params.sacAddress,
          data: this.sacDetails[this.$route.params.sacAddress][type]
        };
        switch (type) {
          case 'onlyShowPurchased':
            return this.$store.dispatch(actions.SAC_UPDATE_ONLY_PURCHASED, payload);
          case 'maxBlockPurchaseInOneGo':
            return this.$store.dispatch(actions.SAC_UPDATE_MAX_BLOCKS_PURCHASE, payload);
          case 'pricePerBlockInWei':
            return this.$store.dispatch(actions.SAC_UPDATE_MAX_PRICE_PRE_BLOCK, payload);
        }
      }
    },
    mounted: function () {
      this.$nextTick(function () {
        if (!this.$route.params.sacAddress || !Web3.utils.isAddress(this.$route.params.sacAddress)) {
          this.contractError = true;
          return;
        }
        this.contractError = false;
        this.$store.dispatch(actions.GET_SAC_DETAILS, this.$route.params.sacAddress);
      });
    }
  };
</script>

<style>
</style>
