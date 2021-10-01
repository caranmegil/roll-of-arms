<template>
  <div class="login">
    <h1>Welcome, kindly Dragon Dicer!</h1>
    <section class="welcome-msg">This is the Roll of Arms for the game <a href="https://www.dragondice.com">Dragon Dice <sup>TM</sup></a> by <a href="https://sfr-inc.com">SFR, Inc.</a>  It is a magnificent system for player management with many more features to come!</section>
    <div v-if="hasError" class="error">Please make sure your email and password are correct!</div>
    <div class="login-form">
        <div class="element">
            <label for="email">Email</label>
            <input id="email" type="text"/>
        </div>
        <div class="element">
            <label for="password">Password</label>
            <input id="password" type="password"/>
        </div>
        <button v-on:click="signIn">Sign In</button>
        <div class="bottom-links">
            <a href="./api/login">Register</a>
            <a href="./api/forgot-password">Forgot Password</a>
        </div>
    </div>
  </div>
</template>

<script>
import 'es6-promise/auto';
import { mapActions } from 'vuex';

export default {
  name: 'Login',
  props: {
  },
  data() {
      return {
          hasError: false,
      }
  },
  methods: {
    signIn: function() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (email === 'a' && password === 'a') {
            this.setAuthenticated(true);
        } else {
            this.hasError = true;
        }
    },
    ...mapActions(['setAuthenticated'])
  }
}
</script>

<style scoped>
    .login {
        display: grid;
        grid-template-flow: row;
        grid-template-columns: auto;
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
        display: grid;
        justify-self: center;
        align-content: center;
        justify-content: center;
    }

    .login-form .element {
        align-self: center;
        justify-self: center;
        display: grid;
        grid-auto-flow: column;
        grid-template-columns: auto;
        grid-template-rows: 1fr 1fr 1fr;
        margin-bottom: .5em;
    }

    .login-form .element > label {
        font-weight: bold;
        justify-self: start;
        padding: .25em;
        margin-right: .75em;
    }

    .login-form .element > input {
        padding: .25em;
    }

    .separator {
        border-top: 1px solid #D3D3D3;
    }

    .bottom-links {
        border-top: 2px solid black;
        display: grid;
        align-content: center;
        justify-content: center;
        grid-auto-flow: column;
        gap: 1.25em;
    }

    .error {
        align-self: center;
        justify-self: center;
        color: red;
    }
</style>
