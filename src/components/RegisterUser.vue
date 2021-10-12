<template>
  <div class="login">
    <h1>Hey, Dragon Dicer!</h1>
    <section class="welcome-msg">Time to register!</section>
    <div v-if="hasError" class="error">{{message}}</div>
    <div class="login-form">
        <div class="element">
            <label for="email">email</label>
            <input id="email" v-model="email" type="text"/>
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
    resendEmailWithLink,
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
      }
  },
  methods: {
    ...mapActions(['setUser', 'setCredentials']),
    generateSecureRandomPassword() {
        function generatePassword(passwordLength) {
            var numberChars = "0123456789";
            var upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            var lowerChars = "abcdefghijklmnopqrstuvwxyz";
            var specialChars = "#?!@$%^&*-";
            var allChars = numberChars + upperChars + lowerChars + specialChars;
            var randPasswordArray = Array(passwordLength);
            randPasswordArray[0] = numberChars;
            randPasswordArray[1] = upperChars;
            randPasswordArray[2] = lowerChars;
            randPasswordArray[3] = specialChars;
            randPasswordArray = randPasswordArray.fill(allChars, 4);
            return shuffleArray(randPasswordArray.map(function(x) { return x[Math.floor(Math.random() * x.length)] })).join('');
        }
        
        function shuffleArray(array) {
            for (var i = array.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            }
            return array;
        }

        return generatePassword(15);
    },
    back: function() {
        this.$router.go(-1);
    },
    register: async function() {
        const securePassword = this.generateSecureRandomPassword();

        try {
            if(await createUserInGoogle(this.email, securePassword)) {
                this.$router.push('/signin');
                this.hasError = false;
            } else {
                this.message = 'Unable to create account.';
                this.hasError = true;
            }
        } catch (e) {
            if (e.code === 'auth/email-already-in-use') {
                resendEmailWithLink(this.email);
                this.$router.push('/signin')
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
