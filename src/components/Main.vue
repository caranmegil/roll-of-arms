<template>
  <div class="main">
    <div class="profiles">
        <div v-if="hasError" class="error">Please make sure the form is filled out correctly!</div>
        <div v-if="hasProfileSaved" class="saved">You successfully saved your profile settings!</div>
        <div class="element">
            <label for="name">Name</label>
            <input id="name" v-model="profile.name" type="text"/>
        </div>
        <div class="element">
            <label for="location">Current Location</label>
            <input id="location" v-model="profile.location" type="text"/>
        </div>
        <div class="element">
            <label for="facebook">Facebook User ID</label>
            <input id="facebook" v-model="profile.facebook" type="text"/>
        </div>
        <h3>Discord Information (<a href="https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID" target="_blank">Where can I find it?</a>)</h3>
        <div class="social">
            <div class="element">
                <label for="discord">Handle</label>
                <input id="discord" v-model="profile.discord" type="text"/>
            </div>
            <div class="element">
                <label for="discordNum">ID</label>
                <input id="discordNum" v-model="profile.discord_number" type="text"/>
            </div>
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
      hasProfileSaved: false,
      map: null,
      hasError: false,
      profile: {},
    };
  },
  methods: {
    ...mapActions(['setCredentials',]),
    save: async function () {
      let that = this;

      this.profile.firstTime = false;
      if (this.profile.location === '') {
        this.profile.geolocation = null;
      } else {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${this.profile.location.replaceAll(/\s/g, '%20')}&format=geojson`);
        const json = await response.json();
        if (json.features.length > 0) {
          const coords = json.features[0].geometry.coordinates;
          this.profile.geolocation = [coords[1], coords[0]];
        }
      }
      this.hasProfileSaved = false;
      this.hasError = false;
      console.log(this.profile);
      saveCollection('profiles', this.profile).then(function () {
        that.hasError = false;
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
    } else { 
      signInAgain(async function() {
        that.profile = await getCollection('profiles') || null;
      });
    }
    this.profile = await getCollection('profiles') || {name: '', location: ''};
  },
}
</script>

<style scoped>
  @media screen and (max-width: 480px) {
    .social {
      display: grid;
      grid-auto-flow: row;
      grid-template-rows: 1fr 1fr;
      gap: .5em;
    }
  }

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
    justify-self: end;
    align-self: start;
    padding-right: .5em;
  }

  .error {
      align-self: center;
      justify-self: center;
      color: red;
  }

  .social {
    display: grid;
    grid-auto-flow: column;
    gap: .5em;
  }

  .heading { font-weight: bold; }
</style>
