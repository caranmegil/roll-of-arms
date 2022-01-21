<template>
  <div class="login">
    <h1>Hey, Dragon Dicer!</h1>
    <section class="welcome-msg">Time to register!</section>
    <div v-if="hasError" class="error">{{message}}</div>
    <div class="login-form">
        <div class="element">
            <label for="username">username</label>
            <input id="username" v-model="username" type="text"/>
        </div>
            <div class="element">
            <label for="email">email</label>
            <input id="email" v-model="email" type="text"/>
        </div>
        <div class="element">
            <label for="password">password</label>
            <input id="password" v-model="password" type="password"/>
        </div>
        <div class="element">
            <label for="retype-password">Re-type password</label>
            <input id="retype-password" v-model="password2" type="password"/>
        </div>
        <button @click="register">Register!</button>
        <div class="separator"></div>
        <a class="element" @click="back">Back</a>
    </div>
  </div>
</template>

<script>
import {
    createUserInGoogle,
    getEntireCollection,
    saveCollectionByField,
} from '@/firebase';
import {mapActions} from 'vuex';
import 'es6-promise/auto';

export default {
  name: 'RegisterUser',
  props: {
  },
  data() {
      return {
          email: null,
          hasError: false,
          message: null,
          password: '',
          password2: '',
          username: '',
      }
  },
  methods: {
    ...mapActions(['setUser', 'setCredentials']),
    back() {
        this.$router.go(-1);
    },
    async register() {
        try {
            this.username = (this.username == null) ? '' :  this.username.trim() 

            if (this.username === '') {
                this.message = 'Please make sure your username is correct!';
                this.hasError = true;
            } else if (this.password != null && this.password.trim() !== '' && this.password === this.password2) {
                if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{6,}/.test(this.password)) {
                    this.message = 'Please make sure your password is at least 6 characters and contains letters, numbers, and special symbols.';
                    this.hasError = true;
                    return;
                }

                const usernames = await getEntireCollection('usernames');
                if ( !Object.keys(usernames).includes(this.username) ) {
                    const cred = await createUserInGoogle(this.email, this.password);
                    if (cred) {
                        if (saveCollectionByField('usernames', this.username, cred.user.uid)) {
                            this.setCredentials({email: this.email, password: this.password});
                            this.$router.push('/verifywarn');
                            this.hasError = false;
                        }
                    } else {
                        this.message = 'Unable to create account.';
                        this.hasError = true;
                    }
                } else {
                    this.message = 'Please make sure your username is correct!';
                    this.hasError = true;
                }
            } else {
                this.message = 'Please make sure the password fields match!';
                this.hasError = true;
            }
        } catch (e) {
            if (e.code === 'auth/email-already-in-use') {
                this.hasError = true;
                this.message = 'This email address is already in use.';
            } else {
                this.hasError = true;
                this.message = 'Please make sure the form is filled out correctly!';
            }
        }
    }
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
</style>
