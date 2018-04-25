<template>
  <div class="purchase-state-container">
    <p class="purchased">{{ purchasedState() }}</p>
  </div>
</template>

<script>
  /* global web3:true */

  export default {
    name: 'purchaseState',
    props: ['state'],
    methods: {
      purchasedState: function () {
        switch (this.state) {
          case 0:
            return 'AVAILABLE';
          case 1:
            return 'SOLD CRYPTO';
          case 2:
            return 'SOLD FIAT';
          default:
            return 'ERRRR...';
        }
      }
    }
  };
</script>

<style>
</style>
