<template>
  <div class="main">
    <div><h2>Use the map below to find players in your area!</h2></div>
    <div id="map"></div>
  </div>
</template>

<script>
import L from 'leaflet';
import { getCollection, getEntireCollection } from '@/firebase';
import 'es6-promise/auto';

export default {
  name: 'Main',
  props: {
  },
  methods: {
  },
  async mounted() {
    const profile = await getCollection('profiles');

    if ( profile != null && profile.geolocation != null ) {
      let map = L.map('map', { preferCanvas: true });

      L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
          attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
          id: 'mapbox/streets-v11',
          tileSize: 256,
          accessToken: 'pk.eyJ1IjoiY2FyYW5tZWdpbCIsImEiOiJja3VhazE5dXEwaGl0MndxcGdhY3pyd2ZoIn0.-ViWEiOeeUvL2Tnj4gH2Hg',
      }).addTo(map);

      const profiles = await getEntireCollection('profiles');
      let profilesArray = {};

      for(let key in profiles) {
        const profile = profiles[key];

        if (profile != null && profile.geolocation != null) {
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

        const names = profiles.reduce( (previousValue, currentValue) => (previousValue == null) ? currentValue.name : `${previousValue}, ${currentValue.name}`,  null)

        L.marker(geolocation).addTo(map)
            .bindPopup(names)
            .openPopup();
      }

      map.setView(profile.geolocation, 13);
    } else {
      let mapElem = document.getElementById('map');
      mapElem.innerText = 'Please enter a valid location in your profile or you may need to get fairly specific (but do not enter your exact address).';
    }
  }

}
</script>

<style scoped>
  #map { height: 70vh; width: 100%; }
</style>
