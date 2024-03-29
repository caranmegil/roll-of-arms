<template>
    <v-tour name="mainTour" :steps="steps" :callbacks="tourCallbacks"></v-tour>
  <div class="main">
      <header>
        <h2>Welcome to Roll of Arms!</h2>
      </header>
      <span id="location">
        <div id="location-info-collapsed" @click="toggleExpand"><div class="expander"><div class="spacer"></div><h3>My Location Details</h3><span class="material-icons material-icons-outlined">expand_more</span></div></div>
        <div id="location-info-expanded" class="profiles" v-if="profile.location">
          <div class="expander" @click="toggleExpand"><div class="spacer"></div><h3>My Location Details</h3><span class="material-icons material-icons-outlined">expand_less</span></div>
          <div class="error" v-if="hasError">Please make sure that every field is filled out for your location!</div>
          <div class="element">
            <label for="city">City</label>
            <input type="text" v-model="profile.location.city"/>
          </div>
          <div class="element">
            <label for="region">State/Province/Region</label>
            <input type="text" v-model="profile.location.region"/>
          </div>
          <div class="element">
            <label for="region">Country</label>
            <input type="text" v-model="profile.location.country"/>
          </div>
          <button @click="save">Add to Map</button>
          <button @click="emptyFields">Remove from Map</button>
        </div>
      </span>
    <div class="heading">Use the map below to find players in your area and connect on <a href="https://discord.gg/dragondice" target="_blank">Discord</a>!</div>
    <Map id="mainMap"/>
  </div>
</template>

<script>
import {
  signIntoGoogle,
  getCurrentUser,
  getCollection,
  saveCollection,
} from '@/firebase';
import 'es6-promise/auto';
import { mapActions } from 'vuex';
import Map from '@/components/Map.vue';

export default {
  name: 'MainView',
  props: {
  },
  components: {
    Map
  },
  data() {
    return {
      map: null,
      hasError: false,
      profile: {},
      tourCallbacks: {
        onSkip: this.noMoreTours,
        onFinish: this.noMoreTours,
      },
      steps: [
        {
          target: '#location',
          header: {
            title: 'Your Location Info!',
          },
          content: 'Press the arrow to open up or close the location info editor.',
        },
        {
          target: '#mainMap',
          header: {
            title: 'The map!',
          },
          content: 'This is where all the players that have registered their relative locations are pinned including links to their all visible profile information!',
        },
      ],
    };
  },
  methods: {
    ...mapActions(['setCredentials',]),
    async noMoreTours() {
      let profile = await getCollection('profiles');
      profile.mainTour = false;
      saveCollection('profiles', profile);
    },
    toggleExpand() {
      let collapsed = document.getElementById('location-info-collapsed');
      let expanded = document.getElementById('location-info-expanded');

      if (window.getComputedStyle(collapsed).display === 'none') {
        collapsed.style.display = 'block';
        expanded.style.display = 'none';
      } else {
        collapsed.style.display = 'none';
        expanded.style.display = 'block';
      }
    },
    async emptyFields() {
      this.profile.location = {};
      delete this.profile.geolocation;
      saveCollection('profiles',this.profile).then(function () {
        window.location.reload();
      }).catch(function (e) {
        console.error(e);
      });
    },
    async save() {
      if (this.profile.location && this.profile.location.city.trim() !== '' && this.profile.location.region.trim() !== '' && this.profile.location.country.trim() !== '') {
        const location = `${this.profile.location.city} ${this.profile.location.region} ${this.profile.location.country}`

        if (location === '') {
          this.profile.geolocation = null;
        } else {
          const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${location.replaceAll(/\s/g, '%20')}&format=geojson`);
          const json = await response.json();

          if (json.features.length > 0) {
            const coords = json.features[0].geometry.coordinates;
            this.profile.geolocation = [coords[1], coords[0]];
            saveCollection('profiles',this.profile).then(function () {
              window.location.reload();
            }).catch(function (e) {
              console.error(e);
            });
          }
        }
      }
    },
    correctProfile() {
      if (typeof this.profile.location !== 'object') {
        this.profile.location = {city: '', region: '', country: ''}
      }
    },
    genDefaultProfile() {
      return {location: {city: '', region: '', country: ''}};
    },
  },
  updated() {
    if (!this.profile.location || (this.profile.location.city === '' && this.profile.location.region === '' && this.profile.location.country === '')) {
      this.toggleExpand();
    }
  },
  async mounted() {
    // Find if there is this weird state happening
    // If so, kill the credentials and go to sign-in page.
    const user = getCurrentUser();
    if (user == null) {
      if(this.$store.state.credentials != undefined && this.$store.state.credentials != null && this.$store.state.credentials.email != undefined) {
        const user = await signIntoGoogle(this.$store.state.credentials.email, this.$store.state.credentials.password);
        this.setUser(user);
        if (user.emailVerified) {
          this.profile = await getCollection('profiles') || null;
          if (this.profile == null) {
            this.$router.push('/profile');
          } else {
            this.correctProfile();
          }
        } else {
          this.$router.push('/verifywarn');
        }
      } else {
        this.setCredentials({});
        this.$router.push('/signin');
      }
    } else {
      this.profile = await getCollection('profiles') || null;
      if (user.emailVerified) {
        if (this.profile == null) {
          this.$router.push('/profile');
        } else {
          this.correctProfile();
        }
      } else {
        this.$router.push('/verifywarn');
      }
    }

    if (!this.profile.release_notes_2) {
      this.profile.release_notes_2 = true;
      saveCollection('profiles', this.profile);
      this.$router.push('/releasenotes');
    }
    if (this.profile.mainTour || this.profile.mainTour === undefined) {
      this.$tours['mainTour'].start();
    }
  },
}
</script>

<style scoped>
  .main {
    display: grid;
    grid-template-rows: 1fr auto;
    align-items: center;
    justify-items: center;
    width: 100%;
  }

  .material-icons {
    font-size: 16px;
  }

  .profiles {
    display: grid;
    grid-auto-flow: row;
    grid-template-columns: auto;
    align-items: center;
    justify-items: center;
    align-content: center;
    justify-content: center;
    gap: .5em;
    display: none;
  }

  .profiles button {
    padding-left: 3em;
    padding-right: 3em;
    width: 100%;
    margin: .2em;
  }

  .expander {
    width: 100%;
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: 1fr 1fr 1fr;
    align-items: center;
    justify-items: center;
    padding: 2px;
  }

  .expander h3 {
    width: 10.5em;
  }
  
  .expander .material-icons {
    width: 1em;
  }

  .expander .spacer {
    width: 6.5em;
  }

  header {
    display: grid;
    grid-auto-flow: row;
    grid-template-columns: auto;
    align-content: center;
    justify-content: center;
    align-items: center;
    justify-items: center;
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

  .heading { font-weight: bold; }
</style>
