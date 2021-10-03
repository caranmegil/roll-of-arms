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
import { saveCollection, getCollection } from '@/firebase';
import 'es6-promise/auto';

export default {
  name: 'ProfileEdit',
  props: {
  },
  methods: {
    save: function () {
      const name = document.getElementById('name').value;
      const location = document.getElementById('location').value;

      saveCollection('profiles', {name, location});
    },
    back: function () {
      this.$router.go(-1);
    }
  },
  async mounted() {
    let name = document.getElementById('name');
    let location = document.getElementById('location');
    const profileData = await getCollection('profiles');
    name.value = profileData.name;
    location.value = profileData.location;
  }
}
</script>

<style scoped>
  .profiles {
    display: grid;
    grid-auto-flow: row;
    grid-template-columns: auto;
    align-content: center;
    justify-content: center;
    gap: .5em;
  }

  .profiles h1 {
    align-self: center;
    justify-self: center;    
  }

  .profiles .element {
    align-self: center;
    justify-self: center;
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: 1fr 1fr;
  }

  .profiles .element > label {
    font-weight: bold;
    justify-self: start;
    align-self: start;
  }

  .separator {
    border-bottom: 1px solid #D3D3D3;
  }
</style>
