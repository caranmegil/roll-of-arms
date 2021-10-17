<template>
    <div class="profiles">
      <h1>Profile Edit</h1>
        <div v-if="hasError" class="error">Please make sure the form is filled out correctly!</div>
        <div v-if="hasProfileSaved" class="saved">You successfully saved your profile settings!</div>
        <div class="element">
            <label for="name">Name</label>
            <input id="name" v-model="profile.name" type="text"/>
        </div>
        <div class="element">
            <label for="facebook">Facebook User ID</label>
            <input id="facebook" v-model="profile.facebook" type="text"/>
        </div>
        <h3>Discord Information (<a href="https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID" target="_blank">Where can I find it?</a>)</h3>
        <div class="social">
            <div class="element">
                <label for="discord">Handle</label>
                <input id="discord" v-model="profile.discord" type="text"/>
            </div>
            <div class="element">
                <label for="discordNum">ID</label>
                <input id="discordNum" v-model="profile.discord_number" type="text"/>
            </div>
        </div>
        <button @click="save">Save!</button>
    </div>
</template>

<script>
import {
  saveCollection,
  getCollection,
  resetPasswordInGoogle,
} from '@/firebase';
import 'es6-promise/auto';

export default {
  name: 'ProfileEdit',
  props: {
  },
  data() {
    return {
      hasProfileSaved: false,
      hasError: false,
      profile: {},
    };
  },
  methods: {
    changePassword: async function () {
      await resetPasswordInGoogle(this.$store.state.credentials.email);
      this.$router.go(-1);
    },
    async save() {
      let that = this;

      this.profile.firstTime = false;
      this.hasProfileSaved = false;
      this.hasError = false;
      console.log(this.profile);
      saveCollection('profiles', this.profile).then(function () {
        that.hasError = false;
        that.hasProfileSaved = true;
      }).catch(function (e) {
        console.error(e);
        that.hasError = true;
      });
    },
  },
  async mounted() {
    this.profile = await getCollection('profiles') || {};
  }
}
</script>

<style scoped>
  .profiles {
    display: grid;
    align-content: center;
    justify-content: center;
    justify-items: center;
    align-items: center;
    gap: .5em;
  }

  .profiles button {
    width: 100%;
  }

  .profiles h1 {
    align-self: center;
    justify-self: center;    
  }

  .profiles .element {
    align-self: center;
    justify-self: center;
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: 1fr 1fr;
  }

  .profiles .element > label {
    font-weight: bold;
    justify-self: start;
    align-self: start;
  }

  .separator {
    border-bottom: 1px solid #D3D3D3;
  }

  .social {
    display: grid;
    grid-auto-flow: column;
    gap: .5em;
  }

  .error {
      align-self: center;
      justify-self: center;
      color: red;
  }
</style>
