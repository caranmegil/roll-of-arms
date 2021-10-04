<template>
    <div class="profiles">
        <h1>Change your profile</h1>
        <div v-if="hasError" class="error">Please make sure the form is filled out correctly!</div>
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
  data() {
    return {
      hasError: false,
    };
  },
  methods: {
    save: async function () {
      const name = document.getElementById('name').value;
      const location = document.getElementById('location').value;
      let that = this;

      let profile = {
        name,
        location,
      };

      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${location.replaceAll(/\s/g, '%20')}&format=geojson`);
      const json = await response.json();
      if (json.features.length > 0) {
        const coords = json.features[0].geometry.coordinates;
        profile.geolocation = [coords[1], coords[0]];
      }
      saveCollection('profiles', profile).then(function () {
        that.hasError = false;
        that.$router.go(-1);
      }).catch(function () {
        that.hasError = true;
      });
    },
    back: function () {
      this.$router.go(-1);
    }
  },
  async mounted() {
    let name = document.getElementById('name');
    let location = document.getElementById('location');
    const profileData = await getCollection('profiles') || {};
    name.value = profileData.name || '';
    location.value = profileData.location || '';
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

  .error {
      align-self: center;
      justify-self: center;
      color: red;
  }
</style>
