import Vue from 'vue';
import Router from 'vue-router';
import Gallery from '@/components/pages/Gallery';
import Mint from '@/components/pages/Mint';
import Artist from '@/components/pages/Artist';

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
      path: '/mint',
      name: 'mint',
      component: Mint
    },
    {
      path: '/artist',
      name: 'artist',
      component: Artist
    }
  ]
});
