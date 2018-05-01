<template>
  <div class="row justify-content-center">
    <div class="col-sm-8">
      <div class="card text-center">
        <div class="card-header">
          Mint dART Token
        </div>
        <form @submit.prevent="sendHandler">
          <ul class="list-group list-group-flush">
            <li class="list-group-item">
              From:
              <clickable-address :eth-address="account"></clickable-address>
            </li>
            <li class="list-group-item">
              <div class="form-group">
                <label for="tokenId">Token ID</label>
                <input type="text" class="form-control" id="tokenId" placeholder="123456" v-model="tokenId">
                <small id="tokenIdHelp" class="form-text text-muted">All IDs are unique...</small>
              </div>
            </li>
            <li class="list-group-item">
              <div class="form-group">
                <label for="blockhash">Blockhash</label>
                <input type="text" class="form-control" id="blockhash" placeholder="0x000000" v-model="blockhash">
                <small id="emailHelp" class="form-text text-muted">dART tokens must have a unique hash!</small>
              </div>
            </li>
            <li class="list-group-item">
              <div class="form-group">
                <label for="nickname">Nickname</label>
                <input type="text" class="form-control" id="nickname" placeholder="Lord Gray" v-model="nickname">
                <small id="nicknameHelp" class="form-text text-muted">keep it clean(ish)</small>
              </div>
            </li>
          </ul>
          <div class="card-footer text-muted">
            <button class="btn btn-primary btn-block" type="submit">Mint</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>

  import { mapGetters, mapState } from 'vuex';
  import ClickableAddress from '../ui-controls/ClickableAddress';
  import * as actions from '../../store/actions';

  export default {
    name: 'mint',
    components: {ClickableAddress},
    computed: {
      ...mapState([
        'account'
      ]),
      ...mapGetters([])
    },
    data() {
      return {
        blockhash: null,
        nickname: null,
        tokenId: null
      };
    },
    methods: {
      sendHandler () {
        this.$store.dispatch(actions.MINT, {blockhash: this.blockhash, nickname: this.nickname, tokenId: this.tokenId});
      },
    },
    mounted() {}
  };
</script>

<style scoped>
  img {
    width: auto;
  }
</style>
