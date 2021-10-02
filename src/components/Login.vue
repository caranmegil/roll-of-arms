<template>
  <div class="login">
    <h1>Welcome, kindly Dragon Dicer!</h1>
    <section class="welcome-msg">This is the Roll of Arms for the game <a href="https://www.dragondice.com">Dragon Dice <sup>TM</sup></a> by <a href="https://sfr-inc.com">SFR, Inc.</a>  It is a magnificent system for player management with many more features to come!</section>
    <div v-if="hasError" class="error">Please make sure your email and password are correct!</div>
    <div class="login-form">
        <button v-on:click="signIn">Sign In</button>
    </div>
  </div>
</template>

<script>
import 'es6-promise/auto';

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
        this.$auth.loginWithPopup();
    }
  }
}
</script>

<style scoped>
    button {
        padding-top: 13px;
        padding-bottom: 13px;
        padding-left: 35px;
        padding-right: 35px;
    }

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

    .bottom-links {
        margin-top: .5em;
        display: grid;
        align-content: center;
        justify-content: center;
        grid-auto-flow: column;
        gap: .75em;
    }

    .error {
        align-self: center;
        justify-self: center;
        color: red;
    }
</style>
