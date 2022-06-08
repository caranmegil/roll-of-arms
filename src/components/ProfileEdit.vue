<template>
    <v-tour name="profileTour" :steps="steps" :callbacks="tourCallbacks"></v-tour>
    <div class="profiles">
      <h1>My Profile <a id="profileURL" class="material-icons material-icons-outlined" :href="`${getProfileLink()}`" target="_blank">link</a></h1>
        <div v-if="hasError" class="error">Please make sure the form is filled out correctly!</div>
        <div v-if="hasProfileSaved" class="alert-box saved">Profile updated!</div>
        <div class="element">
            <label for="visibility">Visibility</label>
            <select id="visibility" v-model="profile.visibility" @click="() => hasProfileSaved = false" style="width: 11.5em;">
                <option value="0" :selected="(profile.visibility === '0') ?  'selected' : ''">Private</option>
                <option value="1" :selected="(profile.visibility === '1') ?  'selected' : ''">Users Only</option>
                <option value="2" :selected="(profile.visibility === '2') ?  'selected' : ''">Anyone</option>
            </select>
        </div>
        <div class="element">
            <label for="name">Name</label>
            <input id="name" v-model="profile.name" @click="() => hasProfileSaved = false" type="text"/>
        </div>
        <h3>Discord Information (<a href="https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID" target="_blank">Where can I find it?</a>)</h3>
        <div class="social">
            <div class="element">
                <label for="discord">Handle</label>
                <input id="discord" v-model="profile.discord" @click="() => hasProfileSaved = false" type="text"/>
            </div>
            <div class="element">
                <label for="discordNum">ID</label>
                <input id="discordNum" v-model="profile.discord_number" @click="() => hasProfileSaved = false" type="text"/>
            </div>
        </div>
        <button @click="resetPassword">Reset Password!</button>
        <button @click="save">Save!</button>
    </div>
</template>

<script>
import {
  saveCollection,
  getCollection,
  getEntireCollection,
  resetPasswordInGoogle,
} from '@/firebase';
import 'es6-promise/auto';

export default {
  name: 'ProfileEdit',
  props: {
  },
  data() {
    return {
      isLoading: false,
      hasProfileSaved: false,
      hasError: false,
      profile: {},
      username: null,
      tourCallbacks: {
        onSkip: this.noMoreTours,
        onFinish: this.noMoreTours,
      },
      steps: [
        {
          target: '#profileURL',
          header: {
            title: 'Your Profile!',
          },
          content: 'Press this to open up the profile as it would appear either to other Roll of Arms users or to the public.',
        },
        {
          target: '#visibility',
          header: {
            title: 'Visibility!',
          },
          content: 'Change how visible your profile is, whether nobody, only Roll of Arms users, or the entire world can view it.',
        },
        {
          target: '#name',
          header: {
            title: 'Your name!',
          },
          content: 'This is your public name!',
        },
        {
          target: '.social',
          header: {
            title: 'Discord!',
          },
          content: 'Your discord information!',
        },
      ],
    };
  },
  methods: {
    async noMoreTours() {
      let profile = await getCollection('profiles');
      profile.profileTour = false;
      saveCollection('profiles', profile);
    },
    async changePassword() {
      await resetPasswordInGoogle(this.$store.state.credentials.email);
      this.$router.go(-1);
    },
    getProfileLink() {
      return `${location.protocol}//${location.hostname}${(location.port) ? ':' + location.port : ''}/profile/${this.username}/`;
    },
    resetPassword() {
      this.$router.push('/reset');
    },
    async save() {
      let that = this;

      this.profile.firstTime = false;
      this.hasProfileSaved = false;
      this.hasError = false;

      this.profile.name = this.username;

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
    let profile = await getCollection('profiles') || {};
    if (!profile.visibility) {
      profile.visibility = '0';
    }
    this.isLoading = true;
    const usernames = await getEntireCollection('usernames');

    for (let userNameKey in usernames) {
        if (usernames[userNameKey] === this.$store.state.user.uid) {
            this.username = userNameKey;
            break;
        }
    }

    // for those older profiles that do not have a name,
    // set to username per the ProfileEdit.vue
    if (!profile.name || profile.name.trim() === '') {
        profile.name = this.username;
    }
    this.profile = profile;
    this.isLoading = false;

    if (profile.profileTour || profile.profileTour === undefined) {
      this.$tours['profileTour'].start();
    }
  }
}
</script>

<style scoped>
.material-icons { font-size: 16px; }
  @media screen and (max-width: 480px) {
    .social {
      display: grid;
      grid-auto-flow: row;
      grid-template-rows: 1fr 1fr;
      gap: .5em;
    }
  }
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
    justify-self: center;
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: 1fr 1fr;
    gap: .5em;
  }

  .profiles .element > label {
    font-weight: bold;
    justify-self: start;
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
