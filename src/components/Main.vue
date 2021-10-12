<template>
  <div class="main">
    <div class="profiles">
        <div v-if="hasError" class="error">Please make sure the form is filled out correctly!</div>
        <div v-if="hasProfileSaved" class="saved">You successfully saved your profile settings!</div>
        <div class="element">
            <label for="name">Name</label>
            <input id="name" v-model="name" type="text"/>
        </div>
        <div class="element">
            <label for="location">Current Location</label>
            <input id="location" v-model="location" type="text"/>
        </div>
        <button @click="save">Save!</button>
    </div>

    <div class="heading">Use the map below to find players in your area and connect on <a href="https://discord.gg/bn2ZAh9Y">Discord</a>!</div>
    <Map/>
  </div>
</template>

<script>
import {
  signIntoGoogle,
  signInAgain,
  getCollection,
  saveCollection
} from '@/firebase';
import 'es6-promise/auto';
import { mapActions } from 'vuex';
import Map from './Map.vue';

export default {
  name: 'Main',
  props: {
  },
  components: {
    Map
  },
  data() {
    return {
      name: '',
      location: '',
      hasProfileSaved: false,
      map: null,
      hasError: false,
      profile: null,
    };
  },
  methods: {
    ...mapActions(['setCredentials']),
    save: async function () {
      let that = this;

      let profile = {
        name: this.name,
        location: this.location,
      };
      profile.firstTime = false;
      if (profile.location === '') {
        profile.geolocation = null;
      } else {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${this.location.replaceAll(/\s/g, '%20')}&format=geojson`);
        const json = await response.json();
        if (json.features.length > 0) {
          const coords = json.features[0].geometry.coordinates;
          profile.geolocation = [coords[1], coords[0]];
        }
      }
      this.hasProfileSaved = false;
      this.hasError = false;
      saveCollection('profiles', profile).then(function () {
        that.hasError = false;
        that.profile = profile;
        that.hasProfileSaved = true;
        window.location.reload();
      }).catch(function (e) {
        console.error(e);
        that.hasError = true;
      });
    },
  },
  async mounted() {
    let that = this;

    // Find if there is this weird state happening
    // If so, kill the credentials and go to sign-in page.
    if (this.$store.state.user == null) {
      if(this.$store.state.credentials != undefined && this.$store.state.credentials != null && this.$store.state.credentials.email != undefined) {
        const user = await signIntoGoogle(this.$store.state.credentials.email, this.$store.state.credentials.password);
        this.setUser(user);
        this.profile = await getCollection('profiles') || null;
      } else {
        this.setCredentials({});
        this.$router.push('/signin');
      }

      this.name = (this.profile != null) ? this.profile.name : '';
      this.location = (this.profile != null) ? this.profile.location : '';
    } else {
      signInAgain(async function() {
        that.profile = await getCollection('profiles') || null;

        that.name = (that.profile != null) ? that.profile.name : '';
        that.location = (that.profile != null) ? that.profile.location : '';
      });
    }
  },
}
</script>

<style scoped>
  .main {
    display: grid;
    grid-template-rows: 1fr auto;
    gap: .5em;
  }

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
  .error {
      align-self: center;
      justify-self: center;
      color: red;
  }

  .heading { font-weight: bold; }
</style>
