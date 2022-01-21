<template>
  <div class="verify">
    <h1>Time to verify!</h1>
    <div class="verify-form">
        <div class="element">
            Unfortunately, your account is not verified and we cannot proceed with sign in.  There 
            should be a verification email sent to the email account <strong>{{$store.state.credentials.email}}</strong>.  If you do not have this,
            please check your spam or junk folder.  Otherwise, press the button below.
        </div>
        <button @click="resendVerification">Send Verification</button>
    </div>
  </div>
</template>

<script>
import {
    resendEmailWithLink
} from '@/firebase';
import 'es6-promise/auto';

export default {
    name: 'VerificationFailure',
    methods: {
        async resendVerification() {
            resendEmailWithLink(this.$store.state.credentials.email)
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