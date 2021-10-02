<template>
  <div class="main">
    <div><h2>Use the map below to find players in your area!</h2></div>
    <div id="map"></div>
  </div>
</template>

<script>
import 'es6-promise/auto';

export default {
  name: 'Main',
  props: {
  },
  methods: {
  },
  mounted() {
    var map = L.map('map').setView([38.883886, -94.818870], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker([38.883886, -94.818870]).addTo(map)
        .bindPopup("William Moore, Olivia Moore")
        .openPopup();
  }

}
</script>

<style scoped>
  #map { height: 75vh; }
</style>
