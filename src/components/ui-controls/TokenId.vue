<template>
  <span class="badge badge-light">{{ pad }}</span>
</template>

<script>
  export default {
    name: 'tokenId',
    props: ['value'],
    computed: {
      pad: function () {
        let s = '' + this.value;
        while (s.length < 6) s = "0" + s;
        return '#' + s;
      }
    }
  };
</script>

<style scoped>

</style>
