<template>
  <div class="login">
    <h1>Hey, Dragon Dicer!</h1>
    <section class="welcome-msg">Time to register!</section>
    <div v-if="hasError" class="error">Please make sure the form is filled out correctly!</div>
    <div class="login-form">
        <div class="element">
            <label for="email">email</label>
            <input id="email" type="text"/>
        </div>
        <div class="element">
            <label for="password">password</label>
            <input id="password" type="password"/>
        </div>
        <div class="element">
            <label for="retype-password">Re-type password</label>
            <input id="retype-password" type="password"/>
        </div>
        <button @click="register">Register!</button>
    </div>
  </div>
</template>

<script>
import {createUserInGoogle} from '@/firebase';
import {mapActions} from 'vuex';
import 'es6-promise/auto';

export default {
  name: 'RegisterUser',
  props: {
  },
  data() {
      return {
          hasError: false,
      }
  },
  methods: {
    ...mapActions(['setUser', 'setCredentials', 'setUserRegistrationState']),
    register: async function() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        const user = await createUserInGoogle(email, password);

        if(user != null) {
            this.setCredentials({email, password,})
            this.setUser(user);
            this.setUserRegistrationState(false);
            this.hasError = false;
        } else {
            this.hasError = true;
        }
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
</style>
