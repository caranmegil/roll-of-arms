<template>
  <div class="main">
    <div class="profiles">
        <div v-if="hasError" class="error">Please make sure the form is filled out correctly!</div>
        <div v-if="hasProfileSaved" class="saved">You successfully saved your profile settings!</div>
        <div class="element">
            <label for="name">Name</label>
            <input id="name" :value="profile.name" type="text"/>
        </div>
        <div class="element">
            <label for="location">Current Location</label>
            <input id="location" :value="profile.location" type="text"/>
        </div>
        <button @click="save">Save!</button>
    </div>

    <div class="heading">Use the map below to find players in your area and connect on <a href="https://discord.gg/bn2ZAh9Y">Discord</a>!</div>
    <div id="map"></div>
  </div>
</template>

<script>
import L from 'leaflet';
import {
  getCollection,
  getEntireCollection,
  saveCollection
} from '@/firebase';
import 'es6-promise/auto';
import { mapActions } from 'vuex';

export default {
  name: 'Main',
  props: {
  },
  data() {
    return {
      hasProfileSaved: false,
      map: null,
      hasError: false,
      profile: {name: '', location: ''},
    };
  },
  methods: {
    ...mapActions(['setCredentials']),
    async loadMap() {
      let that = this;
      this.profile = await getCollection('profiles') || {name: '', location: ''};

      L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
          attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
          id: 'mapbox/streets-v11',
          tileSize: 256,
          accessToken: 'pk.eyJ1IjoiY2FyYW5tZWdpbCIsImEiOiJja3VhazE5dXEwaGl0MndxcGdhY3pyd2ZoIn0.-ViWEiOeeUvL2Tnj4gH2Hg',
      }).addTo(this.map);

      const profiles = await getEntireCollection('profiles');
      const usernames = await getEntireCollection('usernames');
      let profilesArray = {};

      for(let key in profiles) {
        let profile = profiles[key];
        profile.uid = key;

        if (profile != null && profile.geolocation != null) {
          for (let userNameKey in usernames) {
            if (usernames[userNameKey] === key) {
              profile.username = userNameKey;
              break;
            }
            profile.username=key;
          }
          const locKey = `${profile.geolocation}`;

          if (profilesArray[locKey] === undefined) {
            profilesArray[locKey] = [profile]
          } else {
            profilesArray[locKey].push(profile);
          }
        }
      }

      for(let key in profilesArray) {
        const profiles = profilesArray[key];
        const geolocation = profiles[0].geolocation;

        profiles.sort((a,b) => a.name.localeCompare(b.name));

        const names = profiles.reduce( (previousValue, currentValue) => (previousValue == null) ? `<a href="./profile/${currentValue.username}/" target="_blank"/>${currentValue.name}</a>` : `${previousValue}, <a href="./profile/${currentValue.username}/" target="_blank"/>${currentValue.name}</a>`,  null)

        L.marker(geolocation).addTo(this.map)
            .bindPopup(names)
            .openPopup();
      }


      const defaultPosition = () => {
        that.map.setView([33.69702810000002, -84.3251817], 13)
      }

      if (this.profile && this.profile.geolocation) {
        this.map.setView(this.profile.geolocation, 13);
      } else {
        if (navigator.geolocation) { 
          navigator.geolocation.getCurrentPosition((position) => {
            that.map.setView([position.coords.latitude, position.coords.longitude], 13);
          }, () => {
            defaultPosition();
          });
        } else if (this.profile && this.profile.geolocation) {
          defaultPosition();
        }
      }
    },
    save: async function () {
      const name = document.getElementById('name').value;
      const location = document.getElementById('location').value;
      let that = this;

      let profile = {
        name,
        location,
      };
      profile.firstTime = false;
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${location.replaceAll(/\s/g, '%20')}&format=geojson`);
      const json = await response.json();
      if (json.features.length > 0) {
        const coords = json.features[0].geometry.coordinates;
        profile.geolocation = [coords[1], coords[0]];
      }
      this.hasProfileSaved = false;
      this.hasError = false;
      saveCollection('profiles', profile).then(function () {
        that.hasError = false;
        that.profile = profile;
        that.loadMap();
        that.hasProfileSaved = true;
      }).catch(function (e) {
        console.error(e);
        that.hasError = true;
      });
    },
    back: function () {
      this.$router.go(-1);
    }
  },
  async mounted() {
    // Find if there is this weird state happening
    // If so, kill the credentials and go to sign-in page.
    if (this.$store.state.user == null) {
      this.setCredentials({});
      this.$router.push('/signin');
    }

    this.map = L.map('map', { preferCanvas: false });
    this.loadMap();
  },
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
  .error {
      align-self: center;
      justify-self: center;
      color: red;
  }

  .heading { font-weight: bold; }

  #map { height: 70vh; width: 100%; }
</style>
