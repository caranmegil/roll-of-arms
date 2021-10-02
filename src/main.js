import { createApp } from 'vue'
import { createStore } from 'vuex';

import App from './App.vue'

import authConfig from './auth/auth_config.json';
import { setupAuth } from './auth';

const store = createStore({
    state() {
        return {
        };
    },
    mutations: {
    },
    actions: {
    },
});

function callbackRedirect() {
}

let app = createApp(App);
setupAuth( authConfig, callbackRedirect ).then( (auth) => {
    app.use(store);
    app.use(auth);
    app.mount('#app');
})
