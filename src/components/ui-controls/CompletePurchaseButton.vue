<template>
  <div>
    <form v-if="account">

      <div v-if="!assetPurchaseState(asset.id)">

        <div class="form-check mb-2" v-if="isUnsold">
          <label class="form-check-label" :for="'confirm_terms'">
            <input type="checkbox" :id="'confirm_terms'" v-model="confirm_terms">
            <span class="pl-2">I agree with the KODA license</span>
          </label>
        </div>

        <div v-if="isUnsold" class="mb-2">
          <small>
            By choosing <strong>I agree</strong>, you understand and agree to KnownOrigin's term of service and usage license.
            <router-link :to="{ name: 'license' }" target="_blank">Read license</router-link>
          </small>
        </div>

        <div class="btn-group-vertical btn-block">
          <button type="button" class="btn btn-success btn-block text-white"
                  :disabled="!confirm_terms || isPurchaseTriggered(asset.id)"
                  v-on:click="completePurchase" v-if="isUnsold">
            Confirm buy
          </button>

          <button type="button" v-on:click="completeFiatPurchase" class="btn btn-warning btn-block " v-if="isKnownOrigin && !soldAsFiat">
            FIAT purchase
          </button>

          <button type="button" v-on:click="reverseFiatPurchase" class="btn btn-danger btn-block" v-if="isKnownOrigin && soldAsFiat">
            Reverse FIAT purchase
          </button>

          <router-link :to="{ name: 'gallery'}" tag="button" class="btn btn-outline-primary btn-block">
            Back to gallery
          </router-link>
        </div>
      </div>

      <router-link v-if="asset.purchased !== 0" :to="{ name: 'account'}" tag="button" class="btn btn-outline-primary btn-block">
        View account
      </router-link>
    </form>

    <p v-if="!account" class="text-center pt-2">
      Your account is locked!
    </p>

  </div>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';
  import _ from 'lodash';
  import * as actions from '../../store/actions';
  import * as mutations from '../../store/mutation-types';
  import AddressIcon from './AddressIcon.vue';

  export default {
    name: 'completePurchaseButton',
    components: {AddressIcon},
    props: {
      asset: {
        required: true,
        type: Object
      },
    },
    computed: {
      ...mapGetters([
        'isKnownOrigin',
        'assetPurchaseState',
        'isPurchaseTriggered',
        'isPurchaseStarted',
        'isPurchaseSuccessful',
        'isPurchaseFailed',
      ]),
      ...mapState(['account', 'purchaseState']),
      soldAsFiat: function () {
        return this.asset.purchased === 2;
      },
      isUnsold: function () {
        return this.asset.purchased === 0;
      }
    },
    data () {
      return {
        confirm_terms: false
      };
    },
    methods: {
      completePurchase: function () {
        console.log('Completing purchase', this.asset);
        this.$emit('purchaseInitiated', this.asset);
        this.$store.dispatch(actions.PURCHASE_ASSET, this.asset);
      },
      completeFiatPurchase: function () {
        console.log('Completing FIAT purchase', this.asset);
        this.$emit('purchaseInitiated', this.asset);
        this.$store.dispatch(actions.PURCHASE_ASSET_WITH_FIAT, this.asset);
      },
      reverseFiatPurchase: function () {
        console.log('Reverse FIAT purchase', this.asset);
        this.$emit('purchaseInitiated', this.asset);
        this.$store.dispatch(actions.REVERSE_PURCHASE_ASSET_WITH_FIAT, this.asset);
      }
    }
  };
</script>

<style scoped lang="scss">
  .form-check {
    padding-left: 0px;
  }
</style>
