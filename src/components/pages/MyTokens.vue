<template>
  <div>
    <div class="row justify-content-center">
      <div class="col-sm-12">
        <h2>My Interface Tokens <span class="badge badge-primary">{{assetsPurchasedByAccount.length || 0}}</span></h2>
        <h4>
          <pre>{{account}}</pre>
        </h4>
      </div>
    </div>

    <div class="row mt-2">

      <div class="col">

        <div class="card-columns">

          <div class="card" v-for="tokenDetails in accountTokenDetails">
            <div class="text-center">
              <address-icon :ethAddress="tokenDetails.blockhash"></address-icon>
            </div>
            <ul class="list-group list-group-flush">
              <li class="list-group-item text-center">
                <span class="text-muted">TokenID:</span> <span class="badge badge-primary">{{ tokenDetails.tokenId }}</span>
              </li>
              <li class="list-group-item">
                <small><samp>{{ tokenDetails.blockhash }}</samp></small>
              </li>
              <li class="list-group-item">

                <div v-show="!edits[tokenDetails.tokenId]">
                  <span class="text-muted">Nickname:</span> {{tokenDetails.nickname || '-- no nickname --'}}
                  <a href="#" class="small float-right" v-on:click="toggleEdit(tokenDetails.tokenId)">edit</a>
                </div>

                <div class="input-group mb-2 mr-sm-2" v-show="edits[tokenDetails.tokenId]">
                  <div class="input-group-prepend">
                    <div class="input-group-text">@</div>
                  </div>
                  <input type="text" class="form-control form-control-sm"
                         :id="'nickName' + tokenDetails.id"
                         placeholder="Enter a nickname"
                         v-model="tokenDetails.nickname"
                         maxlength="32">
                  <div class="input-group-append">
                    <button class="btn btn-outline-secondary" type="button"
                            v-on:click="updateNickname(tokenDetails.tokenId, tokenDetails.nickname)">Commit
                    </button>
                  </div>
                </div>
              </li>
              <li class="list-group-item">
                <a :href="tokenDetails.metadata" target="_blank">Metadata</a>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </div>

  </div>
</template>

<script>

  import { mapGetters, mapState } from 'vuex';
  import AddressIcon from '../ui-controls/AddressIcon';
  import * as actions from '../../store/actions';
  import Vue from 'vue';

  export default {
    name: 'myToken',
    components: {
      AddressIcon
    },
    data () {
      return {
        edits: {}
      };
    },
    computed: {
      ...mapState([
        'account',
        'accountTokenDetails',
        'assetsPurchasedByAccount',
      ]),
      ...mapGetters([])
    },
    methods: {
      toggleEdit: function (tokenId) {
        Vue.set(this.edits, tokenId, true);
      },
      updateNickname: function (tokenId, nickname) {
        this.$store.dispatch(actions.TOKN_UPDATE_NICKNAME, {tokenId, nickname});
        Vue.set(this.edits, tokenId, false);
      }
    }
  };
</script>

<style scoped lang="scss">
</style>
