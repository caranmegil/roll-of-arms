<template>
  <div v-if="$route.query.mode === 'signIn'" class="verify">
    <h1>Time to verify!</h1>
    In order for us to propertly verify your account, the email used during set up will need to be re-entered.
    <div v-if="hasError" class="error">{{message}}</div>
    <div class="verify-form">
        <div class="element">
            <label for="email">email</label>
            <input id="email" v-model="email" type="text"/>
        </div>
        <div class="element">
            <label for="username">username</label>
            <input id="username" v-model="username" type="text"/>
        </div>
        <div class="element">
            <label for="password">password</label>
            <input id="password" v-model="password" type="password"/>
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
    saveCollectionByField,
    verifyEmailWithLink,
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
            message: null,
        }
    },
    methods: {
        ...mapActions(['setUser', 'setCredentials']),
        resetPassword: async function() {
            if (this.password != null && this.password.trim() && this.password === this.password2) {
                this.hasPasswordMismatch = false;

                if(await confirmPassword(this.$route.query.oobCode, this.password)) {
                    this.hasError = false;
                    this.$router.push('/');
                } else {
                    this.message = 'There was an error while resetting the password!';
                    this.hasError = true;
                }
            } else {
                this.hasPasswordMismatch = true;
            }
        },
        verify: async function() {
            this.username = (this.username == null) ? '' :  this.username.trim() 

            if (this.username === '' || this.email === '') {
                this.message = 'Please make sure your username and email are correct!';
                this.hasError = true;
            } else if (this.password != null && this.password.trim() !== '') {
                let that = this;
                const actionCode = this.$route.query.oobCode;
                const usernames = await getEntireCollection('usernames');
                if ( !usernames[this.username] ) {
                    verifyEmailWithLink(this.email, this.password, actionCode).then(async function(user) {
                        if (saveCollectionByField('usernames', that.username, user.uid)) {
                            that.setUser(user);
                            that.setCredentials({email: that.email, password: that.password});
                            that.hasError = false;
                            that.$router.push('/');
                        } else {
                            that.message = 'There was an error while trying to verify your account!'
                            that.hasError = true;
                        }
                    }).catch( function (e) {
                        switch (e.code) {
                            case 'auth/expired-action-code':
                                that.message = 'The link you were sent is stale.';
                                break;
                            case 'auth/invalid-email':
                                that.message = 'An invalid email was entered.';
                                break;
                            case 'auth/user-disabled':
                                that.message = 'The account is disabled.';
                                break;
                            case 'auth/user-not-found':
                                that.message = 'The account was not found.';
                                break;
                            case 'auth/invalid-action-code':
                                that.message = 'The link is invalid or has already been used previously.';
                                break;
                            case 'auth/weak-password':
                                that.message = 'Please choose a stronger password that is at least 6 characters.';
                                break;
                            default:
                                that.message = 'There was an unknown error.  Please contact support at service2@sfr-inc.com'
                                console.error(e);
                                break;
                        }
                        that.hasError = true;
                    });
                } else {
                    this.message = 'Please make sure your username is correct!';
                    this.hasError = true;
                }
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