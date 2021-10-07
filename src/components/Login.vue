<template>
  <div class="login">
    <h1>Welcome, kindly Dragon Dicer!</h1>
    <section class="welcome-msg">This is the Roll of Arms for the game <a href="https://www.dragondice.com">Dragon Dice <sup>TM</sup></a> by <a href="https://sfr-inc.com">SFR, Inc.</a>  It is a magnificent system for player management with many more features to come!</section>
    <div v-if="hasError" class="error">Please make sure your email and password are correct!</div>
    <div class="login-form">
        <div class="element">
            <label for="email">email</label>
            <input id="email" type="text"/>
        </div>
        <div class="element">
            <label for="password">password</label>
            <input id="password" type="password"/>
        </div>
        <button @click="signIn">Sign In</button>
        <div class="separator"></div>
        <div class="bottom-links">
            <a @click="register">Registration</a> <a @click="forgotPassword">Forgot Password</a>
        </div>
    </div>
  </div>
</template>

<script>
import {signIntoGoogle} from '@/firebase';
import {mapActions} from 'vuex';
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
    ...mapActions(['setUser', 'setCredentials']),
    signIn: async function() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const user = await signIntoGoogle(email, password);

        if(user != null) {
            this.setCredentials({email, password,})
            this.setUser(user);
            this.hasError = false;
            this.$router.push('/');
        } else {
            this.hasError = true;
        }
    },
    register: function() {
        this.$router.push('/register');
    },
    forgotPassword: function() {
        this.$router.push('/reset');
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

    .bottom-links {
        align-items: center;
        justify-items: center;
        align-self: center;
        justify-self: center;
        margin-top: .5em;
        display: grid;
        grid-auto-flow: column;
        grid-template-columns: 1fr;
        gap: .75em;
    }

    .error {
        align-self: center;
        justify-self: center;
        color: red;
    }
</style>
