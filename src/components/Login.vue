<template>
  <div class="login">
    <h1>Login</h1>
    <form class="login-form">
        <div class="element">
            <label for="email">Email</label>
            <input id="email" type="text"/>
        </div>
        <div class="element">
            <label for="password">Password</label>
            <input id="password" type="password"/>
        </div>
    </form>
    <div class="bottom-links">
        <a href="./">Register</a>
        <a href="./">Forgot Password</a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  props: {
  }
}
</script>

<style scoped>
    h1 {
        text-align: center;
    }

    .login {
        height: 100%;
    }

    .login-form {
        display: grid;
        align-content: center;
        justify-content: center;
    }

    .login-form .element {
        align-self: center;
        justify-self: center;
        display: grid;
        grid-auto-flow: column;
        grid-template-columns: 1fr 1fr;
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

    .bottom-links {
        display: grid;
        align-content: center;
        justify-content: center;
        grid-auto-flow: column;
        gap: 1.25em;
    }
</style>
