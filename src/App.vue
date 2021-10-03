<template>
  <div v-if="isLoaded && $store.state.isProfileMenuOpen" class="profile-menu-container">
    <ProfileMenu/>
  </div>
  <div v-if="isLoaded" class="roll-of-arms-body">
    <header>
      <!-- <span id="menu-button" v-if="$auth.isAuthenticated.value" class="title-bar-menu material-icons material-icons-outlined">menu</span> -->
      <span class="title-bar-banner"><img class="banner-img" src="./assets/banner.gif"/></span>
      <span v-if="$store.state.user != null && $store.state.user.photoURL == null" @click="showProfileMenu" class="title-bar-account material-icons material-icons-outlined">account_circle</span>
      <span v-if="$store.state.user != null && $store.state.user.photoURL != null" @click="showProfileMenu" class="title-bar-account"><img class="profile-image" :src="$store.state.user.photoURL"/></span>
    </header>

    <main>
      <section id="content">
        <div v-if="$store.state.userRegistrationState"><RegisterUser/>></div>
        <div v-if="!$store.state.userRegistrationState">
          <Login v-if="!$store.state.user"/>
          <Main v-if="$store.state.user"/>
        </div>
      </section>                
    </main>

    <div id="footer">
      <footer>
        <a href="https://www.sfr-inc.com/dragondice.php" target="_blank"><img src="./assets/dr-logo-large.png"/></a>
      </footer>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import 'es6-promise/auto';
import {signIntoGoogle, getCurrentUser} from '@/firebase';

import Main from './components/Main.vue';
import Login   from './components/Login.vue';
import ProfileMenu   from './components/ProfileMenu.vue';
import RegisterUser from './components/RegisterUser.vue';

export default {
  name: 'App',
  data() {
    return {
      isLoaded: false,
    }
  },
  components: {
    Login,
    Main,
    ProfileMenu,
    RegisterUser,
  },
  async mounted() {
    if(this.$store.state.credentials.email !== undefined) {
      const user = await signIntoGoogle(this.$store.state.credentials.email, this.$store.state.credentials.password);

      if (user) {
        this.setUser(getCurrentUser())
      }
    }
    this.isLoaded = true;
  },
  methods: {
    ...mapActions(['setProfileMenuState', 'setUser']),
    showProfileMenu() {
      this.setProfileMenuState(!this.$store.state.isProfileMenuOpen);
    }
  },
};
</script>

<style>
body {
    font-family: 'Roboto', sans-serif;
    padding: .5em;
    background-color: #F8F6F0;
}

@media screen and (max-width: 480px) {
    .material-icons {
        font-size: 24px !important;
    }

    .profile-image {
      width: 24px;
      height: 24px;
    }
}

@media screen and (max-width: 768px) {
    .roll-of-arms-body {
        height: 200vh;
    }

    .material-icons { 
        font-size: 32px !important;
    }

    .profile-image {
      width: 32px;
      height: 32px;
    }
}

.profile-menu-container {
  position: fixed;
  z-index: 50;
  right: 0;
  top: 50px;
  width: 10em;
  height: 100%;
}

.banner-img {
  width: 75%;
  height: 75%;
}

.material-icons { font-size: 48px; }
.profile-image {
  width: 48px;
  height: 48px;
}

.roll-of-arms-body {
    height: 95vh;
    display: grid;
    grid-template-rows: auto 1fr auto;
    grid-template-columns: 1fr;
    grid-template-areas: 'header' 'main';
}

.roll-of-arms-body > header {
    padding-bottom: .75em;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    grid-auto-flow: column;
    border-bottom: 1px solid #D3D3D3;
}

.roll-of-arms-body > header > .title-bar-menu {
    grid-row: 1;
    grid-column: 1;
    align-self: center;
    justify-self: start;
}

.roll-of-arms-body > header > .title-bar-banner {
    grid-row: 1;
    grid-column: 2;
    align-self: center;
    justify-self: start;
}

.roll-of-arms-body > header >  .title-bar-account {
    grid-row: 1;
    grid-column: 3;
    align-self: center;
    justify-self: end;
}

.roll-of-arms-body > header >  .title-bar-account:hover {
  color: red;
}

.roll-of-arms-body > main {
    display: grid;
    grid-template-rows: 1fr auto;
    grid-template-columns: 1fr minmax(0, 600px) 1fr;
    grid-area: main;
    overflow: auto;
}

.roll-of-arms-body > main > section#content {
    grid-row: 1;
    grid-column: span 4;
    padding-top: .75em
}

.roll-of-arms-body > main > section#content > * {
    overflow: auto;
}

.roll-of-arms-body > div#footer {
    border-top: 1px solid #D3D3D3;
    grid-row: 3;
    grid-column: span 4;
    align-self: auto;
    display: grid;
}

.roll-of-arms-body > div#footer > footer {
    grid-area: 1 / 1 / 1 / 3;
    align-self: center;
    justify-self: center;
}

a {
  font-weight: bold;
}

a:link, a:visited {
  color: black;
}

a:hover {
  color: red;
}
</style>
