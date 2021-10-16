<template>
    <div id="map"></div>
</template>

<script>
import L from 'leaflet';

import {
  getCollection,
  getEntireCollection,
} from '@/firebase';

export default {
    name: 'Map',
    data() {
        return {
            profile: null,
        }
    },
    async mounted() {
        this.map = L.map('map', { preferCanvas: false });
        let that = this;
        this.profile = await getCollection('profiles') || null;

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

            const names = profiles.reduce( (previousValue, currentValue) => (previousValue == null) ? `<a href="./profile/${currentValue.username}/" target="_blank"/>${currentValue.username}</a>` : `${previousValue}, <a href="./profile/${currentValue.username}/" target="_blank"/>${currentValue.username}</a>`,  null)

            L.marker(geolocation).addTo(this.map)
                .bindPopup(names)
                .openPopup();
        }


        const defaultPosition = () => {
            that.map.setView([33.69702810000002, -84.3251817], 13)
        }

        if (this.profile && this.profile.geolocation) {
            this.map.setView(this.profile.geolocation, 13);
        } else if (navigator.geolocation) { 
            navigator.geolocation.getCurrentPosition((position) => {
            that.map.setView([position.coords.latitude, position.coords.longitude], 13);
            }, () => {
            defaultPosition();
            });
        } else {
            defaultPosition();
        }
    }
}
</script>

<style scoped>
  #map { height: 55vh; width: 100%; }
</style>