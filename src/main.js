import { createApp } from 'vue'
import { createStore } from 'vuex';

import App from './App.vue'

const store = createStore({
    state() {
        return {
            isAuthenticated: false,
        };
    },
    mutations: {
        setAuthenticated(state, isAuthenticated) {
            state.isAuthenticated = isAuthenticated;
        },
    },
    actions: {
        setAuthenticated({commit}, isAuthenticated) {
            commit('setAuthenticated', isAuthenticated);
        }
    },
});

let app = createApp(App)
app.use(store);
app.mount('#app');
