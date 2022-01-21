<template>
    <div @click="toggleMenu" class="menu-overlay"></div>
  <div v-if="isLoaded" class="roll-of-arms-body">
    <header>
      <div class="menu-button" @click="toggleMenu" v-if="$store.state.user != null && $store.state.user.emailVerified"><span id="menu-button" class="title-bar-menu material-icons material-icons-outlined">menu</span> Menu</div>
      <span class="title-bar-banner"><img class="banner-img" src="./assets/banner.webp"/></span>
    </header>
    <div id="menu" class="menu-container">
      <div @click="closeMenu" class="menu-item"><span class="material-icons material-icons-outlined">close</span></div>
      <div @click="goHome" class="menu-item"><span class="material-icons material-icons-outlined">public</span> Player Map</div>
      <div class="separator"></div>
      <div @click="openProfileEdit" class="menu-item"><span class="material-icons material-icons-outlined">person</span> My Profile</div>
      <div @click="resetPassword" class="menu-item"><span class="material-icons material-icons-outlined">lock</span> Reset Password</div>
      <div class="separator"></div>
      <div @click="editCollection" class="menu-item"><span class="material-icons material-icons-outlined">list</span> My Collection</div>
      <div class="separator"></div>
      <div @click="editForces" class="menu-item"><span class="material-icons material-icons-outlined">construction</span> My Forces</div>
      <div class="separator"></div>
      <div @click="logoff" class="menu-item"><span class="material-icons material-icons-outlined">logout</span> Sign Off</div>
    </div>

    <main>
      <section id="content">
        <router-view v-slot="{ Component }">
            <component :is="Component" :key="$route.path"/> 
        </router-view>
      </section>
    </main>

    <div id="footer">
      <footer>
        <a href="https://www.sfr-inc.com/dragondice.php" target="_blank"><img src="./assets/dr-logo-large.webp"/></a>
      </footer>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import 'es6-promise/auto';
import {
  signOutOfGoogle,
} from '@/firebase';

export default {
  name: 'App',
  data() {
    return {
      isLoaded: false,
    }
  },
  components: {
  },
  async beforeMount() {
    this.isLoaded = true;
  },
  methods: {
    ...mapActions(['setUser', 'signOut', 'setDice', 'setForcesDice',]),
    resetPassword: function() {
      this.toggleMenu();
      this.$router.push('/reset');
    },
    closeMenu: function() {
      this.toggleMenu();
    },
    goHome: function() {
      this.toggleMenu();
      this.$router.push('/');
    },
    toggleMenu: function() {
      let menuElem = document.getElementById('menu');
      let menuOverlay = document.querySelector('.menu-overlay');

      if(window.getComputedStyle(menuElem).display === 'none') {
        menuElem.style.display = 'block';
        menuOverlay.style.display = 'block';
      } else {
        menuElem.style.display = 'none';
        menuOverlay.style.display = 'none';
      }
    },
    openProfileEdit: function () {
      this.toggleMenu();
      this.$router.push('/profile');
    },
    editCollection: function () {
      this.toggleMenu();
      this.$router.push('/my-collection');
    },
    editForces: function () {
      this.toggleMenu();
      this.$router.push('/my-forces');
    },
    openDiceBrowser: function () {
      this.toggleMenu();
      this.$router.push('/dicebrowser');
    },
    logoff: async function () {
      const isSignedOut = await signOutOfGoogle();

      if (isSignedOut) {
        this.toggleMenu();
        this.signOut();
        this.$router.push('/signin');
      }
    },
  },
};
</script>

<style>
body {
    font-family: 'Roboto', sans-serif;
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

  .image-icon {
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

  .image-icon {
    width: 32px;
    height: 32px;
  }

  .profile-image {
      width: 32px;
      height: 32px;
    }
}

button {
  border-radius: .75em;
  padding: .5em;
  color: ivory;
  background-color: #525252;
}

.menu-container {
  background-color: ivory;
  display: none;
  position: fixed;
  z-index: 9999999;
  left: 0;
  top: 0em;
  width: 20em;
  height: 100%;
  align-items: start;
  justify-items: start;
  grid-auto-flow: row;
}

.menu-overlay {
  display: none;
  background-color: #D3D3D3;
  position: fixed;
  top: 0;
  left: 0;
  opacity: .5;
  width: 100%;
  height: 100%;
  z-index: 9999998;
}

.image-icon {
  width: 48px;
  height: 48px;
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
    padding-left: .05em;
    padding-right: 1.5em;
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
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: 1fr 1fr;
}

.menu-button {
  display: grid;
  grid-auto-flow: row;
  grid-template-columns: auto 1fr;
  align-items: center;
  padding-right: 1em;
}

.menu-item {
  display: grid;
  grid-auto-flow: column;
  grid-template-columns: auto 1fr;
  align-items: center;
  padding: 2px;
}

.menu-item:hover {
  border-bottom: 2px solid red;
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

.roll-of-arms-body > div#footer {
    border-top: 1px solid #D3D3D3;
    grid-row: 3;
    grid-column: span 4;
    align-self: auto;
    display: grid;
}

.roll-of-arms-body > div#footer > footer {
    grid-area: 1 / 1 / 1 / 4;
    align-self: center;
    justify-self: center;
}

.separator {
  border-bottom: 1px solid #D3D3D3;
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
