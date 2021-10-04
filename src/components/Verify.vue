<template>
  <div class="verify">
    <h1>Time to verify!</h1>
    <div v-if="hasError" class="error">Please make sure your email is correct!</div>
    <div class="verify-form">
        <div class="element">
            <label for="email">email</label>
            <input id="email" type="text"/>
        </div>
        <button @click="verify">Verify</button>
    </div>
  </div>
</template>

<script>
import {
  verifyEmailwithLink,
} from '@/firebase';
import {mapActions} from 'vuex';
import 'es6-promise/auto';

export default {
    name: 'Verify',
    data() {
        return {
            hasError: false,
        }
    },
    methods: {
        ...mapActions(['setUser']),
        verify: function() {
            const email = document.getElementById('email').value;
            let that = this;

            verifyEmailwithLink(email).then(function() {
                that.hasError = false;
                that.$router.push('/signin');
            }).catch( function (e) {
                that.hasError = true;
                console.error('There was an exception while verifying email!', e);
            });
        },
    },
}

</script>

<style scoped>
    .verify {
        display: grid;
        grid-auto-flow: row;
        grid-template-columns: auto;
        gap: .5em;
    }

    .verify h1 {
        align-self: center;
        justify-self: center;
    }

    .verify-form {
        margin-top: 2em;
        display: grid;
        justify-self: center;
        align-content: center;
        justify-content: center;
        grid-auto-flow: row;
        gap: .5em;
    }

    .verify-form .element {
        align-self: center;
        justify-self: center;
        display: grid;
        grid-auto-flow: column;
        grid-template-columns: 1fr 1fr;
    }

    .verify-form .element > label {
        font-weight: bold;
        justify-self: start;
        align-self: start;
    }

    .error {
        align-self: center;
        justify-self: center;
        color: red;
    }
</style>