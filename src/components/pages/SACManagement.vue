<template>
  <div>
    <div class="row justify-content-center">
      <div class="col-sm-12">
        <h2>Art Node</h2>
        <h4>
          <pre>{{$route.params.sacAddress}}</pre>
        </h4>
      </div>
    </div>

    <div v-if="contractError" class="mt-2">
      <span class="text-danger">Error - SAC address not found or not invalid</span>
    </div>

    <div v-else class="row justify-content-center mt-2">

      <div class="col-sm-12">
        <div v-if="sacDetails[$route.params.sacAddress]">

          <ul class="list-group list-group-flush">
            <li class="list-group-item">
              <div v-show="!edits['pricePerBlockInWei']">
                <div class="row">
                  <div class="col text-muted">
                    Price per block:
                  </div>
                  <div class="col">
                    {{sacDetails[$route.params.sacAddress].pricePerBlockInWei | toEth}} ETH

                    <a href="#" class="small float-right"
                       v-on:click="toggleEdit('pricePerBlockInWei')"
                       v-if="isArtist()">edit</a>
                  </div>
                </div>
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
                          v-on:click="commitChanges('pricePerBlockInWei')">Commit
                  </button>
                </div>
              </div>
            </li>

            <li class="list-group-item">
              <div v-show="!edits['maxBlockPurchaseInOneGo']">
                <div class="row">
                  <div class="col text-muted">
                    Max blocks per purchase:
                  </div>
                  <div class="col">
                    {{sacDetails[$route.params.sacAddress].maxBlockPurchaseInOneGo}}
                    <a href="#" class="small float-right"
                       v-on:click="toggleEdit('maxBlockPurchaseInOneGo')"
                       v-if="isArtist()">edit</a>
                  </div>
                </div>

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
                <div class="row">
                  <div class="col text-muted">
                    Only show purchased:
                  </div>
                  <div class="col">
                    {{sacDetails[$route.params.sacAddress].onlyShowPurchased}}
                    <a href="#" class="small float-right"
                       v-on:click="toggleEdit('onlyShowPurchased')"
                       v-if="isArtist()">edit</a>
                  </div>
                </div>
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
              <div class="row">
                <div class="col text-muted">
                  Foundation Address:
                </div>
                <div class="col">
                  <clickable-address :ethAddress="sacDetails[$route.params.sacAddress].foundationAddress"></clickable-address>
                  at
                  {{sacDetails[$route.params.sacAddress].foundationPercentage}}%
                </div>
              </div>
            </li>
            <li class="list-group-item">
              <div class="row">
                <div class="col text-muted">
                  Art Node Owner:
                </div>
                <div class="col">
                  <clickable-address :ethAddress="sacDetails[$route.params.sacAddress].artist"></clickable-address>
                </div>
              </div>
            </li>
          </ul>
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
  /* global web3:true */
  import * as actions from '../../store/actions';
  import Vue from 'vue';
  import Web3 from 'web3';
  import { mapGetters, mapState } from 'vuex';
  import AddressIcon from '../ui-controls/AddressIcon';
  import ClickableAddress from '../ui-controls/ClickableAddress';
  import ClickableBlockhash from '../ui-controls/ClickableBlockhash';

  export default {
    name: 'SACManagement',
    components: {ClickableAddress, ClickableBlockhash},
    data () {
      return {
        contractError: false,
        edits: {}
      };
    },
    computed: {
      ...mapState(['sacDetails', 'account', 'hashes']),
      ...mapGetters(['getSacDetails', 'getHashMatch'])
    },
    methods: {
      toggleEdit: function (type) {
        Vue.set(this.edits, type, true);
      },
      isArtist: function () {
        if (!this.sacDetails[this.$route.params.sacAddress].artist || !this.account) {
          return false;
        }

        return this.sacDetails[this.$route.params.sacAddress].artist.toLowerCase() === this.account.toLowerCase();
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

      this.timer = setInterval(function () {
        console.log('getting next hash');
        this.$store.dispatch(actions.NEXT_HASH, this.$route.params.sacAddress);
      }.bind(this), 2000);
    },
    beforeDestroy() {
      clearInterval(this.timer);
    }
  };
</script>

<style lang="scss">
  $body-bg: #ffffcc;

  .list-group .list-group-item {
    background-color: $body-bg;
  }
</style>
