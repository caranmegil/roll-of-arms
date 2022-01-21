<template>
  <div class="login">
    <h1>Hey, Dragon Dicer!</h1>
    <section class="welcome-msg" v-if="$store.state.credentials == null || !$store.state.credentials.email">Forgot your passord?  No problem!</section>
    <section class="welcome-msg" v-if="$store.state.credentials != null && $store.state.credentials.email">Want to reset your password?  No problem!</section>
    <div v-if="hasError" class="error">Please make sure the email is entered!</div>
    <div v-if="hasSuccess" class="success">Please, check your email for a password reset!</div>
    <div class="login-form" v-if="$store.state.credentials == null || !$store.state.credentials.email">
        <div class="element">
            <label for="email">email</label>
            <input id="email" type="text"/>
        </div>
        <button @click="register">Reset Password!</button>
        <div class="separator"></div>
        <a class="element" @click="back">Back</a>
    </div>
    <div class="login-form" v-if="$store.state.credentials != null && $store.state.credentials.email">
        <button @click="resetCurrentUser">Reset Password for {{$store.state.credentials.email}}!</button>
    </div>
  </div>
</template>

<script>
import {resetPasswordInGoogle} from '@/firebase';
import 'es6-promise/auto';

export default {
  name: 'ResetPassword',
  props: {
  },
  data() {
      return {
          hasError: false,
          hasSuccess: false,
      }
  },
  methods: {
    back() {
        this.$router.go(-1);
    },
    async resetCurrentUser() {
        const wasReset = await resetPasswordInGoogle(this.$store.state.credentials.email);

        if(wasReset) {
            this.hasSuccess = true;
            this.hasError = false;
        } else {
            this.hasSuccess = false;
            this.hasError = true;
        }
    },
    async register() {
        const email = document.getElementById('email').value;
        
        const wasReset = await resetPasswordInGoogle(email);

        if(wasReset) {
            this.hasSuccess = true;
            this.hasError = false;
        } else {
            this.hasSuccess = false;
            this.hasError = true;
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

    .success {
        align-self: center;
        justify-self: center;
    }
</style>
