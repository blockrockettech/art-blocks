<template>
  <div>


    <modal name="no-web3-found" :clickToClose="true" :width="300">
      <div class="alert alert-light fade show" role="alert">
        <button type="button" class="close" data-dismiss="alert" aria-label="Close" @click="$modal.hide('no-web3-found')">
          <span aria-hidden="true">&times;</span>
        </button>

        <p class="pt-4 text-danger">
          <strong>You require a Web3 Ethereum enabled browser to buy KODA assets!</strong>
        </p>

        <p>
          On a chrome browser add <a href="https://metamask.io" target="_blank">metamask.io</a> or install a mobile wallet such as <a href="https://trustwalletapp.com" target="_blank">TrustWallet</a>
        </p>

        <div class="text-center">
          <a href='https://metamask.io' target="_blank" class="pr-4"><img src="../static/metamask-logo-eyes.png" style="height: 50px"/></a>
          <a href="https://trustwalletapp.com" target="_blank"><img src="/../static/trustwallet_logo.svg" style="height:50px"/></a>
        </div>
      </div>
    </modal>

    <header>
      <nav class="navbar navbar-expand-md navbar-dark bg-primary fixed-top">
        <router-link :to="{ name: 'home' }" class="navbar-brand">
          KnownOrigin.io
        </router-link>

        <ul class="navbar-nav justify-content-end">
          <li class="nav-item d-none d-sm-block">
            <router-link :to="{ name: 'gallery' }" class="nav-link">Gallery</router-link>
          </li>
          <li class="nav-item d-none d-sm-block">
            <router-link :to="{ name: 'artists' }" class="nav-link">Artists</router-link>
          </li>
          <li class="nav-item">
            <router-link :to="{ name: 'account' }" class="nav-link">Account</router-link>
          </li>
        </ul>
      </nav>
    </header>

    <main role="main" class="container">
      <router-view></router-view>
    </main>

    <footer class="footer">
      <div class="container">
        <div class="row">
          <div class="col-sm">
            <small class="slogan">BE ORIGINAL. BUY ORIGINAL.</small>
          </div>
          <div class="col-sm">
            <small>
              <router-link :to="{ name: 'gallery' }">Gallery</router-link> &bull;
              <router-link :to="{ name: 'artists' }">Artists</router-link> &bull;
              <router-link :to="{ name: 'account' }">Account</router-link> &bull;
              <router-link :to="{ name: 'details' }">Contract</router-link>
            </small>
          </div>
          <div class="col-sm text-center">
            <a href="mailto:hello@knownorigin.io" target="_blank" class="pr-2">
              <font-awesome-icon :icon="['fas', 'envelope-square']" size="lg"></font-awesome-icon>
            </a>
            <a href="https://medium.com/knownorigin" target="_blank" class="pr-2">
              <font-awesome-icon :icon="['fab', 'medium']" size="lg"></font-awesome-icon>
            </a>
            <a href="https://t.me/knownorigin_io" target="_blank" class="pr-2">
              <font-awesome-icon :icon="['fab', 'telegram-plane']" size="lg"></font-awesome-icon>
            </a>
            <a href="https://twitter.com/knownorigin_io" target="_blank">
              <font-awesome-icon :icon="['fab', 'twitter']" size="lg"></font-awesome-icon>
            </a>
            <small class=""><current-network></current-network></small>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
  /* global web3:true */

  import Web3 from 'web3';
  import {mapGetters, mapState} from 'vuex';
  import * as actions from './store/actions';
  import * as mutations from './store/mutation-types';
  import CurrentNetwork from './components/ui-controls/CurrentNetwork';
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome';

  export default {
    name: 'app',
    components: {
      FontAwesomeIcon,
      CurrentNetwork
    },
    computed: {
      ...mapGetters([]),
      ...mapState([]),
    },
    mounted() {

      let bootStrappedWeb3;

      // Checking if Web3 has been injected by the browser (Mist/MetaMask)
      if (typeof web3 !== 'undefined') {
        bootStrappedWeb3 = new Web3(web3.currentProvider);
      } else {
        console.log('No web3! You should consider trying MetaMask or an Ethereum browser');
        console.log('Falling back to using HTTP Provider');

        bootStrappedWeb3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/nbCbdzC6IG9CF6hmvAVQ"));
      }

      window.web3 = bootStrappedWeb3;

      // Bootstrap the full app
      this.$store.dispatch(actions.INIT_APP, bootStrappedWeb3);
    },
  };
</script>

<style lang="scss">

  $body-bg: #f2f5fb;
  $body-color: #545454;
  $primary: #3e27d9;
  $enable-rounded: false;

  $font-family-base: 'Avenir', Helvetica, Arial, sans-serif;

  @import '../node_modules/bootstrap/scss/bootstrap.scss';

  /* Sticky footer styles
-------------------------------------------------- */
  html {
    position: relative;
    min-height: 100%;
  }

  body {
    margin-bottom: 60px;
    margin-top: 10px;
    padding-top: 70px;
    padding-bottom: 20px;
  }

  .navbar-brand {
    font-size: 1.5rem;
  }

  /* mobile only */
  @media screen and (max-width: 767px) {
    body {
      padding-bottom: 100px;
    }

    .footer {
      .col-sm {
        padding-bottom: 10px;
      }
    }

    h1 {
      font-size: 1.5rem;
    }
  }

  .footer {
    position: absolute;
    bottom: 0;
    width: 100%;
    min-height: 60px;
    line-height: 25px;
    background-color: $primary;
  }

  body > .container {
    padding: 60px 60px 0;
  }

  .footer > .container {
    padding-right: 15px;
    padding-left: 15px;
    padding-top: 15px;
    color: #f2f5fb;

    .slogan {
      color: rgba(255, 255, 255, 0.5);
    }

    a {
      color: #f2f5fb;
      padding-left: 2px;
      padding-right: 2px;
    }
  }

  .btn-group-vertical > button {
    margin-bottom: 10px;
  }
</style>
