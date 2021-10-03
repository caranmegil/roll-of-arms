<template>
  <ul class="menu-container">
    <li>View Profile</li>
    <li class="separator"></li>
    <li @click="logoff">Sign Out</li>
  </ul>
</template>

<script>
import 'es6-promise/auto';
import {mapActions} from 'vuex';
import {signOutOfGoogle} from '@/firebase';

export default {
  name: 'ProfileMenu',
  props: {
  },
  methods: {
    ...mapActions(['signOut']),
    logoff: async function () {
      const isSignedOut = await signOutOfGoogle();

      if (isSignedOut) {
        this.signOut();
        this.$router.push('/signin');
      }
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

  li:hover {
    background-color: #D3D3D3;
  }
</style>
