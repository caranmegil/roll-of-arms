<template>
  <div class="login">
    <h1>Hey, Dragon Dicer!</h1>
    <section class="welcome-msg">Want to change email?  No problem!</section>
    <div v-if="hasError" class="alert-box error">{{message}}</div>
    <div v-if="hasSuccess" class="alert-box success">Please, check your email account and spam/junk folder for a confirmation!</div>
    <div class="login-form">
        <div class="element">
            <label for="email">new email</label>
            <input id="email" v-model="email" type="text"/>
        </div>
        <div class="element">
            <label for="password">current password</label>
            <input id="password" v-model="password" type="password"/>
        </div>

        <button @click="changeEmail">Change Email!</button>
    </div>
  </div>
</template>

<script>
import {
    createUserInGoogle,
    getCollectionByField,
    getEntireCollection,
    saveCollectionByField,
} from '@/firebase';
import {
    mapActions
} from 'vuex';
import 'es6-promise/auto';

export default {
  name: 'AccountTransfer',
  props: {
  },
  data() {
      return {
          hasError: false,
          hasSuccess: false,
          message: '',
          email: '',
          password: '',
      }
  },
  methods: {
      ...mapActions(['signOut',]),
    async changeEmail() {
        try {
            if (this.email === '' || this.password === '') {
                this.message = 'Please make sure your email and password are correct!';
                this.hasError = true;
            } else if (this.password != null && this.password.trim() !== '') {
                const user = this.$store.state.user;
                // Create new user account
                const newCreds = await createUserInGoogle(this.email, this.password);
                const newUser = newCreds.user;

                if (newCreds) {
                    // Update Username collection to new User ID.
                    const usernames = await getEntireCollection('usernames') || {};
                    const username = Object.keys(usernames).filter(username => usernames[username] === user.uid)[0] || null;
                    saveCollectionByField('usernames', username, newUser.uid);

                    // Update Collection collection to new User ID.
                    const collection = await getCollectionByField('collections', user.uid);
                    saveCollectionByField('collections', newUser.uid, collection);

                    // Update Profile collection to new User ID.
                    const profile = await getCollectionByField('profiles', user.uid);
                    saveCollectionByField('profiles', newUser.uid, profile);

                    this.signOut();
                    this.hasSuccess = true;
                    this.hasError = false;
                    this.$router.push('/');
                }
            } else {
                this.message = 'Please make sure your password is correct!';
                this.hasSuccess = false;
                this.hasError = true;
            }
        } catch (e) {
            switch(e.code) {
                case 'auth/invalid-email':
                    this.message = 'The email address is invalid!';
                    break;
                case 'auth/email-already-in-use':
                    this.message = 'The email entered is already in use!';
                    break;
                case 'auth/requires-recent-login':
                    this.message = 'Please, sign in again!';
                    break;
                case 'auth/wrong-password':
                    this.message = 'Please, enter a valid password.';
                    break;
                default:
                    this.message = 'There was an unknown error!';
                    console.error(e);
                    break;
            }

            this.hasSuccess = false;
            this.hasError = true;
        }
    },
  }
}
</script>

<style scoped>
    .login {
        display: grid;
        grid-auto-flow: row;
        grid-template-columns: auto;
        gap: .5em;
    }

    .login h1 {
        align-self: center;
        justify-self: center;
    }

    .welcome-msg {
        align-self: center;
        justify-self: center;
    }

    .login-form {
        margin-top: 2em;
        display: grid;
        justify-self: center;
        align-content: center;
        justify-content: center;
        grid-auto-flow: row;
        gap: .5em;
    }

    .login-form .element {
        align-self: center;
        justify-self: center;
        display: grid;
        grid-auto-flow: column;
        grid-template-columns: 1fr 1fr;
    }

    .login-form .element > label {
        font-weight: bold;
        justify-self: start;
        align-self: start;
    }


   .separator {
        border-top: 1px solid #D3D3D3;
    }

    .error {
        align-self: center;
        justify-self: center;
        color: red;
    }

    .success {
        align-self: center;
        justify-self: center;
    }
</style>
