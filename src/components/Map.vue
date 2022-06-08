<template>
    <div class="element">
      <button @click="recenterMap">Re-Center</button>
    </div>

    <div id="map"></div>
</template>

<script>
import L from 'leaflet';

import discord from '@/assets/discord.png';

import {
  getCollection,
  getEntireCollection,
} from '@/firebase';

export default {
    name: 'MapView',
    data() {
        return {
            profile: null,
            map: null,
        }
    },
    async mounted() {
        this.map = L.map('map', {maxZoom: 16, minZoom: 2}).fitWorld().setMaxBounds([[-90,-180],[90,180]]);
        this.profile = await getCollection('profiles') || null;

        L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            id: 'mapbox/streets-v11',
            tileSize: 512,
            zoomOffset: -1,
            worldCopyJump: true,
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
            }

            // for those older profiles that do not have a name,
            // set to username per the ProfileEdit.vue
            if (!profile.name || profile.name.trim() === '') {
                profile.name = profile.username;
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

            const names = profiles.reduce( (previousValue, currentValue) => {
                const discordLink = ((currentValue.discord_number) ? `<a href="https://discordapp.com/users/${currentValue.discord_number}" target="_blank"><img height="15px" src="${discord}"/></a>` : '');
                return (previousValue == null) ? discordLink + `<a href="./profile/${currentValue.username}/" target="_blank"/>${currentValue.name}</a>` : `${previousValue}, ` + discordLink + `<a href="./profile/${currentValue.username}/" target="_blank"/>${currentValue.name}</a>`;
            },  null);
            L.marker(geolocation).addTo(this.map)
                .bindPopup(names)
                .openPopup();
        }
        this.recenterMap();
    },
    methods: {
        recenterMap() {
            let that = this;
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
}
</script>

<style scoped>
    #map {
        height: 60vh;
        width: 95%;
    }
  .element {
    align-self: center;
    justify-self: center;
    display: grid;
    grid-auto-flow: column;
  }

  .element > label {
    font-weight: bold;
    justify-self: end;
    align-self: start;
    padding-right: .5em;
  }
</style>