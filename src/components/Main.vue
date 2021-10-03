<template>
  <div class="main">
    <div><h2>Use the map below to find players in your area!</h2></div>
    <div id="map"></div>
  </div>
</template>

<script>
import L from 'leaflet';
import 'es6-promise/auto';

export default {
  name: 'Main',
  props: {
  },
  methods: {
  },
  mounted() {
    var map = L.map('map', { preferCanvas: true }).setView([38.883886, -94.818870], 13);

    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox/streets-v11',
        tileSize: 256,
        accessToken: 'pk.eyJ1IjoiY2FyYW5tZWdpbCIsImEiOiJja3VhazE5dXEwaGl0MndxcGdhY3pyd2ZoIn0.-ViWEiOeeUvL2Tnj4gH2Hg',
    }).addTo(map);

    L.marker([38.883886, -94.818870]).addTo(map)
        .bindPopup("William Moore, Olivia Moore")
        .openPopup();
  }

}
</script>

<style scoped>
  #map { height: 70vh; width: 100%; }
</style>
