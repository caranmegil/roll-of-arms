<template>
  <div v-if="$route.query.mode === 'signIn'" class="verify">
    <h1>Time to verify!</h1>
    <div v-if="hasError" class="error">Please make sure your email and username are correct!</div>
    <div class="verify-form">
        <div class="element">
            <label for="username">username</label>
            <input id="username" v-model="username" type="text"/>
        </div>
        <div class="element">
            <label for="email">email</label>
            <input id="email" v-model="email" type="text"/>
        </div>
        <button @click="verify">Verify</button>
    </div>
  </div>
  <div v-if="$route.query.mode === 'resetPassword'" class="verify">
    <h1>Time to verify!</h1>
    <div v-if="hasPasswordMismatch" class="error">Please make sure your passwords match!</div>
    <div class="verify-form">
        <div class="element">
            <label for="password">password</label>
            <input id="password" v-model="password" type="password"/>
        </div>
        <div class="element">
            <label for="retype-password">Re-type password</label>
            <input id="retype-password" v-model="password2" type="password"/>
        </div>
        <button @click="resetPassword">Reset</button>
    </div>
  </div>
</template>

<script>
import {
    confirmPassword,
    getEntireCollection,
    getCurrentUser,
    saveCollectionByField,
    verifyEmailwithLink,
} from '@/firebase';
import {mapActions} from 'vuex';
import 'es6-promise/auto';

export default {
    name: 'Auth',
    data() {
        return {
            password: null,
            password2: null,
            username: null,
            email: null,
            hasError: false,
            hasPasswordMismatch: false,
        }
    },
    methods: {
        ...mapActions(['setUser']),
        resetPassword: async function() {
            if (this.password === this.password2) {
                this.hasPasswordMismatch = false;

                if(await confirmPassword(this.$route.query.oobCode, this.password)) {
                    this.$router.push('/signin');
                    this.hasError = false;
                } else {
                    this.hasError = true;
                }
            } else {
                this.hasPasswordMismatch = true;
            }
        },
        verify: async function() {
            let that = this;
            const actionCode = this.$route.query.oobCode;
            const usernames = await getEntireCollection('usernames');
            if ( (that.username !== '' || that.username != null) && !usernames[that.username]) {
                verifyEmailwithLink(that.email, actionCode).then(function() {
                    const user = getCurrentUser();
                    that.setUser(user);
                    saveCollectionByField('usernames', that.username, user.uid);
                    that.hasError = false;
                    that.$router.push('/');
                }).catch( function (e) {
                    that.hasError = true;
                    console.error('There was an exception while verifying email!', e);
                });
            } else {
                that.hasError = true;
            }
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