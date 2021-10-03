<template>
    <div class="profiles">
        <h1>Change your profile</h1>
        <div class="element">
            <label for="name">Name</label>
            <input id="name" type="text"/>
        </div>
        <div class="element">
            <label for="location">Current Location</label>
            <input id="location" type="text"/>
        </div>
        <button @click="save">Save!</button>
        <div class="separator"></div>
        <a class="element" @click="back">Back</a>
    </div>
</template>

<script>
import 'es6-promise/auto';

export default {
  name: 'ProfileEdit',
  props: {
  },
  methods: {
    save: function () {

    },
    back: function () {
      this.$router.go(-1);
    }
  },
}
</script>

<style scoped>
    .separator {
        border-bottom: 1px solid #D3D3D3;
    }
</style>
