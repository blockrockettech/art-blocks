import Vue from 'vue';
import Router from 'vue-router';
import Artists from '@/components/pages/Artists';
import Details from '@/components/pages/Details';
import Gallery from '@/components/pages/Gallery';
import Account from '@/components/pages/Account';
import License from '@/components/pages/License';
import Assets from '@/components/pages/Assets';
import ConfirmPurchase from '@/components/pages/ConfirmPurchase';
import ConfirmPurchaseQr from '@/components/pages/ConfirmPurchaseQr';
import ArtistPage from '@/components/pages/ArtistPage';
import CompletePurchase from '@/components/pages/CompletePurchase';
import AssetDetailView from '@/components/pages/AssetDetailView';

Vue.use(Router);

export default new Router({
  mode: 'history',
  linkActiveClass: 'is-active',
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return {x: 0, y: 0};
    }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: Gallery
    },
    {
      path: '/artists',
      name: 'artists',
      component: Artists
    },
    {
      path: '/details',
      name: 'details',
      component: Details
    },
    {
      path: '/gallery',
      name: 'gallery',
      component: Gallery
    },
    {
      path: '/editions',
      name: 'editions',
      component: Gallery
    },
    {
      path: '/account',
      name: 'account',
      component: Account
    },
    {
      path: '/license',
      name: 'license',
      component: License
    },
    {
      path: '/assets',
      name: 'assets',
      component: Assets
    },
    {
      path: '/assets/:tokenId',
      name: 'assetDetailView',
      component: AssetDetailView,
      props: true
    },
    {
      path: '/artists/:artistCode',
      name: 'artist',
      component: ArtistPage,
      props: true
    },
    {
      path: '/artists/:artistCode/editions/:edition',
      name: 'confirmPurchase',
      component: ConfirmPurchase,
      props: true
    },
    {
      path: '/artists/:artistCode/editions/:edition/qr',
      name: 'confirmPurchaseQr',
      component: ConfirmPurchaseQr,
      props: true
    },
    {
      path: '/editions/:edition',
      name: 'confirmPurchaseShort',
      component: ConfirmPurchase,
      props: true
    },
    {
      path: '/artists/:artistCode/editions/:edition/assets/:tokenId',
      name: 'completePurchase',
      component: CompletePurchase,
      props: true
    }
  ]
});
