<template>
    <div @click="toggleMenu" class="menu-overlay"></div>
      <div class="dialog" :style="{visibility: (profile && profile.proposedDiscord) ? 'visible' : 'hidden'}">
        <div class="modal">
          <div>Would you like to approve the Discord link request from "{{ (profile && profile.proposedDiscord) ? profile.proposedDiscord.handle : ''}}"?</div>
          <div class="element">
            <button id="noBtn" @click="onNo">No</button>
            <button id="yesBtn" @click="onYes">Yes</button>
          </div>
        </div>
      </div>
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
      <!-- <div @click="changeEmail" class="menu-item"><span class="material-icons material-icons-outlined">email</span> Change Email</div> -->
      <div class="separator"></div>
      <div @click="editCollection" class="menu-item"><span class="material-icons material-icons-outlined">list</span> My Collection</div>
      <div>
        <div class="separator"></div>
        <div @click="editForces" class="menu-item"><span class="material-icons material-icons-outlined">construction</span> My Forces</div>
      </div>
      <div class="separator"></div>
      <div @click="resources" class="menu-item"><span class="material-icons material-icons-outlined">link</span> Links</div>
      <div class="separator"></div>
      <div @click="releaseNotes" class="menu-item"><span class="material-icons material-icons-outlined">note</span> Release Notes</div>
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
  getCollectionByField,
  saveCollectionByField,
} from '@/firebase';

export default {
  name: 'App',
  data() {
    return {
      profile: undefined,
      isLoaded: false,
    }
  },
  components: {
  },
  beforeMount() {
    this.isLoaded = true;
  },
  async mounted() {
    // Convert profile privacy
    const user = this.$store.state.user;
    if (user != null) {
      try {
        this.profile = await getCollectionByField('profiles', user.uid);

        if (this.profile.isPublic) {
          this.profile.visibility = '1';
          this.profile.isPublic = null;
          await saveCollectionByField('profiles', user.uid, this.profile);
        }

        const now = new Date();
        if (this.profile.proposedDiscord && this.profile.proposedDiscord.timestamp <= now.getTime()) {
          this.profile.proposedDiscord = null;
          await saveCollectionByField('profiles', user.uid, this.profile);
        }
      } catch (e) {
        console.error(e);
      }
    }
  },
  methods: {
    ...mapActions(['setUser', 'signOut', 'setDice', 'setForcesDice',]),
    changeEmail() {
      this.toggleMenu();
      this.$router.push('/account-transfer');
    },
    releaseNotes() {
      this.toggleMenu();
      this.$router.push('/releasenotes');
    },
    resources() {
      this.toggleMenu();
      this.$router.push('/resources');
    },
    closeMenu() {
      this.toggleMenu();
    },
    goHome() {
      this.toggleMenu();
      this.$router.push('/');
    },
    async onNo() {
      const user = this.$store.state.user;
      if (user != null) {
        this.profile.proposedDiscord = null;
        await saveCollectionByField('profiles', user.uid, this.profile);
        this.$router.go();
      }
    },
    async onYes() {
      const user = this.$store.state.user;
      if (user != null) {
        this.profile.discord_number = this.profile.proposedDiscord.id;
        this.profile.discord = this.profile.proposedDiscord.handle;
        this.profile.proposedDiscord = null;
        await saveCollectionByField('profiles', user.uid, this.profile);
        this.$router.go();
      }
    },
    toggleMenu() {
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
    openProfileEdit () {
      this.toggleMenu();
      this.$router.push('/profile');
    },
    editCollection () {
      this.toggleMenu();
      this.$router.push('/my-collection');
    },
    editForces () {
      this.toggleMenu();
      this.$router.push('/my-forces');
    },
    openDiceBrowser () {
      this.toggleMenu();
      this.$router.push('/dicebrowser');
    },
    async logoff() {
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
    background-image: url('assets/background.webp');
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
    border-bottom: 1px solid black;
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
    border-top: 1px solid black;
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

.alert-box {
  border: 1px solid black;
  background: ivory;
  padding: .75em;
  border-radius: .25em;
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


  .dialog {
    display: grid;
    width: 100%;
    align-items: center;
    justify-items: center;
  }
  .modal {
    display: grid;
    justify-content: center;
    justify-items: center;
    align-items: center;
    align-content: center;
    z-index: 2;
    position: fixed;
    background-color: ivory;
    margin: auto;
    top: 10em;
    width: 20em;
    padding: 1.5em;
    border-radius: .25em;
    border: 1px solid black;
    z-index: 999999;
  }
  .modal-overlay {
    background-color: #D3D3D3;
    position: fixed;
    top: 0;
    left: 0;
    opacity: .5;
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  .element {
    align-self: center;
    justify-self: center;
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: 1fr 1fr;
    padding-bottom: .5em;
    gap: .75em;
  }

  .element > label {
    font-weight: bold;
    justify-self: end;
    align-self: center;
    padding-right: .5em;
  }

  .rerun-tour {
    font-size: 2em !important;
    position: absolute;
    right: 0px;
    z-index: 1;
  }

</style>
