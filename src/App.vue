<template>
  <div v-if="isLoaded" class="roll-of-arms-body">
    <header>
      <!-- <span id="menu-button" v-if="$store.state.isAuthenticated" class="title-bar-menu material-icons material-icons-outlined">menu</span> -->
      <span class="title-bar-banner"><img class="banner-img" src="./assets/banner.gif"/></span>
      <span id="account-button" v-if="$store.state.isAuthenticated" class="title-bar-account material-icons material-icons-outlined">account_circle</span>
    </header>

    <main>
      <section id="content">
        <Login v-if="!$store.state.isAuthenticated"/>
        <Main v-if="$store.state.isAuthenticated"/>
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
import 'es6-promise/auto';

import Main from './components/Main.vue';
import Login from './components/Login.vue';

export default {
  name: 'App',
  data() {
    return {
      isLoaded: false,
    }
  },
  components: {
    Login,
    Main
  },
  mounted() {
    this.isLoaded = true;
  }
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
}

@media screen and (max-width: 768px) {
    .roll-of-arms-body {
        height: 200vh;
    }

    .material-icons { 
        font-size: 32px !important;
    }
}

.banner-img {
  width: 75%;
  height: 75%;
}

.material-icons { font-size: 48px; }

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
