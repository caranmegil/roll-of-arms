<template>
  <ul class="menu-container">
    <li>View Profile</li>
    <li class="separator"></li>
    <li @click="signOut">Sign Out</li>
  </ul>
</template>

<script>
import 'es6-promise/auto';

export default {
  name: 'ProfileMenu',
  props: {
  },
  methods: {
    signOut: function () {
      this.$auth.logout();
    }
  },
}
</script>

<style scoped>
  .menu-container {
    border: 1px solid black;
    background-color: ivory;
    padding: .5em;
  }

  .separator {
    border-bottom: 1px solid #D3D3D3;
  }

  li {
    list-style-type: none;
  }
</style>
