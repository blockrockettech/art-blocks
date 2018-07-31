// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import router from './router';
import store from './store';
import logging from './logging';
import VModal from 'vue-js-modal';
import AsyncComputed from 'vue-async-computed';
import ToggleButton from 'vue-js-toggle-button';
import Web3 from 'web3';

// Add brands to fontawesome
import fontawesome from '@fortawesome/fontawesome';
import brands from '@fortawesome/fontawesome-free-brands';
import solid from '@fortawesome/fontawesome-free-solid';

import Vue2Filters from 'vue2-filters';

fontawesome.library.add(brands, solid);

Vue.use(VModal);
Vue.use(AsyncComputed);
Vue.use(ToggleButton);

Vue.config.productionTip = false;

Vue.filter('toEth', function (value) {
  if (!value) return '';
  return Web3.utils.fromWei(value.toString(10), 'ether').valueOf();
});

Vue.filter('to2Dp', function (value) {
  if (!value) return '';
  return new BigNumber(value.toString(10)).toFormat(2);
});

Vue.filter('to0Dp', function (value) {
  if (!value) return '';
  return new BigNumber(value.toString(10)).toFormat(0);
});

Vue.use(Vue2Filters);


;(async () => {
  try {
    // pre-Vue JS bootstrap
  } catch (e) {
    // eslint-disable-next-line
    console.log(e);
  } finally {
    /* eslint-disable no-new */
    new Vue({
      el: '#app',
      store,
      router,
      logging,
      components: {App},
      template: '<App/>'
    });
  }
})();
