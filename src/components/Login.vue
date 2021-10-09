<template>
  <div class="login">
    <h1>Welcome, kindly Dragon Dicer!</h1>
    <section class="welcome-msg">This is the Roll of Arms for the game <a href="https://www.dragondice.com">Dragon Dice <sup>TM</sup></a> by <a href="https://sfr-inc.com">SFR, Inc.</a>  It is a magnificent system for player and collection management with many more features to come!</section>
    <div v-if="hasError" class="error">Please make sure your email and password are correct!</div>
    <div class="login-form">
        <div class="element">
            <label for="email">email</label>
            <input id="email" type="text"/>
        </div>
        <div class="element">
            <label for="password">password</label>
            <input id="password" type="password"/>
        </div>
        <button @click="signIn">Sign In</button>
        <div class="separator"></div>
        <div class="bottom-links">
            <a @click="register">Registration</a> <a @click="forgotPassword">Forgot Password</a>
        </div>
    </div>
    <h2>Use the map below to find players in your area!</h2>
    <div id="map"></div>
  </div>
</template>

<script>
import {signIntoGoogle} from '@/firebase';
import {mapActions} from 'vuex';
import L from 'leaflet';
import {
  getEntireCollection,
} from '@/firebase';
import 'es6-promise/auto';

export default {
  name: 'Login',
  props: {
  },
  data() {
      return {
          hasError: false,
      }
  },
  async mounted() {
    let map = L.map('map', { preferCanvas: false });

    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox/streets-v11',
        tileSize: 256,
        accessToken: 'pk.eyJ1IjoiY2FyYW5tZWdpbCIsImEiOiJja3VhazE5dXEwaGl0MndxcGdhY3pyd2ZoIn0.-ViWEiOeeUvL2Tnj4gH2Hg',
    }).addTo(map);

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

      L.marker(geolocation).addTo(map)
          .bindPopup(names)
          .openPopup();
    }

    if (navigator.geolocation) { 
      navigator.geolocation.getCurrentPosition((position) => {
        map.setView([position.coords.latitude, position.coords.longitude], 13);
      }, () => {
        map.setView([33.69702810000002, -84.3251817], 13);
      });
    } else {
        map.setView([33.69702810000002, -84.3251817], 13);
    }
  },
  methods: {
    ...mapActions(['setUser', 'setCredentials']),
    signIn: async function() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const user = await signIntoGoogle(email, password);

        if(user != null) {
            this.setCredentials({email, password,})
            this.setUser(user);
            this.hasError = false;
            this.$router.push('/');
        } else {
            this.hasError = true;
        }
    },
    register: function() {
        this.$router.push('/register');
    },
    forgotPassword: function() {
        this.$router.push('/reset');
    }
  }
}
</script>

<style scoped>
    .login {
        display: grid;
        grid-auto-flow: row;
        grid-template-columns: auto;
        gap: .5em;
    }

    .login h1 {
        align-self: center;
        justify-self: center;
    }

    .welcome-msg {
        align-self: center;
        justify-self: center;
    }

    .login-form {
        margin-top: 2em;
        display: grid;
        justify-self: center;
        align-content: center;
        justify-content: center;
        grid-auto-flow: row;
        gap: .5em;
    }

    .login-form .element {
        align-self: center;
        justify-self: center;
        display: grid;
        grid-auto-flow: column;
        grid-template-columns: 1fr 1fr;
    }

    .login-form .element > label {
        font-weight: bold;
        justify-self: start;
        align-self: start;
    }

    .separator {
        border-top: 1px solid #D3D3D3;
    }

    .bottom-links {
        align-items: center;
        justify-items: center;
        align-self: center;
        justify-self: center;
        margin-top: .5em;
        display: grid;
        grid-auto-flow: column;
        grid-template-columns: 1fr;
        gap: .75em;
    }

    .error {
        align-self: center;
        justify-self: center;
        color: red;
    }

    #map { height: 50vh; width: 100%; }
</style>
